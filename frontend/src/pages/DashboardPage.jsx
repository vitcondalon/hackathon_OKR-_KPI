import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import { EmptyChartState } from '../components/charts/EmptyChartState';
import { dashboardApi } from '../api/dashboardApi';
import { funnyApi } from '../api/funnyApi';
import { useAuth } from '../contexts/AuthContext';
import { percent } from '../utils/format';
import { scopeLabel, statusLabel } from '../utils/labels';

const COLORS = ['#246bff', '#16a34a', '#f59e0b', '#ef4444', '#0ea5e9', '#7c3aed'];

function summaryCards(summary, role) {
  if (role === 'employee') {
    return [
      { label: 'Objectives của tôi', value: summary.total_objectives ?? 0, note: 'Mục tiêu được giao cho bạn' },
      { label: 'KPI của tôi', value: summary.total_kpis ?? 0, note: 'Chỉ số trong phạm vi phụ trách' },
      { label: 'Chu kỳ đang chạy', value: summary.active_cycles ?? 0, note: 'Các khung kế hoạch hiện tại' },
      { label: 'Tiến độ trung bình', value: percent(summary.objective_avg_progress ?? summary.average_progress ?? 0), note: 'Mức tiến độ objective tổng thể' }
    ];
  }

  return [
    { label: 'Tổng người dùng', value: summary.total_users ?? 0, note: 'Số người trong không gian làm việc' },
    { label: 'Phòng ban', value: summary.total_departments ?? 0, note: 'Các đơn vị đang theo dõi' },
    { label: 'Chu kỳ đang chạy', value: summary.active_cycles ?? 0, note: 'Các khung kế hoạch hiện tại' },
    { label: 'Trung bình objective', value: percent(summary.objective_avg_progress ?? summary.average_progress ?? 0), note: 'Mức tiến độ objective tổng thể' }
  ];
}

function riskTone(kind) {
  if (kind === 'critical') return 'border-red-200 bg-red-50 text-red-700';
  if (kind === 'warning') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-sky-200 bg-sky-50 text-sky-700';
}

function riskLabel(kind) {
  if (kind === 'critical') return 'Cần gấp';
  if (kind === 'warning') return 'Cảnh báo';
  return 'Thông tin';
}

function roleLabel(role) {
  if (role === 'admin') return 'Quản trị viên';
  if (role === 'manager') return 'Quản lý';
  if (role === 'employee') return 'Nhân viên';
  return role || 'Người dùng';
}

function itemTypeLabel(kind) {
  if (kind === 'key_result') return 'Key Result';
  if (kind === 'kpi') return 'KPI';
  return kind || 'Mục rủi ro';
}

function toTodoCards(role, summaryData, suggestionData) {
  const suggestions = suggestionData?.suggestions || [];
  if (suggestions.length > 0) {
    return suggestions.slice(0, 4).map((text, index) => ({ id: `suggestion-${index}`, title: text, route: '/funny', kind: index === 0 ? 'critical' : 'info' }));
  }

  if (role === 'admin') {
    return [
      { id: 'admin-1', title: 'Rà lại các nhóm rủi ro và KPI đang gặp rủi ro trước mốc kiểm tra tiếp theo.', route: '/funny', kind: 'critical' },
      { id: 'admin-2', title: 'Mở phần tóm tắt của trợ lý để nêu bật các cá nhân nổi bật cho phần demo.', route: '/funny', kind: 'info' }
    ];
  }

  if (role === 'manager') {
    return [
      { id: 'manager-1', title: 'Theo sát các objective tiến độ thấp và những check-ins đã quá hạn.', route: '/checkins', kind: 'warning' },
      { id: 'manager-2', title: 'Dùng gợi ý của Funny để dẫn dắt buổi review nhóm tiếp theo.', route: '/funny', kind: 'info' }
    ];
  }

  return [
    { id: 'employee-1', title: 'Gửi một check-in mới và cập nhật tiến độ KPI gần nhất của bạn.', route: '/checkins', kind: 'warning' },
    { id: 'employee-2', title: 'Hỏi Funny để biết mục nào của bạn đang có rủi ro.', route: '/funny', kind: 'info' }
  ];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState({});
  const [progress, setProgress] = useState({ objective_status: [], key_result_status: [], kpi_status: [] });
  const [risks, setRisks] = useState({ key_results: [], kpis: [] });
  const [top, setTop] = useState({ users: [], departments: [] });
  const [charts, setCharts] = useState({ objective_by_cycle: [], kpi_distribution: [], department_performance: [], checkin_trend: [] });
  const [funnySummary, setFunnySummary] = useState(null);
  const [funnySuggestions, setFunnySuggestions] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [s, p, r, t, c, fs, fsum] = await Promise.all([
          dashboardApi.summary(),
          dashboardApi.progress(),
          dashboardApi.risks(),
          dashboardApi.topPerformers(),
          dashboardApi.charts(),
          funnyApi.suggestions().catch(() => null),
          funnyApi.summary().catch(() => null)
        ]);

        setSummary(s || {});
        setProgress(p || { objective_status: [], key_result_status: [], kpi_status: [] });
        setRisks(r || { key_results: [], kpis: [] });
        setTop(t || { users: [], departments: [] });
        setCharts(c || { objective_by_cycle: [], kpi_distribution: [], department_performance: [], checkin_trend: [] });
        setFunnySuggestions(fs);
        setFunnySummary(fsum?.summary || null);
      } catch {
        setError('Không thể tải dữ liệu dashboard');
      }
    }
    load();
  }, []);

  const cards = useMemo(() => summaryCards(summary, user?.role || 'employee'), [summary, user?.role]);
  const objectiveCycleData = charts.objective_by_cycle || [];
  const kpiDistributionData = (charts.kpi_distribution || []).map((item, idx) => ({ ...item, label: `${scopeLabel(item.scope_type)} - ${statusLabel(item.status)}`, color: COLORS[idx % COLORS.length] }));
  const departmentPerformance = charts.department_performance || [];
  const riskItems = [...(risks.key_results || []), ...(risks.kpis || [])].slice(0, 6);
  const todoCards = toTodoCards(user?.role || 'employee', funnySummary, funnySuggestions);
  const recommendedQuestions = funnySuggestions?.recommendedQuestions || [];

  return (
    <AppLayout title="Dashboard" description="Không gian điều phối theo vai trò để theo dõi tiến độ, rủi ro, hiệu suất nhóm và bước tiếp theo.">
      <div className="space-y-5 ui-page-enter">
        {error ? <p className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        <Card className="overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="ui-highlight rounded-[1.8rem] p-5 sm:p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-brand-700">{roleLabel(user?.role)} trong không gian làm việc</p>
              <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950">Xem điều quan trọng trước, rồi hành động nhanh.</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">Dashboard này kết hợp dữ liệu OKR/KPI đang chạy, rủi ro và ngữ cảnh từ trợ lý để mỗi vai trò vào đúng điểm bắt đầu mà không cần bấm nhiều.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/funny" className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Mở Funny Assistant</Link>
                <Link to="/checkins" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Đi tới Check-ins</Link>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {cards.map((item) => (
                <div key={item.label} className="rounded-[1.4rem] border border-slate-200 bg-white/95 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{item.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5">
            <section className="grid gap-5 xl:grid-cols-2">
              <Card title="Tiến độ objective theo chu kỳ" subtitle="Xu hướng và mức độ hoàn thành">
                <div className="h-80">
                  {objectiveCycleData.length === 0 ? <EmptyChartState label="Chưa có dữ liệu objective theo chu kỳ" /> : (
                    <ResponsiveContainer>
                      <BarChart data={objectiveCycleData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                        <XAxis dataKey="label" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="avg_key_result_progress" fill="#246bff" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              <Card title="Phân bổ KPI" subtitle="Theo phạm vi và trạng thái">
                <div className="h-80">
                  {kpiDistributionData.length === 0 ? <EmptyChartState label="Chưa có dữ liệu phân bổ KPI" /> : (
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={kpiDistributionData} dataKey="count" nameKey="label" outerRadius={104}>
                          {kpiDistributionData.map((entry) => <Cell key={entry.label} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <Card title="Rủi ro và cảnh báo" subtitle="Các mục cần chú ý ngay">
                <div className="space-y-3">
                  {riskItems.length === 0 ? <p className="text-sm text-slate-500">Hiện chưa có mục rủi ro.</p> : null}
                  {riskItems.map((item) => (
                    <div key={`${item.item_type}-${item.key_result_id || item.kpi_metric_id}`} className="rounded-[1.35rem] border border-red-200 bg-red-50/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.key_result_title || item.kpi_name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-red-700">{itemTypeLabel(item.item_type)}</p>
                        </div>
                        <span className="status-badge border-red-200 bg-white text-red-700">{percent(item.progress_percent || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Nên làm gì tiếp theo?" subtitle="Các bước tiếp theo được gợi ý">
                <div className="space-y-3">
                  {todoCards.map((item) => (
                    <Link key={item.id} to={item.route} className="ui-soft-hover block rounded-[1.35rem] border border-slate-200 bg-white/95 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold leading-relaxed text-slate-900">{item.title}</p>
                        <span className={`status-badge ${riskTone(item.kind)}`}>{riskLabel(item.kind)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </section>

            <Card title="Hiệu suất phòng ban" subtitle="So sánh giữa các đơn vị">
              <div className="h-80">
                {departmentPerformance.length === 0 ? <EmptyChartState label="Chưa có dữ liệu hiệu suất phòng ban" /> : (
                  <ResponsiveContainer>
                    <BarChart data={departmentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbe4f0" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avg_objective_progress" fill="#0ea5e9" radius={[10, 10, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="Tóm tắt từ Funny" subtitle="Ảnh chụp nhanh theo vai trò">
              {funnySummary ? (
                <div className="space-y-4">
                  {funnySummary.narrative ? <div className="rounded-[1.4rem] border border-brand-100 bg-brand-50/80 p-4 text-sm leading-relaxed text-slate-700">{funnySummary.narrative}</div> : null}
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Chu kỳ đang chạy</p>
                      <p className="mt-2 text-2xl font-extrabold text-slate-900">{funnySummary.active_cycles?.total ?? 0}</p>
                    </div>
                    <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Check-ins đang chờ</p>
                      <p className="mt-2 text-2xl font-extrabold text-amber-600">{funnySummary.risk_snapshot?.pending_checkins ?? 0}</p>
                    </div>
                  </div>
                </div>
              ) : <p className="text-sm text-slate-500">Hiện chưa có phần tóm tắt từ Funny.</p>}
            </Card>

            <Card title="Câu hỏi được gợi ý" subtitle="Điểm bắt đầu phù hợp cho buổi demo">
              <div className="space-y-3">
                {recommendedQuestions.length === 0 ? <p className="text-sm text-slate-500">Hiện chưa có gợi ý từ trợ lý.</p> : null}
                {recommendedQuestions.slice(0, 5).map((item) => (
                  <Link key={item.id} to="/funny" className="ui-soft-hover block rounded-[1.35rem] border border-slate-200 bg-white/95 p-4">
                    <p className="text-sm font-semibold text-slate-900">{item.text}</p>
                    {item.reason ? <p className="mt-1 text-xs text-slate-500">{item.reason}</p> : null}
                  </Link>
                ))}
              </div>
            </Card>

            <Card title="Nhóm và cá nhân nổi bật" subtitle="Các điểm đáng nhấn mạnh trong báo cáo">
              <div className="space-y-3">
                {(top.users || []).slice(0, 4).map((item) => (
                  <div key={`user-${item.id}`} className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.full_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.objective_count} objectives và {item.kpi_count} KPIs</p>
                      </div>
                      <span className="text-sm font-bold text-brand-600">{percent(item.objective_avg_progress || 0)}</span>
                    </div>
                  </div>
                ))}

                {(top.departments || []).slice(0, 3).map((item) => (
                  <div key={`department-${item.department_id}`} className="rounded-[1.35rem] border border-slate-200 bg-slate-50/90 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{item.department_name}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.active_member_count} thành viên đang hoạt động</p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600">{percent(item.avg_objective_progress || 0)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Phân rã trạng thái" subtitle="Tình trạng objectives, key results và KPI">
              <div className="space-y-4">
                {[
                  ['Objectives', progress.objective_status || []],
                  ['Key Results', progress.key_result_status || []],
                  ['KPIs', progress.kpi_status || []]
                ].map(([group, rows]) => (
                  <div key={group}>
                    <p className="text-sm font-semibold text-slate-900">{group}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rows.length === 0 ? <span className="text-sm text-slate-500">Chưa có dữ liệu</span> : null}
                      {rows.map((row) => <span key={`${group}-${row.status}`} className="status-badge border-slate-200 bg-slate-50 text-slate-700">{statusLabel(row.status)}: {row.count}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
