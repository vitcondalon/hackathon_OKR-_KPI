BEGIN;

UPDATE departments
SET name = 'Engineering'
WHERE lower(name) IN ('ky thuat', 'kỹ thuật');

UPDATE departments
SET name = 'Sales'
WHERE lower(name) IN ('kinh doanh');

UPDATE departments
SET name = 'Human Resources'
WHERE lower(name) IN ('nhan su', 'nhân sự');

UPDATE review_periods
SET name = 'Month 03 / 2026'
WHERE lower(name) IN ('thang 03/2026', 'tháng 03/2026');

UPDATE review_periods
SET name = 'Quarter 2 / 2026'
WHERE lower(name) IN ('quy 2 nam 2026', 'quý 2 năm 2026');

UPDATE review_periods
SET name = 'Year 2026'
WHERE lower(name) IN ('nam 2026', 'năm 2026');

UPDATE employee_review_items
SET category = 'Project KPI'
WHERE lower(category) IN ('kpi du an', 'kpi dự án');

UPDATE employee_review_items
SET category = 'Discipline and Collaboration'
WHERE lower(category) IN ('ky luat va phoi hop', 'kỷ luật và phối hợp');

UPDATE employee_review_items
SET category = 'Improvement Initiative'
WHERE lower(category) IN ('sang kien cai tien', 'sáng kiến cải tiến');

UPDATE employee_review_items
SET description = 'Delivered the API upgrade target and stabilized the deployment flow.'
WHERE description = 'Dat muc tieu nang cap API va on dinh deploy.';

UPDATE employee_review_items
SET description = 'Maintained on-time updates and coordinated well with QA.'
WHERE description = 'Dam bao cap nhat dung han va phoi hop voi QA.';

UPDATE employee_review_items
SET description = 'Proposed improvements to the code review process.'
WHERE description = 'De xuat cai tien quy trinh review code.';

UPDATE employee_review_items
SET evidence_note = 'Benchmark report and release checklist were updated.'
WHERE evidence_note = 'Bao cao benchmark va checklist release da cap nhat.';

UPDATE employee_review_items
SET evidence_note = 'All check-ins were submitted on schedule.'
WHERE evidence_note = 'Tat ca check-in duoc cap nhat dung lich.';

UPDATE employee_review_items
SET evidence_note = 'The new review checklist has been applied.'
WHERE evidence_note = 'Da ap dung checklist review moi.';

UPDATE employee_review_items
SET manager_note = 'Progress is good. Keep reducing production issues.'
WHERE manager_note = 'Tien do tot, can tiep tuc giam loi production.';

UPDATE employee_review_items
SET manager_note = 'Should be more proactive when cross-team blockers appear.'
WHERE manager_note = 'Can chu dong hon khi co blocker lien phong ban.';

UPDATE employee_review_items
SET manager_note = 'The impact is clear. Continue rolling it out to the wider team.'
WHERE manager_note = 'Hieu qua ro ret, tiep tuc mo rong cho toan doi.';

UPDATE review_comments
SET content = 'Most goals were completed. Cross-team blocker handling speed still needs improvement.'
WHERE content = 'Da hoan thanh phan lon muc tieu, can cai thien toc do xu ly blocker lien phong ban.';

UPDATE review_comments
SET content = 'The employee showed steady progress and reached a Good rating this cycle.'
WHERE content = 'Nhan vien co tien bo on dinh, dat muc Tot trong ky nay.';

UPDATE review_comments
SET content = 'The review record is complete and ready for final approval.'
WHERE content = 'Ho so day du, du dieu kien phe duyet cuoi.';

UPDATE review_approvals
SET note = 'Employee submitted the review for approval.'
WHERE note = 'Nhan vien da gui duyet.';

UPDATE review_approvals
SET note = 'Manager reviewed and approved the department-level evaluation.'
WHERE note = 'Quan ly da danh gia va duyet cap phong ban.';

UPDATE review_approvals
SET note = 'HR approved the review cycle result.'
WHERE note = 'HR da chap thuan ket qua ky danh gia.';

COMMIT;
