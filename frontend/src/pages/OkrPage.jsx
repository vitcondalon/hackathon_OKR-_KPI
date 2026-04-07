import { useEffect, useMemo, useState } from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { okrApi } from '../api/okrApi';
import { workspaceApi } from '../api/workspaceApi';
import { apiErrorMessage } from '../api/helpers';
import { useAuth } from '../contexts/AuthContext';
import { useLocale } from '../contexts/LocaleContext';
import AppModeTabs from '../components/layout/AppModeTabs';

const copy = {
  vi: {
    eyebrow: 'Không gian mục tiêu tập trung',
    title: 'Bảng theo dõi OKR',
    subtitle: 'Theo dõi objective, key result và check-in theo cách gọn, dễ dùng cho vận hành thực tế.',
    role: 'Vai trò',
    loading: 'Đang tải dữ liệu OKR...',
    englishHint: 'Các trường dữ liệu nghiệp vụ mới của OKR hiện vẫn nên nhập bằng tiếng Anh để giữ đồng bộ dữ liệu.',
    filters: 'Bộ lọc OKR',
    cycle: 'Chu kỳ OKR',
    owner: 'Người phụ trách',
    allOwners: 'Tất cả nhân sự trong phạm vi thấy được',
    search: 'Tìm objective',
    searchPlaceholder: 'Tìm theo mã hoặc tiêu đề objective',
    summary: 'Tổng quan nhanh',
    totalObjectives: 'Tổng objective',
    totalKeyResults: 'Tổng key result',
    avgProgress: 'Tiến độ trung bình',
    atRisk: 'Đang rủi ro',
    createCycle: 'Tạo chu kỳ OKR',
    cycleName: 'Tên chu kỳ',
    startDate: 'Ngày bắt đầu',
    endDate: 'Ngày kết thúc',
    cycleStatus: 'Trạng thái chu kỳ',
    createObjective: 'Tạo objective',
    objectiveTitle: 'Tiêu đề objective',
    objectiveDescription: 'Mô tả objective',
    objectiveType: 'Loại objective',
    dueDate: 'Ngày đích',
    createKeyResult: 'Tạo key result',
    keyResultTitle: 'Tiêu đề key result',
    keyResultDescription: 'Mô tả key result',
    startValue: 'Giá trị bắt đầu',
    currentValue: 'Giá trị hiện tại',
    targetValue: 'Giá trị mục tiêu',
    unit: 'Đơn vị đo',
    direction: 'Hướng đo',
    objectiveList: 'Danh sách objective',
    noObjectives: 'Chưa có objective trong bộ lọc hiện tại.',
    selectObjective: 'Chọn objective',
    ownerName: 'Phụ trách',
    progress: 'Tiến độ',
    keyResults: 'Key results',
    noKeyResults: 'Objective này chưa có key result.',
    checkin: 'Check-in tiến độ',
    selectedObjective: 'Objective đang chọn',
    selectedKeyResult: 'Key result đang chọn',
    valueAfter: 'Giá trị sau cập nhật',
    checkinDate: 'Ngày check-in',
    confidence: 'Độ tin cậy',
    note: 'Ghi chú cập nhật',
    blocker: 'Vướng mắc',
    submitCheckin: 'Gửi check-in',
    checkinHistory: 'Lịch sử check-in',
    noCheckins: 'Chưa có lịch sử check-in cho key result này.',
    chooseOwner: 'Chọn người phụ trách',
    chooseCycle: 'Chọn chu kỳ',
    statuses: {
      planning: 'Lên kế hoạch',
      active: 'Đang chạy',
      closed: 'Đã đóng',
      draft: 'Bản nháp',
      on_track: 'Đúng tiến độ',
      at_risk: 'Có rủi ro',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy'
    },
    types: {
      individual: 'Cá nhân',
      department: 'Phòng ban',
      company: 'Công ty'
    },
    directions: {
      increase: 'Tăng dần',
      decrease: 'Giảm dần',
      maintain: 'Giữ ổn định'
    },
    fallback: {
      load: 'Không thể tải dữ liệu OKR',
      createCycle: 'Không tạo được chu kỳ OKR',
      createObjective: 'Không tạo được objective',
      createKeyResult: 'Không tạo được key result',
      createCheckin: 'Không tạo được check-in'
    }
  },
  en: {
    eyebrow: 'Focused goal workspace',
    title: 'OKR tracking board',
    subtitle: 'Track objectives, key results, and check-ins in a focused and practical workspace.',
    role: 'Role',
    loading: 'Loading OKR data...',
    englishHint: 'New OKR business fields should currently stay in English for consistent data storage.',
    filters: 'OKR filters',
    cycle: 'OKR cycle',
    owner: 'Owner',
    allOwners: 'All visible employees',
    search: 'Search objective',
    searchPlaceholder: 'Search by objective code or title',
    summary: 'Quick summary',
    totalObjectives: 'Objectives',
    totalKeyResults: 'Key results',
    avgProgress: 'Average progress',
    atRisk: 'At risk',
    createCycle: 'Create OKR cycle',
    cycleName: 'Cycle name',
    startDate: 'Start date',
    endDate: 'End date',
    cycleStatus: 'Cycle status',
    createObjective: 'Create objective',
    objectiveTitle: 'Objective title',
    objectiveDescription: 'Objective description',
    objectiveType: 'Objective type',
    dueDate: 'Due date',
    createKeyResult: 'Create key result',
    keyResultTitle: 'Key result title',
    keyResultDescription: 'Key result description',
    startValue: 'Start value',
    currentValue: 'Current value',
    targetValue: 'Target value',
    unit: 'Unit',
    direction: 'Direction',
    objectiveList: 'Objective list',
    noObjectives: 'No objective matches the current filters.',
    selectObjective: 'Select objective',
    ownerName: 'Owner',
    progress: 'Progress',
    keyResults: 'Key results',
    noKeyResults: 'This objective has no key results yet.',
    checkin: 'Progress check-in',
    selectedObjective: 'Selected objective',
    selectedKeyResult: 'Selected key result',
    valueAfter: 'Value after update',
    checkinDate: 'Check-in date',
    confidence: 'Confidence',
    note: 'Update note',
    blocker: 'Blocker',
    submitCheckin: 'Submit check-in',
    checkinHistory: 'Check-in history',
    noCheckins: 'No check-ins for this key result yet.',
    chooseOwner: 'Choose owner',
    chooseCycle: 'Choose cycle',
    statuses: {
      planning: 'Planning',
      active: 'Active',
      closed: 'Closed',
      draft: 'Draft',
      on_track: 'On track',
      at_risk: 'At risk',
      completed: 'Completed',
      cancelled: 'Cancelled'
    },
    types: {
      individual: 'Individual',
      department: 'Department',
      company: 'Company'
    },
    directions: {
      increase: 'Increase',
      decrease: 'Decrease',
      maintain: 'Maintain'
    },
    fallback: {
      load: 'Unable to load OKR data',
      createCycle: 'Unable to create OKR cycle',
      createObjective: 'Unable to create objective',
      createKeyResult: 'Unable to create key result',
      createCheckin: 'Unable to create check-in'
    }
  }
};

const statusClass = {
  planning: 'bg-slate-100 text-slate-700 border-slate-300',
  active: 'bg-blue-50 text-blue-700 border-blue-200',
  closed: 'bg-slate-200 text-slate-700 border-slate-300',
  draft: 'bg-slate-100 text-slate-700 border-slate-300',
  on_track: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  at_risk: 'bg-amber-50 text-amber-700 border-amber-200',
  completed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200'
};

const blankCycle = { name: '', start_date: '', end_date: '', status: 'planning' };
const blankObjective = { title: '', description: '', owner_user_id: '', objective_type: 'individual', due_date: '' };
const blankKeyResult = { title: '', description: '', start_value: '0', current_value: '0', target_value: '', measurement_unit: '', direction: 'increase' };
const blankCheckin = () => ({ value_after: '', checkin_date: new Date().toISOString().slice(0, 10), confidence_level: '7', note: '', blocker_note: '' });

function roleLabel(role, locale) {
  if (locale === 'vi') {
    if (role === 'admin') return 'Quản trị viên';
    if (role === 'hr') return 'Nhân sự';
    if (role === 'manager') return 'Quản lý';
    if (role === 'employee') return 'Nhân viên';
  }
  if (role === 'admin') return 'Admin';
  if (role === 'hr') return 'HR';
  if (role === 'manager') return 'Manager';
  if (role === 'employee') return 'Employee';
  return role || '-';
}

function formatDisplayDate(value, locale) {
  if (!value) return '-';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'vi-VN').format(date);
}

function safePercent(value) {
  const n = Number(value || 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function canonicalText(value) {
  return String(value || '').trim();
}

export default function OkrPage() {
  const { user } = useAuth();
  const { locale } = useLocale();
  const t = copy[locale] || copy.vi;

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [hasLoadedBoard, setHasLoadedBoard] = useState(false);
  const [error, setError] = useState('');
  const [cycles, setCycles] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState('');
  const [selectedOwnerId, setSelectedOwnerId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [selectedObjectiveId, setSelectedObjectiveId] = useState('');
  const [selectedKeyResultId, setSelectedKeyResultId] = useState('');
  const [checkins, setCheckins] = useState([]);
  const [cycleForm, setCycleForm] = useState(blankCycle);
  const [objectiveForm, setObjectiveForm] = useState(blankObjective);
  const [keyResultForm, setKeyResultForm] = useState(blankKeyResult);
  const [checkinForm, setCheckinForm] = useState(blankCheckin);

  const canCreateCycle = user?.role === 'admin' || user?.role === 'manager';

  const ownerOptions = useMemo(() => {
    if (user?.role === 'employee') {
      return employees.filter((item) => Number(item.id) === Number(user.id));
    }
    return employees;
  }, [employees, user?.id, user?.role]);

  const selectedCycle = useMemo(
    () => cycles.find((item) => String(item.id) === String(selectedCycleId)) || null,
    [cycles, selectedCycleId]
  );

  const selectedObjective = useMemo(
    () => objectives.find((item) => String(item.id) === String(selectedObjectiveId)) || null,
    [objectives, selectedObjectiveId]
  );

  const selectedKeyResult = useMemo(
    () => selectedObjective?.keyResults?.find((item) => String(item.id) === String(selectedKeyResultId)) || null,
    [selectedKeyResultId, selectedObjective]
  );

  const summary = useMemo(() => {
    const keyResults = objectives.flatMap((item) => item.keyResults || []);
    const avgProgress = objectives.length ? objectives.reduce((total, item) => total + safePercent(item.progress_percent), 0) / objectives.length : 0;
    return {
      objectives: objectives.length,
      keyResults: keyResults.length,
      avgProgress,
      atRisk: keyResults.filter((item) => item.status === 'at_risk').length
    };
  }, [objectives]);

  async function loadBoard({ initial = false } = {}) {
    if (!selectedCycleId) {
      setObjectives([]);
      setSelectedObjectiveId('');
      setSelectedKeyResultId('');
      if (initial) setLoading(false);
      return;
    }

    if (initial) setLoading(true);
    setError('');
    try {
      const params = { cycle_id: Number(selectedCycleId) };
      if (selectedOwnerId) params.owner_user_id = Number(selectedOwnerId);

      const objectiveRows = await okrApi.listObjectives(params);
      const keyword = searchKeyword.trim().toLowerCase();
      const filtered = (Array.isArray(objectiveRows) ? objectiveRows : []).filter((item) => {
        if (!keyword) return true;
        return [item.code, item.title, item.description].join(' ').toLowerCase().includes(keyword);
      });

      const keyResultGroups = await Promise.all(filtered.map((item) => okrApi.listKeyResults({ objective_id: item.id })));
      const enriched = filtered.map((item, index) => ({ ...item, keyResults: Array.isArray(keyResultGroups[index]) ? keyResultGroups[index] : [] }));
      setObjectives(enriched);
      setSelectedObjectiveId((current) => (current && enriched.some((item) => String(item.id) === String(current)) ? current : enriched[0] ? String(enriched[0].id) : ''));
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.load));
    } finally {
      setHasLoadedBoard(true);
      if (initial) setLoading(false);
    }
  }

  useEffect(() => {
    async function bootstrap() {
      setLoading(true);
      try {
        const [cycleRows, bootstrapData] = await Promise.all([okrApi.listCycles(), workspaceApi.bootstrap()]);
        const resolvedCycles = Array.isArray(cycleRows) ? cycleRows : [];
        const resolvedEmployees = Array.isArray(bootstrapData?.employees) ? bootstrapData.employees : [];
        setCycles(resolvedCycles);
        setEmployees(resolvedEmployees);

        const defaultCycle = resolvedCycles.find((item) => item.status === 'active') || resolvedCycles[0] || null;
        setSelectedCycleId(defaultCycle ? String(defaultCycle.id) : '');
        if (user?.role === 'employee') {
          setSelectedOwnerId(String(user.id));
          setObjectiveForm((current) => ({ ...current, owner_user_id: String(user.id) }));
        }
      } catch (err) {
        setError(apiErrorMessage(err, t.fallback.load));
        setLoading(false);
      }
    }

    bootstrap();
  }, [t.fallback.load, user?.id, user?.role]);

  useEffect(() => {
    if (selectedCycleId) {
      loadBoard({ initial: !hasLoadedBoard });
    }
  }, [hasLoadedBoard, searchKeyword, selectedCycleId, selectedOwnerId]);

  useEffect(() => {
    if (!selectedObjective) {
      setSelectedKeyResultId('');
      return;
    }
    setSelectedKeyResultId((current) => (current && selectedObjective.keyResults?.some((item) => String(item.id) === String(current)) ? current : selectedObjective.keyResults?.[0] ? String(selectedObjective.keyResults[0].id) : ''));
  }, [selectedObjective]);

  useEffect(() => {
    async function loadCheckins() {
      if (!selectedKeyResultId) {
        setCheckins([]);
        return;
      }
      try {
        const rows = await okrApi.listCheckins({ key_result_id: Number(selectedKeyResultId) });
        setCheckins(Array.isArray(rows) ? rows : []);
      } catch (err) {
        setError(apiErrorMessage(err, t.fallback.load));
      }
    }

    loadCheckins();
  }, [selectedKeyResultId, t.fallback.load]);

  async function handleCreateCycle(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await okrApi.createCycle(cycleForm);
      const rows = await okrApi.listCycles();
      const resolved = Array.isArray(rows) ? rows : [];
      setCycles(resolved);
      const latest = resolved[0] || null;
      setSelectedCycleId(latest ? String(latest.id) : '');
      setCycleForm(blankCycle);
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.createCycle));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateObjective(event) {
    event.preventDefault();
    if (!selectedCycleId) return;
    setBusy(true);
    setError('');
    try {
      const ownerId = user?.role === 'employee' ? Number(user.id) : Number(objectiveForm.owner_user_id || selectedOwnerId || user?.id);
      const owner = ownerOptions.find((item) => Number(item.id) === ownerId);
      await okrApi.createObjective({
        cycle_id: Number(selectedCycleId),
        owner_user_id: ownerId,
        title: canonicalText(objectiveForm.title),
        description: canonicalText(objectiveForm.description) || null,
        objective_type: objectiveForm.objective_type,
        department_id: objectiveForm.objective_type === 'department' ? owner?.department_id || null : null,
        start_date: selectedCycle?.start_date || null,
        due_date: objectiveForm.due_date || selectedCycle?.end_date || null
      });
      setObjectiveForm((current) => ({ ...blankObjective, owner_user_id: current.owner_user_id }));
      await loadBoard();
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.createObjective));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateKeyResult(event) {
    event.preventDefault();
    if (!selectedObjective) return;
    setBusy(true);
    setError('');
    try {
      await okrApi.createKeyResult({
        objective_id: selectedObjective.id,
        title: canonicalText(keyResultForm.title),
        description: canonicalText(keyResultForm.description) || null,
        start_value: Number(keyResultForm.start_value || 0),
        current_value: Number(keyResultForm.current_value || 0),
        target_value: Number(keyResultForm.target_value || 0),
        measurement_unit: canonicalText(keyResultForm.measurement_unit) || null,
        direction: keyResultForm.direction
      });
      setKeyResultForm(blankKeyResult);
      await loadBoard();
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.createKeyResult));
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateCheckin(event) {
    event.preventDefault();
    if (!selectedKeyResult) return;
    setBusy(true);
    setError('');
    try {
      await okrApi.createCheckin({
        key_result_id: selectedKeyResult.id,
        value_after: Number(checkinForm.value_after || 0),
        checkin_date: checkinForm.checkin_date,
        confidence_level: Number(checkinForm.confidence_level || 7),
        note: canonicalText(checkinForm.note),
        blocker_note: canonicalText(checkinForm.blocker_note) || null
      });
      setCheckinForm(blankCheckin());
      await loadBoard();
      const rows = await okrApi.listCheckins({ key_result_id: Number(selectedKeyResult.id) });
      setCheckins(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(apiErrorMessage(err, t.fallback.createCheckin));
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="ui-shell" lang={locale === 'en' ? 'en' : 'vi'}>
        <div className="ui-panel text-sm text-slate-600">{t.loading}</div>
      </div>
    );
  }

  return (
    <div className="ui-shell" lang={locale === 'en' ? 'en' : 'vi'}>
      <div className="mx-auto flex w-full max-w-[1520px] flex-col gap-5">
        <section className="ui-panel ui-hero">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="ui-kicker">{t.eyebrow}</p>
              <h1 className="mt-2 text-[1.7rem] font-semibold tracking-tight text-slate-950 sm:text-[2rem]">{t.title}</h1>
              <p className="ui-section-subtitle">{t.subtitle} | {t.role}: {roleLabel(user?.role, locale)}</p>
              <p className="mt-2 text-sm text-amber-700">{t.englishHint}</p>
            </div>
            <AppModeTabs active="okr" />
          </div>

          {error ? <p className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p> : null}

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.15fr_1.15fr_1fr]">
            <label className="text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">{t.cycle}</span>
              <select value={selectedCycleId} onChange={(event) => setSelectedCycleId(event.target.value)}>
                <option value="">{t.chooseCycle}</option>
                {cycles.map((item) => (
                  <option key={item.id} value={item.id}>{item.code} - {item.name}</option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">{t.owner}</span>
              <select value={selectedOwnerId} onChange={(event) => setSelectedOwnerId(event.target.value)} disabled={user?.role === 'employee'}>
                <option value="">{t.allOwners}</option>
                {ownerOptions.map((item) => (
                  <option key={item.id} value={item.id}>{item.employee_code} - {item.full_name}</option>
                ))}
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1.5 block font-semibold text-slate-700">{t.search}</span>
              <input value={searchKeyword} onChange={(event) => setSearchKeyword(event.target.value)} placeholder={t.searchPlaceholder} />
            </label>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[1.55fr_1fr]">
          <div className="space-y-5">
            <Card title={t.summary}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="ui-metric"><p className="ui-metric-label">{t.totalObjectives}</p><p className="ui-metric-value">{summary.objectives}</p></div>
                <div className="ui-metric"><p className="ui-metric-label">{t.totalKeyResults}</p><p className="ui-metric-value">{summary.keyResults}</p></div>
                <div className="ui-metric"><p className="ui-metric-label">{t.avgProgress}</p><p className="ui-metric-value">{summary.avgProgress.toFixed(1)}%</p></div>
                <div className="ui-metric"><p className="ui-metric-label">{t.atRisk}</p><p className="ui-metric-value">{summary.atRisk}</p></div>
              </div>
            </Card>

            <Card title={t.objectiveList}>
              <div className="space-y-4">
                {objectives.length === 0 ? <div className="rounded-[1rem] border border-dashed border-slate-300 px-4 py-5 text-sm text-slate-500">{t.noObjectives}</div> : null}
                {objectives.map((objective) => {
                  const activeObjective = String(objective.id) === String(selectedObjectiveId);
                  return (
                    <article key={objective.id} className={`rounded-[1.25rem] border p-4 ${activeObjective ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 bg-white'}`}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">{objective.code}</span>
                            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass[objective.status] || statusClass.draft}`}>{t.statuses[objective.status] || objective.status}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-slate-900">{objective.title}</h3>
                          <p className="text-sm text-slate-600">{objective.description || '-'}</p>
                        </div>
                        <Button type="button" variant={activeObjective ? 'primary' : 'ghost'} onClick={() => setSelectedObjectiveId(String(objective.id))}>{t.selectObjective}</Button>
                      </div>

                      <div className="mt-4 grid gap-3 md:grid-cols-3">
                        <div className="ui-note-card"><p className="ui-kicker">{t.ownerName}</p><p className="mt-2 text-sm font-semibold text-slate-900">{objective.owner_name || '-'}</p></div>
                        <div className="ui-note-card"><p className="ui-kicker">{t.dueDate}</p><p className="mt-2 text-sm font-semibold text-slate-900">{formatDisplayDate(objective.due_date, locale)}</p></div>
                        <div className="ui-note-card"><p className="ui-kicker">{t.progress}</p><p className="mt-2 text-sm font-semibold text-slate-900">{safePercent(objective.progress_percent).toFixed(1)}%</p></div>
                      </div>

                      <div className="mt-4">
                        <div className="mb-2 flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-800">{t.keyResults}</p>
                          <span className="text-xs text-slate-500">{objective.keyResults.length}</span>
                        </div>

                        <div className="space-y-2">
                          {objective.keyResults.length === 0 ? <div className="rounded-[1rem] border border-dashed border-slate-300 px-3 py-3 text-sm text-slate-500">{t.noKeyResults}</div> : null}
                          {objective.keyResults.map((item) => {
                            const active = String(item.id) === String(selectedKeyResultId);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                  setSelectedObjectiveId(String(objective.id));
                                  setSelectedKeyResultId(String(item.id));
                                }}
                                className={`w-full rounded-[1rem] border p-3 text-left ${active ? 'border-blue-300 bg-blue-50/70' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
                              >
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                                    <p className="mt-1 text-xs text-slate-500">{item.code} · {item.measurement_unit || '-'}</p>
                                  </div>
                                  <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClass[item.status] || statusClass.draft}`}>{t.statuses[item.status] || item.status}</span>
                                </div>
                                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                  <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600"><span className="font-semibold text-slate-800">{t.startValue}:</span> {item.start_value}</div>
                                  <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600"><span className="font-semibold text-slate-800">{t.currentValue}:</span> {item.current_value}</div>
                                  <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600"><span className="font-semibold text-slate-800">{t.targetValue}:</span> {item.target_value}</div>
                                </div>
                                <div className="mt-3">
                                  <div className="mb-1 flex items-center justify-between text-xs text-slate-500"><span>{t.progress}</span><span>{safePercent(item.progress_percent).toFixed(1)}%</span></div>
                                  <div className="h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-blue-500" style={{ width: `${safePercent(item.progress_percent)}%` }} /></div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            {canCreateCycle ? (
              <Card title={t.createCycle}>
                <form className="space-y-3" onSubmit={handleCreateCycle}>
                  <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.cycleName}</span><input value={cycleForm.name} onChange={(event) => setCycleForm((current) => ({ ...current, name: event.target.value }))} required /></label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.startDate}</span><input type="date" value={cycleForm.start_date} onChange={(event) => setCycleForm((current) => ({ ...current, start_date: event.target.value }))} required /></label>
                    <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.endDate}</span><input type="date" value={cycleForm.end_date} onChange={(event) => setCycleForm((current) => ({ ...current, end_date: event.target.value }))} required /></label>
                  </div>
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-semibold text-slate-700">{t.cycleStatus}</span>
                    <select value={cycleForm.status} onChange={(event) => setCycleForm((current) => ({ ...current, status: event.target.value }))}>
                      {['planning', 'active', 'closed'].map((item) => <option key={item} value={item}>{t.statuses[item]}</option>)}
                    </select>
                  </label>
                  <Button type="submit" className="w-full" disabled={busy}>{t.createCycle}</Button>
                </form>
              </Card>
            ) : null}

            <Card title={t.createObjective}>
              <form className="space-y-3" onSubmit={handleCreateObjective}>
                <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.objectiveTitle}</span><input value={objectiveForm.title} onChange={(event) => setObjectiveForm((current) => ({ ...current, title: event.target.value }))} required /></label>
                <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.objectiveDescription}</span><textarea value={objectiveForm.description} onChange={(event) => setObjectiveForm((current) => ({ ...current, description: event.target.value }))} /></label>
                {user?.role !== 'employee' ? (
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-semibold text-slate-700">{t.owner}</span>
                    <select value={objectiveForm.owner_user_id} onChange={(event) => setObjectiveForm((current) => ({ ...current, owner_user_id: event.target.value }))}>
                      <option value="">{t.chooseOwner}</option>
                      {ownerOptions.map((item) => <option key={item.id} value={item.id}>{item.employee_code} - {item.full_name}</option>)}
                    </select>
                  </label>
                ) : null}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-semibold text-slate-700">{t.objectiveType}</span>
                    <select value={objectiveForm.objective_type} onChange={(event) => setObjectiveForm((current) => ({ ...current, objective_type: event.target.value }))}>
                      {Object.entries(t.types).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.dueDate}</span><input type="date" value={objectiveForm.due_date} onChange={(event) => setObjectiveForm((current) => ({ ...current, due_date: event.target.value }))} /></label>
                </div>
                <p className="text-xs text-amber-700">{t.englishHint}</p>
                <Button type="submit" className="w-full" disabled={busy || !selectedCycleId}>{t.createObjective}</Button>
              </form>
            </Card>

            <Card title={t.createKeyResult}>
              <form className="space-y-3" onSubmit={handleCreateKeyResult}>
                <div className="ui-note-card"><p className="ui-kicker">{t.selectedObjective}</p><p className="mt-2 text-sm font-semibold text-slate-900">{selectedObjective?.title || '-'}</p></div>
                <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.keyResultTitle}</span><input value={keyResultForm.title} onChange={(event) => setKeyResultForm((current) => ({ ...current, title: event.target.value }))} required /></label>
                <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.keyResultDescription}</span><textarea value={keyResultForm.description} onChange={(event) => setKeyResultForm((current) => ({ ...current, description: event.target.value }))} /></label>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.startValue}</span><input type="number" value={keyResultForm.start_value} onChange={(event) => setKeyResultForm((current) => ({ ...current, start_value: event.target.value }))} /></label>
                  <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.currentValue}</span><input type="number" value={keyResultForm.current_value} onChange={(event) => setKeyResultForm((current) => ({ ...current, current_value: event.target.value }))} /></label>
                  <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.targetValue}</span><input type="number" value={keyResultForm.target_value} onChange={(event) => setKeyResultForm((current) => ({ ...current, target_value: event.target.value }))} required /></label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.unit}</span><input value={keyResultForm.measurement_unit} onChange={(event) => setKeyResultForm((current) => ({ ...current, measurement_unit: event.target.value }))} /></label>
                  <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.direction}</span><select value={keyResultForm.direction} onChange={(event) => setKeyResultForm((current) => ({ ...current, direction: event.target.value }))}>{Object.entries(t.directions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                </div>
                <Button type="submit" className="w-full" disabled={busy || !selectedObjective}>{t.createKeyResult}</Button>
              </form>
            </Card>

            <Card title={t.checkin}>
              <form className="space-y-3" onSubmit={handleCreateCheckin}>
                <div className="ui-note-card"><p className="ui-kicker">{t.selectedKeyResult}</p><p className="mt-2 text-sm font-semibold text-slate-900">{selectedKeyResult?.title || '-'}</p></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.valueAfter}</span><input type="number" value={checkinForm.value_after} onChange={(event) => setCheckinForm((current) => ({ ...current, value_after: event.target.value }))} required /></label>
                  <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.checkinDate}</span><input type="date" value={checkinForm.checkin_date} onChange={(event) => setCheckinForm((current) => ({ ...current, checkin_date: event.target.value }))} required /></label>
                </div>
                <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.confidence}</span><input type="number" min="1" max="10" value={checkinForm.confidence_level} onChange={(event) => setCheckinForm((current) => ({ ...current, confidence_level: event.target.value }))} /></label>
                <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.note}</span><textarea value={checkinForm.note} onChange={(event) => setCheckinForm((current) => ({ ...current, note: event.target.value }))} required /></label>
                <label className="block text-sm"><span className="mb-1.5 block font-semibold text-slate-700">{t.blocker}</span><textarea value={checkinForm.blocker_note} onChange={(event) => setCheckinForm((current) => ({ ...current, blocker_note: event.target.value }))} /></label>
                <Button type="submit" className="w-full" disabled={busy || !selectedKeyResult}>{t.submitCheckin}</Button>
              </form>
            </Card>

            <Card title={t.checkinHistory}>
              <div className="space-y-3">
                {checkins.length === 0 ? <div className="rounded-[1rem] border border-dashed border-slate-300 px-4 py-4 text-sm text-slate-500">{t.noCheckins}</div> : null}
                {checkins.map((item) => (
                  <div key={item.id} className="ui-note-card">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">{item.user_name || '-'}</p>
                      <span className="text-xs text-slate-500">{formatDisplayDate(item.checkin_date, locale)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{item.note || '-'}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-3">
                      <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600"><span className="font-semibold text-slate-800">{t.valueAfter}:</span> {item.value_after ?? item.value ?? '-'}</div>
                      <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600"><span className="font-semibold text-slate-800">{t.progress}:</span> {safePercent(item.progress_percent ?? item.progress).toFixed(1)}%</div>
                      <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-600"><span className="font-semibold text-slate-800">{t.confidence}:</span> {item.confidence_level || '-'}</div>
                    </div>
                    {item.blocker_note ? <p className="mt-2 text-xs text-amber-700">{t.blocker}: {item.blocker_note}</p> : null}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
