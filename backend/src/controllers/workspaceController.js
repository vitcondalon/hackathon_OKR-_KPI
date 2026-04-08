const { z } = require('zod');
const { query } = require('../config/db');
const { sendSuccess, sendCreated } = require('../utils/response');
const { mapDateOnlyFields, mapDateOnlyFieldsInList } = require('../utils/dateOnly');
const { assertEnglishBusinessPayload } = require('../utils/englishValidation');

const ratingLegend = [
  { min: 90, max: 100, code: 'excellent', label: 'Excellent' },
  { min: 80, max: 89.99, code: 'good', label: 'Good' },
  { min: 65, max: 79.99, code: 'meets_expectations', label: 'Meets expectations' },
  { min: 50, max: 64.99, code: 'needs_improvement', label: 'Needs improvement' },
  { min: 0, max: 49.99, code: 'does_not_meet_expectations', label: 'Does not meet expectations' }
];

const legacyRatingCodeMap = {
  xuat_sac: 'excellent',
  tot: 'good',
  dat: 'meets_expectations',
  can_cai_thien: 'needs_improvement',
  khong_dat: 'does_not_meet_expectations',
  not_rated: 'not_rated'
};

const ratingLabelByCode = {
  excellent: 'Excellent',
  good: 'Good',
  meets_expectations: 'Meets expectations',
  needs_improvement: 'Needs improvement',
  does_not_meet_expectations: 'Does not meet expectations',
  not_rated: 'Not rated'
};

const createPeriodSchema = z.object({
  code: z.string().trim().min(2).max(40).optional(),
  name: z.string().trim().min(2).max(255),
  period_type: z.enum(['monthly', 'quarterly', 'yearly']),
  start_date: z.string().trim().min(1),
  end_date: z.string().trim().min(1),
  status: z.enum(['planning', 'active', 'closed']).default('planning')
});

const createReviewSchema = z.object({
  employee_user_id: z.coerce.number().int().positive(),
  period_id: z.coerce.number().int().positive()
});

const createItemSchema = z.object({
  category: z.string().trim().min(2).max(160),
  project_code: z.string().trim().max(80).optional(),
  project_name: z.string().trim().max(255).optional(),
  description: z.string().trim().max(5000).optional(),
  weight: z.coerce.number().min(0.01).max(7).default(1),
  plan_percent: z.coerce.number().min(0).max(100).nullable().optional(),
  actual_percent: z.coerce.number().min(0).max(100).nullable().optional(),
  evidence_note: z.string().trim().max(5000).optional(),
  manager_note: z.string().trim().max(5000).optional(),
  is_required: z.boolean().optional()
});

const updateItemSchema = createItemSchema.partial().extend({
  is_locked: z.boolean().optional()
});

const commentSchema = z.object({
  comment_type: z.enum(['employee_self', 'manager', 'hr', 'final']).optional(),
  content: z.string().trim().min(1).max(6000)
});

const actionSchema = z.object({
  action: z.enum(['submit', 'return', 'manager_approve', 'hr_approve', 'approve', 'lock', 'unlock']),
  note: z.string().trim().max(2000).optional()
});

function isAdmin(user) {
  return user.role === 'admin';
}

function isHr(user) {
  return user.role === 'hr';
}

function isManager(user) {
  return user.role === 'manager';
}

function isEmployee(user) {
  return user.role === 'employee';
}

function canManage(user) {
  return isAdmin(user) || isHr(user) || isManager(user);
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) return null;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

function normalizeRatingCode(value) {
  if (value === null || value === undefined) return 'not_rated';
  const raw = String(value).trim();
  if (!raw) return 'not_rated';
  return legacyRatingCodeMap[raw] || raw;
}

function labelForRatingCode(value) {
  return ratingLabelByCode[normalizeRatingCode(value)] || 'Not rated';
}

function mapRatingFields(row) {
  if (!row) return row;
  const next = { ...row };
  if (Object.prototype.hasOwnProperty.call(next, 'rating_level')) {
    next.rating_level = normalizeRatingCode(next.rating_level);
  }
  if (Object.prototype.hasOwnProperty.call(next, 'rating_label') || Object.prototype.hasOwnProperty.call(next, 'rating_level')) {
    next.rating_label = labelForRatingCode(next.rating_label || next.rating_level);
  }
  return next;
}

function mapRatingFieldsInList(rows) {
  return rows.map((row) => mapRatingFields(row));
}

function normalizeDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function localToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function normalizePeriodRange(periodType, anchorDate) {
  const normalizedAnchor = normalizeDate(anchorDate);
  if (!normalizedAnchor) return null;

  const base = new Date(`${normalizedAnchor}T00:00:00`);
  if (Number.isNaN(base.getTime())) return null;

  let start = new Date(base.getFullYear(), base.getMonth(), 1);
  let end = new Date(base.getFullYear(), base.getMonth() + 1, 0);

  if (periodType === 'quarterly') {
    const quarterStartMonth = Math.floor(base.getMonth() / 3) * 3;
    start = new Date(base.getFullYear(), quarterStartMonth, 1);
    end = new Date(base.getFullYear(), quarterStartMonth + 3, 0);
  }

  if (periodType === 'yearly') {
    start = new Date(base.getFullYear(), 0, 1);
    end = new Date(base.getFullYear(), 12, 0);
  }

  return {
    startDate: normalizeDate(start),
    endDate: normalizeDate(end)
  };
}

function employeeCanEditByDate(user, review) {
  if (!isEmployee(user) || !review?.start_date || !review?.end_date) {
    return true;
  }

  const today = localToday();
  return today >= review.start_date && today <= review.end_date;
}

function assertEmployeeEditWindow(user, review) {
  if (!isEmployee(user) || !review?.start_date || !review?.end_date) {
    return;
  }

  const today = localToday();

  if (today < review.start_date) {
    const error = new Error('Chưa đến thời gian cập nhật dữ liệu cho chu kỳ đánh giá này');
    error.status = 400;
    throw error;
  }

  if (today > review.end_date) {
    const error = new Error('Đã hết thời gian cập nhật dữ liệu cho chu kỳ đánh giá này. Vui lòng liên hệ quản trị viên nếu cần điều chỉnh');
    error.status = 400;
    throw error;
  }
}

function ratingForScore(score) {
  const safe = clamp(Number(score), 0, 100);
  if (safe === null) return { code: 'not_rated', label: 'Not rated' };
  for (const item of ratingLegend) {
    if (safe >= item.min && safe <= item.max) {
      return { code: item.code, label: item.label };
    }
  }
  return { code: 'not_rated', label: 'Not rated' };
}

function buildPeriodCode(periodType, startDate) {
  const date = new Date(startDate);
  const year = date.getUTCFullYear();
  if (periodType === 'yearly') return `${year}-Y`;
  if (periodType === 'monthly') return `${year}-M${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `${year}-Q${quarter}`;
}

function buildAchievement(planPercent, actualPercent) {
  const plan = planPercent === null || planPercent === undefined ? null : Number(planPercent);
  const actual = actualPercent === null || actualPercent === undefined ? null : Number(actualPercent);
  if (!Number.isFinite(plan) || !Number.isFinite(actual)) return null;
  if (plan <= 0) return clamp(actual, 0, 100);
  return clamp((actual / plan) * 100, 0, 100);
}

function cleanText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function resolveCommentType(role) {
  if (role === 'employee') return 'employee_self';
  if (role === 'manager') return 'manager';
  if (role === 'hr') return 'hr';
  return 'final';
}

function assertReviewAccess(user, review) {
  if (!review) {
    const error = new Error('Không tìm thấy hồ sơ đánh giá');
    error.status = 404;
    throw error;
  }
  if (isAdmin(user) || isHr(user)) return;
  if (isManager(user) && Number(review.manager_user_id) === Number(user.id)) return;
  if (isEmployee(user) && Number(review.employee_user_id) === Number(user.id)) return;
  const error = new Error('Bạn không có quyền thực hiện thao tác này');
  error.status = 403;
  throw error;
}

async function visibleEmployees(user) {
  const params = [];
  let where = `u.deleted_at IS NULL AND u.is_active = TRUE AND r.code <> 'admin'`;

  if (isEmployee(user)) {
    params.push(user.id);
    where += ` AND u.id = $${params.length}`;
  } else if (isManager(user)) {
    params.push(user.id);
    where += ` AND (u.id = $${params.length} OR u.manager_user_id = $${params.length} OR u.department_id IN (
      SELECT id FROM departments WHERE manager_user_id = $${params.length}
    ))`;
  }

  const result = await query(
    `SELECT
       u.id,
       u.employee_code,
       u.full_name,
       u.username,
       u.email,
       r.code AS role,
       u.department_id,
       d.name AS department_name,
       COALESCE(
         u.manager_user_id,
         CASE
           WHEN r.code = 'employee' THEN d.manager_user_id
           WHEN r.code IN ('manager', 'hr') THEN admin_user.id
           ELSE NULL
         END
       ) AS manager_user_id,
       COALESCE(
         m.full_name,
         CASE
           WHEN r.code = 'employee' THEN dm.full_name
           WHEN r.code IN ('manager', 'hr') THEN admin_user.full_name
           ELSE NULL
         END
       ) AS manager_name,
       u.created_at
     FROM users u
     JOIN roles r ON r.id = u.role_id
     LEFT JOIN departments d ON d.id = u.department_id
     LEFT JOIN users m ON m.id = u.manager_user_id
     LEFT JOIN users dm ON dm.id = d.manager_user_id
     LEFT JOIN LATERAL (
       SELECT admin_u.id, admin_u.full_name
       FROM users admin_u
       JOIN roles admin_r ON admin_r.id = admin_u.role_id
       WHERE admin_u.deleted_at IS NULL
         AND admin_u.is_active = TRUE
         AND admin_r.code = 'admin'
       ORDER BY admin_u.id ASC
       LIMIT 1
     ) admin_user ON TRUE
     WHERE ${where}
     ORDER BY d.name NULLS LAST, u.full_name`,
    params
  );

  return result.rows;
}

async function getReviewSummary(reviewId) {
  const result = await query(
    `SELECT
       er.id,
       er.period_id,
       er.employee_user_id,
       er.department_id,
       er.manager_user_id,
       er.status,
       er.total_weight,
       er.total_score,
       er.rating_level,
       er.locked_at,
       er.updated_at,
       u.full_name AS employee_name,
       u.employee_code,
       u.email AS employee_email,
       d.name AS department_name,
       m.full_name AS manager_name,
       rp.code AS period_code,
       rp.name AS period_name,
       rp.period_type,
       rp.start_date,
       rp.end_date
     FROM employee_reviews er
     JOIN users u ON u.id = er.employee_user_id
     LEFT JOIN users m ON m.id = er.manager_user_id
     LEFT JOIN departments d ON d.id = er.department_id
     JOIN review_periods rp ON rp.id = er.period_id
     WHERE er.id = $1`,
    [reviewId]
  );
  return result.rows[0] ? mapRatingFields(mapDateOnlyFields(result.rows[0], ['start_date', 'end_date'])) : null;
}

async function getReviewByScope(employeeUserId, periodId) {
  const result = await query(
    `SELECT id
     FROM employee_reviews
     WHERE employee_user_id = $1
       AND period_id = $2`,
    [employeeUserId, periodId]
  );
  return result.rows[0] ? Number(result.rows[0].id) : null;
}

async function refreshReviewTotals(reviewId) {
  const totals = await query(
    `SELECT
       COALESCE(SUM(weight), 0) AS total_weight,
       COALESCE(SUM(weighted_score), 0) AS weighted_total
     FROM employee_review_items
     WHERE review_id = $1`,
    [reviewId]
  );
  const totalWeight = toNumber(totals.rows[0]?.total_weight, 0);
  const weightedTotal = toNumber(totals.rows[0]?.weighted_total, 0);
  const totalScore = totalWeight > 0 ? clamp(weightedTotal / totalWeight, 0, 100) : 0;
  const rating = ratingForScore(totalScore);

  await query(
    `UPDATE employee_reviews
     SET total_weight = $1,
         total_score = $2,
         rating_level = $3
     WHERE id = $4`,
    [Number(totalWeight.toFixed(2)), Number(totalScore.toFixed(2)), rating.code, reviewId]
  );
}

async function buildReviewPayload(reviewId) {
  const summary = await getReviewSummary(reviewId);
  if (!summary) return null;

  const [items, comments, approvals, periodHistory, projectHistory] = await Promise.all([
    query(
      `SELECT
         id,
         review_id,
         item_order,
         category,
         project_code,
         project_name,
         description,
         weight,
         plan_percent,
         actual_percent,
         achievement_score,
         weighted_score,
         evidence_note,
         manager_note,
         is_required,
         is_locked,
         locked_at,
         updated_by_user_id,
         updated_at
       FROM employee_review_items
       WHERE review_id = $1
       ORDER BY item_order ASC, id ASC`,
      [reviewId]
    ),
    query(
      `SELECT
         rc.id,
         rc.comment_type,
         rc.content,
         rc.created_at,
         rc.author_user_id,
         u.full_name AS author_name
       FROM review_comments rc
       LEFT JOIN users u ON u.id = rc.author_user_id
       WHERE rc.review_id = $1
       ORDER BY rc.created_at ASC, rc.id ASC`,
      [reviewId]
    ),
    query(
      `SELECT
         ra.id,
         ra.action_type,
         ra.note,
         ra.created_at,
         ra.actor_user_id,
         u.full_name AS actor_name
       FROM review_approvals ra
       LEFT JOIN users u ON u.id = ra.actor_user_id
       WHERE ra.review_id = $1
       ORDER BY ra.created_at ASC, ra.id ASC`,
      [reviewId]
    ),
    query(
      `SELECT
         er.id,
         rp.code AS period_code,
         rp.name AS period_name,
         rp.period_type,
         er.status,
         er.total_score,
         er.rating_level,
         er.locked_at,
         er.updated_at
       FROM employee_reviews er
       JOIN review_periods rp ON rp.id = er.period_id
       WHERE er.employee_user_id = $1
       ORDER BY rp.start_date DESC, er.id DESC
       LIMIT 8`,
      [summary.employee_user_id]
    ),
    query(
      `SELECT
         p.code AS project_code,
         p.name AS project_name,
         p.status AS project_status,
         ep.role_name,
         ep.contribution_note,
         ep.assigned_at,
         ep.released_at
       FROM employee_projects ep
       JOIN projects p ON p.id = ep.project_id
       WHERE ep.employee_user_id = $1
       ORDER BY COALESCE(ep.released_at, CURRENT_DATE) DESC, ep.assigned_at DESC`,
      [summary.employee_user_id]
    )
  ]);

  const rating = ratingForScore(summary.total_score);
  return {
    ...summary,
    rating_label: rating.label,
    items: items.rows,
    comments: comments.rows,
    approvals: approvals.rows,
    period_history: mapRatingFieldsInList(periodHistory.rows),
    project_history: mapDateOnlyFieldsInList(projectHistory.rows, ['assigned_at', 'released_at'])
  };
}

async function bootstrap(req, res, next) {
  try {
    const [employees, periods, departments] = await Promise.all([
      visibleEmployees(req.user),
      query(`SELECT id, code, name, period_type, start_date, end_date, status FROM review_periods ORDER BY start_date DESC, id DESC`),
      query(`SELECT id, code, name FROM departments WHERE is_active = TRUE ORDER BY name`)
    ]);

    const activePeriod = periods.rows.find((item) => item.status === 'active') || periods.rows[0] || null;
    const requestedEmployeeId = Number(req.query.employee_id);
    const requestedPeriodId = Number(req.query.period_id);
    const selectedPeriodId = Number.isInteger(requestedPeriodId) && periods.rows.some((item) => Number(item.id) === requestedPeriodId)
      ? requestedPeriodId
      : (activePeriod ? Number(activePeriod.id) : null);

    let reviewedEmployeeIds = new Set();
    if (selectedPeriodId) {
      const reviewedRows = await query(
        `SELECT employee_user_id
         FROM employee_reviews
         WHERE period_id = $1`,
        [selectedPeriodId]
      );
      reviewedEmployeeIds = new Set(reviewedRows.rows.map((row) => Number(row.employee_user_id)));
    }

    const fallbackEmployee =
      employees.find((item) => reviewedEmployeeIds.has(Number(item.id))) ||
      employees.find((item) => item.role === 'employee') ||
      employees[0] ||
      null;

    const selectedEmployeeId = Number.isInteger(requestedEmployeeId) && employees.some((item) => Number(item.id) === requestedEmployeeId)
      ? requestedEmployeeId
      : (fallbackEmployee ? Number(fallbackEmployee.id) : null);

    let review = null;
    if (selectedEmployeeId && selectedPeriodId) {
      const reviewId = await getReviewByScope(selectedEmployeeId, selectedPeriodId);
      review = reviewId ? await buildReviewPayload(reviewId) : null;
    }

    return sendSuccess(res, {
      company: { name: 'Company', login_rule: 'EMP-ENG-001@company' },
      viewer: req.user,
      permissions: {
        can_select_employee: canManage(req.user),
        can_create_review: canManage(req.user),
        can_lock: isAdmin(req.user) || isHr(req.user),
        can_unlock: isAdmin(req.user)
      },
      selected: {
        employee_user_id: selectedEmployeeId,
        period_id: selectedPeriodId
      },
      employees,
      periods: mapDateOnlyFieldsInList(periods.rows, ['start_date', 'end_date']),
      departments: departments.rows,
      rating_legend: ratingLegend,
      review
    });
  } catch (error) {
    return next(error);
  }
}

async function createPeriod(req, res, next) {
  try {
    if (!canManage(req.user)) {
      const error = new Error('Bạn không có quyền thực hiện thao tác này');
      error.status = 403;
      throw error;
    }

    const payload = createPeriodSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      code: 'Review period code',
      name: 'Review period name'
    });
    const normalizedRange = normalizePeriodRange(payload.period_type, payload.start_date);
    const startDate = normalizedRange?.startDate || null;
    const endDate = normalizedRange?.endDate || null;
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate)) {
      const error = new Error('Khoảng thời gian của chu kỳ đánh giá không hợp lệ');
      error.status = 400;
      throw error;
    }

    const seedCode = (payload.code || buildPeriodCode(payload.period_type, startDate)).toUpperCase();
    let code = seedCode;
    let suffix = 1;
    while (true) {
      const exists = await query(`SELECT id FROM review_periods WHERE code = $1`, [code]);
      if (exists.rowCount === 0) break;
      code = `${seedCode}-${suffix}`;
      suffix += 1;
    }

    const result = await query(
      `INSERT INTO review_periods (code, name, period_type, start_date, end_date, status, created_by_user_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       RETURNING *`,
      [code, payload.name, payload.period_type, startDate, endDate, payload.status, req.user.id]
    );
    return sendCreated(res, mapDateOnlyFields(result.rows[0], ['start_date', 'end_date']), 'Đã khởi tạo chu kỳ đánh giá');
  } catch (error) {
    return next(error);
  }
}

async function createReview(req, res, next) {
  try {
    if (!canManage(req.user)) {
      const error = new Error('Bạn không có quyền thực hiện thao tác này');
      error.status = 403;
      throw error;
    }

    const payload = createReviewSchema.parse(req.body);
    const employees = await visibleEmployees(req.user);
    if (!employees.some((item) => Number(item.id) === Number(payload.employee_user_id))) {
      const error = new Error('Nhân sự được chọn không thuộc phạm vi phụ trách của bạn');
      error.status = 403;
      throw error;
    }

    const period = await query(`SELECT id FROM review_periods WHERE id = $1`, [payload.period_id]);
    if (period.rowCount === 0) {
      const error = new Error('Không tìm thấy chu kỳ đánh giá');
      error.status = 404;
      throw error;
    }

    const existingId = await getReviewByScope(payload.employee_user_id, payload.period_id);
    if (existingId) {
      const current = await buildReviewPayload(existingId);
      return sendSuccess(res, current, 'Hồ sơ đánh giá đã tồn tại');
    }

    const owner = await query(
      `SELECT
         u.id,
         u.department_id,
         COALESCE(
           u.manager_user_id,
           CASE
             WHEN r.code = 'employee' THEN d.manager_user_id
             WHEN r.code IN ('manager', 'hr') THEN admin_user.id
             ELSE NULL
           END
         ) AS manager_user_id
       FROM users u
       JOIN roles r ON r.id = u.role_id
       LEFT JOIN departments d ON d.id = u.department_id
       LEFT JOIN LATERAL (
         SELECT admin_u.id
         FROM users admin_u
         JOIN roles admin_r ON admin_r.id = admin_u.role_id
         WHERE admin_u.deleted_at IS NULL
           AND admin_u.is_active = TRUE
           AND admin_r.code = 'admin'
         ORDER BY admin_u.id ASC
         LIMIT 1
       ) admin_user ON TRUE
       WHERE u.id = $1
         AND u.deleted_at IS NULL
         AND u.is_active = TRUE`,
      [payload.employee_user_id]
    );
    if (owner.rowCount === 0) {
      const error = new Error('Không tìm thấy nhân sự');
      error.status = 404;
      throw error;
    }

    const created = await query(
      `INSERT INTO employee_reviews (
         period_id,
         employee_user_id,
         department_id,
         manager_user_id,
         status,
         created_by_user_id
       ) VALUES ($1,$2,$3,$4,'draft',$5)
       RETURNING id`,
      [
        payload.period_id,
        payload.employee_user_id,
        owner.rows[0].department_id || null,
        owner.rows[0].manager_user_id || null,
        req.user.id
      ]
    );

    const reviewId = Number(created.rows[0].id);
    const defaults = [
      { order: 1, category: 'Project KPI', weight: 3 },
      { order: 2, category: 'Work Quality', weight: 2 },
      { order: 3, category: 'Discipline and Collaboration', weight: 2 }
    ];

    for (const item of defaults) {
      await query(
        `INSERT INTO employee_review_items (review_id, item_order, category, weight, is_required, updated_by_user_id)
         VALUES ($1,$2,$3,$4,TRUE,$5)`,
        [reviewId, item.order, item.category, item.weight, req.user.id]
      );
    }

    await refreshReviewTotals(reviewId);
    const response = await buildReviewPayload(reviewId);
    return sendCreated(res, response, 'Đã khởi tạo hồ sơ đánh giá');
  } catch (error) {
    return next(error);
  }
}

async function addReviewItem(req, res, next) {
  try {
    if (!canManage(req.user)) {
      const error = new Error('Bạn không có quyền thực hiện thao tác này');
      error.status = 403;
      throw error;
    }

    const reviewId = Number(req.params.reviewId);
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      const error = new Error('Mã hồ sơ đánh giá không hợp lệ');
      error.status = 400;
      throw error;
    }

    const payload = createItemSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      category: 'Review category',
      project_code: 'Project code',
      project_name: 'Project name',
      description: 'Review description',
      evidence_note: 'Evidence note',
      manager_note: 'Manager note'
    });
    const review = await getReviewSummary(reviewId);
    assertReviewAccess(req.user, review);
    if (review.status === 'locked' && !isAdmin(req.user)) {
      const error = new Error('Hồ sơ đánh giá đã bị khóa');
      error.status = 403;
      throw error;
    }

    const nextOrder = await query(
      `SELECT COALESCE(MAX(item_order), 0) + 1 AS next_order
       FROM employee_review_items
       WHERE review_id = $1`,
      [reviewId]
    );

    const achievement = buildAchievement(payload.plan_percent ?? null, payload.actual_percent ?? null);
    const weighted = achievement === null ? null : Number((achievement * Number(payload.weight)).toFixed(2));

    await query(
      `INSERT INTO employee_review_items (
         review_id,
         item_order,
         category,
         project_code,
         project_name,
         description,
         weight,
         plan_percent,
         actual_percent,
         achievement_score,
         weighted_score,
         evidence_note,
         manager_note,
         is_required,
         updated_by_user_id
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        reviewId,
        Number(nextOrder.rows[0].next_order),
        payload.category,
        cleanText(payload.project_code),
        cleanText(payload.project_name),
        cleanText(payload.description),
        payload.weight,
        payload.plan_percent ?? null,
        payload.actual_percent ?? null,
        achievement,
        weighted,
        cleanText(payload.evidence_note),
        cleanText(payload.manager_note),
        payload.is_required !== false,
        req.user.id
      ]
    );

    await refreshReviewTotals(reviewId);
    const response = await buildReviewPayload(reviewId);
    return sendCreated(res, response, 'Đã bổ sung tiêu chí đánh giá');
  } catch (error) {
    return next(error);
  }
}

async function deleteReviewItem(req, res, next) {
  try {
    if (!canManage(req.user)) {
      const error = new Error('Báº¡n khÃ´ng cÃ³ quyá»n thá»±c hiá»‡n thao tÃ¡c nÃ y');
      error.status = 403;
      throw error;
    }

    const reviewId = Number(req.params.reviewId);
    const itemId = Number(req.params.itemId);
    if (!Number.isInteger(reviewId) || reviewId <= 0 || !Number.isInteger(itemId) || itemId <= 0) {
      const error = new Error('Tham chiáº¿u tiÃªu chÃ­ Ä‘Ã¡nh giÃ¡ khÃ´ng há»£p lá»‡');
      error.status = 400;
      throw error;
    }

    const [review, item] = await Promise.all([
      getReviewSummary(reviewId),
      query(`SELECT * FROM employee_review_items WHERE id = $1 AND review_id = $2`, [itemId, reviewId])
    ]);
    assertReviewAccess(req.user, review);
    if (item.rowCount === 0) {
      const error = new Error('KhÃ´ng tÃ¬m tháº¥y tiÃªu chÃ­ Ä‘Ã¡nh giÃ¡');
      error.status = 404;
      throw error;
    }

    const current = item.rows[0];
    if (review.status === 'locked' && !isAdmin(req.user)) {
      const error = new Error('Há»“ sÆ¡ Ä‘Ã¡nh giÃ¡ Ä‘Ã£ bá»‹ khÃ³a');
      error.status = 403;
      throw error;
    }
    if (current.is_locked && !isAdmin(req.user)) {
      const error = new Error('TiÃªu chÃ­ Ä‘Ã¡nh giÃ¡ nÃ y Ä‘Ã£ bá»‹ khÃ³a');
      error.status = 403;
      throw error;
    }

    await query(
      `DELETE FROM employee_review_items
       WHERE id = $1
         AND review_id = $2`,
      [itemId, reviewId]
    );

    await query(
      `WITH ordered AS (
         SELECT
           id,
           ROW_NUMBER() OVER (ORDER BY item_order ASC, id ASC) AS next_order
         FROM employee_review_items
         WHERE review_id = $1
       )
       UPDATE employee_review_items eri
       SET item_order = ordered.next_order
       FROM ordered
       WHERE eri.id = ordered.id
         AND eri.item_order <> ordered.next_order`,
      [reviewId]
    );

    await refreshReviewTotals(reviewId);
    const response = await buildReviewPayload(reviewId);
    return sendSuccess(res, response, 'ÄÃ£ xÃ³a tiÃªu chÃ­ Ä‘Ã¡nh giÃ¡');
  } catch (error) {
    return next(error);
  }
}

async function updateReviewItem(req, res, next) {
  try {
    const reviewId = Number(req.params.reviewId);
    const itemId = Number(req.params.itemId);
    if (!Number.isInteger(reviewId) || reviewId <= 0 || !Number.isInteger(itemId) || itemId <= 0) {
      const error = new Error('Tham chiếu tiêu chí đánh giá không hợp lệ');
      error.status = 400;
      throw error;
    }

    const payload = updateItemSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      category: 'Review category',
      project_code: 'Project code',
      project_name: 'Project name',
      description: 'Review description',
      evidence_note: 'Evidence note',
      manager_note: 'Manager note'
    });
    const [review, item] = await Promise.all([
      getReviewSummary(reviewId),
      query(`SELECT * FROM employee_review_items WHERE id = $1 AND review_id = $2`, [itemId, reviewId])
    ]);
    assertReviewAccess(req.user, review);
    if (item.rowCount === 0) {
      const error = new Error('Không tìm thấy tiêu chí đánh giá');
      error.status = 404;
      throw error;
    }
    const current = item.rows[0];
    if (review.status === 'locked' && !isAdmin(req.user)) {
      const error = new Error('Hồ sơ đánh giá đã bị khóa');
      error.status = 403;
      throw error;
    }
    if (current.is_locked && !isAdmin(req.user)) {
      const error = new Error('Tiêu chí đánh giá này đã bị khóa');
      error.status = 403;
      throw error;
    }
    assertEmployeeEditWindow(req.user, review);
    if (isEmployee(req.user) && Number(review.employee_user_id) !== Number(req.user.id)) {
      const error = new Error('Nhân viên chỉ được cập nhật hồ sơ của chính mình');
      error.status = 403;
      throw error;
    }

    const employeeFields = new Set(['project_code', 'project_name', 'description', 'plan_percent', 'actual_percent', 'evidence_note']);
    if (isEmployee(req.user)) {
      for (const key of Object.keys(payload)) {
        if (!employeeFields.has(key)) {
          const error = new Error(`Nhân viên không thể chỉnh sửa trường dữ liệu: ${key}`);
          error.status = 403;
          throw error;
        }
      }
    }

    const weight = Object.prototype.hasOwnProperty.call(payload, 'weight') ? payload.weight : Number(current.weight);
    const planPercent = Object.prototype.hasOwnProperty.call(payload, 'plan_percent') ? payload.plan_percent : current.plan_percent;
    const actualPercent = Object.prototype.hasOwnProperty.call(payload, 'actual_percent') ? payload.actual_percent : current.actual_percent;
    const achievement = buildAchievement(planPercent, actualPercent);
    const weighted = achievement === null ? null : Number((achievement * Number(weight)).toFixed(2));
    const isLocked = Object.prototype.hasOwnProperty.call(payload, 'is_locked') ? payload.is_locked : current.is_locked;

    if (Object.prototype.hasOwnProperty.call(payload, 'is_locked') && !(isAdmin(req.user) || isHr(req.user) || isManager(req.user))) {
      const error = new Error('Bạn không thể thay đổi trạng thái khóa của tiêu chí này');
      error.status = 403;
      throw error;
    }

    await query(
      `UPDATE employee_review_items
       SET category = $1,
           project_code = $2,
           project_name = $3,
           description = $4,
           weight = $5,
           plan_percent = $6,
           actual_percent = $7,
           achievement_score = $8,
           weighted_score = $9,
           evidence_note = $10,
           manager_note = $11,
           is_required = $12,
           is_locked = $13,
           locked_at = CASE WHEN $13 = TRUE THEN COALESCE(locked_at, NOW()) ELSE NULL END,
           updated_by_user_id = $14
       WHERE id = $15
         AND review_id = $16`,
      [
        Object.prototype.hasOwnProperty.call(payload, 'category') ? payload.category : current.category,
        Object.prototype.hasOwnProperty.call(payload, 'project_code') ? cleanText(payload.project_code) : current.project_code,
        Object.prototype.hasOwnProperty.call(payload, 'project_name') ? cleanText(payload.project_name) : current.project_name,
        Object.prototype.hasOwnProperty.call(payload, 'description') ? cleanText(payload.description) : current.description,
        weight,
        planPercent,
        actualPercent,
        achievement,
        weighted,
        Object.prototype.hasOwnProperty.call(payload, 'evidence_note') ? cleanText(payload.evidence_note) : current.evidence_note,
        Object.prototype.hasOwnProperty.call(payload, 'manager_note') ? cleanText(payload.manager_note) : current.manager_note,
        Object.prototype.hasOwnProperty.call(payload, 'is_required') ? payload.is_required : current.is_required,
        isLocked,
        req.user.id,
        itemId,
        reviewId
      ]
    );

    await refreshReviewTotals(reviewId);
    const response = await buildReviewPayload(reviewId);
    return sendSuccess(res, response, 'Đã cập nhật tiêu chí đánh giá');
  } catch (error) {
    return next(error);
  }
}

async function addReviewComment(req, res, next) {
  try {
    const reviewId = Number(req.params.reviewId);
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      const error = new Error('Mã hồ sơ đánh giá không hợp lệ');
      error.status = 400;
      throw error;
    }

    const payload = commentSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      content: 'Review comment'
    });
    const review = await getReviewSummary(reviewId);
    assertReviewAccess(req.user, review);

    const roleType = resolveCommentType(req.user.role);
    const commentType = payload.comment_type || roleType;
    if (!isAdmin(req.user) && commentType !== roleType) {
      const error = new Error('Loại nhận xét này không phù hợp với quyền hiện tại của bạn');
      error.status = 403;
      throw error;
    }

    await query(
      `INSERT INTO review_comments (review_id, comment_type, content, author_user_id)
       VALUES ($1,$2,$3,$4)`,
      [reviewId, commentType, payload.content, req.user.id]
    );

    const response = await buildReviewPayload(reviewId);
    return sendCreated(res, response, 'Đã ghi nhận nhận xét');
  } catch (error) {
    return next(error);
  }
}

async function applyReviewAction(req, res, next) {
  try {
    const reviewId = Number(req.params.reviewId);
    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      const error = new Error('Mã hồ sơ đánh giá không hợp lệ');
      error.status = 400;
      throw error;
    }

    const payload = actionSchema.parse(req.body);
    assertEnglishBusinessPayload(payload, {
      note: 'Approval note'
    });
    const review = await getReviewSummary(reviewId);
    assertReviewAccess(req.user, review);

    if (payload.action === 'unlock' && !isAdmin(req.user)) {
      const error = new Error('Chỉ quản trị viên mới có quyền mở khóa hồ sơ');
      error.status = 403;
      throw error;
    }
    if (['approve', 'hr_approve', 'lock'].includes(payload.action) && !(isAdmin(req.user) || isHr(req.user))) {
      const error = new Error('Chỉ quản trị viên hoặc bộ phận nhân sự mới có thể thực hiện thao tác này');
      error.status = 403;
      throw error;
    }
    if (['manager_approve', 'return'].includes(payload.action) && !(isAdmin(req.user) || isHr(req.user) || isManager(req.user))) {
      const error = new Error('Chỉ quản lý, nhân sự hoặc quản trị viên mới có thể thực hiện thao tác này');
      error.status = 403;
      throw error;
    }
    if (isManager(req.user) && ['manager_approve', 'return'].includes(payload.action) && Number(review.manager_user_id) !== Number(req.user.id)) {
      const error = new Error('Bạn không phải người quản lý được phân công cho hồ sơ này');
      error.status = 403;
      throw error;
    }
    if (payload.action === 'submit' && isEmployee(req.user) && Number(review.employee_user_id) !== Number(req.user.id)) {
      const error = new Error('Nhân viên chỉ được gửi duyệt hồ sơ của chính mình');
      error.status = 403;
      throw error;
    }

    const transitions = {
      submit: ['draft', 'returned', 'employee_submitted'],
      manager_approve: ['employee_submitted', 'manager_reviewed'],
      hr_approve: ['manager_reviewed', 'hr_reviewed'],
      approve: ['manager_reviewed', 'hr_reviewed', 'approved'],
      return: ['employee_submitted', 'manager_reviewed', 'hr_reviewed', 'returned'],
      lock: ['approved', 'hr_reviewed', 'locked'],
      unlock: ['locked', 'approved']
    };

    if (!transitions[payload.action].includes(review.status)) {
      const error = new Error(`Không thể thực hiện thao tác "${payload.action}" khi hồ sơ đang ở trạng thái "${review.status}"`);
      error.status = 400;
      throw error;
    }

    const statusByAction = {
      submit: 'employee_submitted',
      manager_approve: 'manager_reviewed',
      hr_approve: 'hr_reviewed',
      approve: 'approved',
      return: 'returned',
      lock: 'locked',
      unlock: 'approved'
    };

    if (payload.action === 'submit') {
      const missing = await query(
        `SELECT item_order, category
         FROM employee_review_items
         WHERE review_id = $1
           AND is_required = TRUE
           AND (description IS NULL OR btrim(description) = '' OR plan_percent IS NULL OR actual_percent IS NULL)
         ORDER BY item_order ASC`,
        [reviewId]
      );
      if (missing.rowCount > 0) {
        const error = new Error('Hồ sơ chưa hoàn thiện. Vui lòng cập nhật đầy đủ các trường bắt buộc trước khi gửi duyệt');
        error.status = 400;
        error.errors = missing.rows.map((row) => ({ message: `Thiếu dữ liệu bắt buộc tại tiêu chí #${row.item_order} (${row.category})` }));
        throw error;
      }
      const weightResult = await query(
        `SELECT COALESCE(SUM(weight), 0) AS total_weight
         FROM employee_review_items
         WHERE review_id = $1`,
        [reviewId]
      );
      const totalWeight = toNumber(weightResult.rows[0]?.total_weight, 0);
      if (totalWeight <= 0 || totalWeight > 7) {
        const error = new Error('Tổng hệ số phải lớn hơn 0 và không vượt quá 7');
        error.status = 400;
        throw error;
      }
    }

    await query(
      `UPDATE employee_reviews
       SET status = $1,
           locked_at = CASE WHEN $1 = 'locked' THEN NOW() ELSE NULL END
       WHERE id = $2`,
      [statusByAction[payload.action], reviewId]
    );

    if (payload.action === 'lock') {
      await query(
        `UPDATE employee_review_items
         SET is_locked = TRUE,
             locked_at = COALESCE(locked_at, NOW())
         WHERE review_id = $1`,
        [reviewId]
      );
    }
    if (payload.action === 'unlock') {
      await query(
        `UPDATE employee_review_items
         SET is_locked = FALSE,
             locked_at = NULL
         WHERE review_id = $1`,
        [reviewId]
      );
    }

    await query(
      `INSERT INTO review_approvals (review_id, action_type, note, actor_user_id)
       VALUES ($1,$2,$3,$4)`,
      [reviewId, payload.action, cleanText(payload.note), req.user.id]
    );

    const response = await buildReviewPayload(reviewId);
    return sendSuccess(res, response, 'Đã cập nhật trạng thái hồ sơ');
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  bootstrap,
  createPeriod,
  createReview,
  addReviewItem,
  deleteReviewItem,
  updateReviewItem,
  addReviewComment,
  applyReviewAction
};
