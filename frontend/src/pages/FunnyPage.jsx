import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { funnyApi } from '../api/funnyApi';
import { apiErrorMessage } from '../api/helpers';

const TXT = {
  pageTitle: 'Funny Assistant',
  heroTitle: 'Không gian trợ lý để ra quyết định OKR/KPI nhanh hơn',
  heroSubtitle: 'Hỏi nhanh bằng preset, tự nhập câu hỏi của bạn và đi theo các bước gợi ý theo vai trò.',
  emptyChat: 'Chưa có hội thoại nào. Hãy bắt đầu bằng preset, tự nhập câu hỏi hoặc chọn một gợi ý.',
  loadError: 'Không thể tải không gian Funny',
  askError: 'Yêu cầu tới Funny thất bại',
  askErrorBubble: 'Funny chưa trả lời được yêu cầu này. Hãy thử câu hỏi khác hoặc đổi sang preset.',
  noAnswer: 'Funny chưa có phản hồi.',
  noRecommendations: 'Hiện chưa có gợi ý.',
  noQuickActions: 'Hiện chưa có hành động nhanh.',
  noInsights: 'Hiện chưa có nhận định.'
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function objectOrNull(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function roleLabel(role) {
  if (role === 'admin') return 'Quản trị viên';
  if (role === 'manager') return 'Quản lý';
  if (role === 'employee') return 'Nhân viên';
  return role || 'Người dùng';
}

function categoryLabel(category) {
  if (category === 'general') return 'Tổng hợp';
  if (category === 'help') return 'Hỗ trợ';
  if (category === 'actions') return 'Hành động';
  if (category === 'insight') return 'Nhận định';
  if (category === 'insights') return 'Nhận định';
  if (category === 'navigation') return 'Điều hướng';
  return category || 'Tổng hợp';
}

function severityLabel(severity) {
  if (severity === 'critical') return 'Cần gấp';
  if (severity === 'warning') return 'Cảnh báo';
  return 'Thông tin';
}

function normalizeQuickAction(action) {
  const targetRoute = action?.targetRoute || action?.path || action?.target || '/dashboard';
  return {
    label: action?.label || 'Mở',
    actionType: action?.actionType || 'navigate',
    targetRoute,
    questionId: action?.questionId || action?.sourceQuestionId || null
  };
}

function normalizeRecommended(item) {
  return {
    id: item?.id || '',
    text: item?.text || 'Câu hỏi gợi ý',
    intent: item?.intent || '',
    category: item?.category || 'general',
    targetRoute: item?.targetRoute || '/dashboard',
    reason: item?.reason || ''
  };
}

function normalizeInsight(item, idx) {
  return {
    id: item?.id || `${item?.type || 'insight'}-${idx}`,
    type: item?.type || 'insight',
    label: item?.label || item?.title || 'Nhận định',
    message: item?.message || '',
    value: Number.isFinite(Number(item?.value)) ? Number(item.value) : item?.value || 0,
    severity: item?.severity || 'info',
    targetRoute: item?.targetRoute || '/dashboard'
  };
}

function roleBadgeTone(role) {
  if (role === 'admin') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (role === 'manager') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-sky-200 bg-sky-50 text-sky-700';
}

function insightTone(severity) {
  if (severity === 'critical') return 'border-red-200 bg-red-50/80 text-red-700';
  if (severity === 'warning') return 'border-amber-200 bg-amber-50/80 text-amber-700';
  return 'border-sky-200 bg-sky-50/80 text-sky-700';
}

function askableAction(action) {
  return action.actionType === 'ask_question' || Boolean(action.questionId);
}

function LinkPills({ links = [] }) {
  if (safeArray(links).length === 0) return null;
  return (
    <div className="rounded-[1.3rem] border border-slate-200 bg-slate-50/80 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Liên kết liên quan</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {links.map((link) => (
          <Link key={`${link.label}-${link.path}`} to={link.path} className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-semibold text-brand-700">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ item, onAskQuestion }) {
  const isUser = item.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-full rounded-[1.6rem] border px-4 py-3 sm:max-w-[92%] ${isUser ? 'border-brand-400 bg-brand-500 text-white' : 'border-slate-200 bg-white/95 text-slate-800'}`}>
        {isUser ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.text}</p>
        ) : (
          <div className="space-y-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{item.answer}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {item.intent ? <span className="status-badge border-slate-200 bg-slate-50 text-slate-700">intent: {item.intent}</span> : null}
              {item.meta?.fallback ? <span className="status-badge border-amber-200 bg-amber-50 text-amber-700">Dự phòng</span> : null}
              {item.meta?.usedAI ? <span className="status-badge border-emerald-200 bg-emerald-50 text-emerald-700">Đã bật AI</span> : null}
            </div>
            <LinkPills links={item.links} />
            {safeArray(item.quickActions).length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {item.quickActions.slice(0, 5).map((action, idx) => {
                  const mapped = normalizeQuickAction(action);
                  return askableAction(mapped) ? (
                    <button key={`${item.id}-action-${idx}`} type="button" onClick={() => mapped.questionId && onAskQuestion(mapped.questionId)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                      {mapped.label}
                    </button>
                  ) : (
                    <Link key={`${item.id}-link-${idx}`} to={mapped.targetRoute} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
                      {mapped.label}
                    </Link>
                  );
                })}
              </div>
            ) : null}
            {safeArray(item.suggestions).length > 0 ? (
              <div className="rounded-[1.3rem] border border-brand-100 bg-brand-50/80 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">Gợi ý bước tiếp theo</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {item.suggestions.slice(0, 4).map((suggestion) => (
                    <span key={`${item.id}-${suggestion}`} className="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs text-slate-700">
                      {suggestion}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryPanel({ summary, suggestions }) {
  const role = summary?.role || 'employee';
  const roleSummary = objectOrNull(summary?.role_summary) || {};

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`status-badge ${roleBadgeTone(role)}`}>{roleLabel(role)}</span>
        <span className="status-badge border-slate-200 bg-white text-slate-600">Chu kỳ đang chạy: {summary?.active_cycles?.total ?? 0}</span>
      </div>

      {summary?.narrative ? (
        <div className="rounded-[1.4rem] border border-brand-100 bg-brand-50/80 p-4 text-sm leading-relaxed text-slate-700">
          {summary.narrative}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">Check-ins đang chờ</p>
          <p className="mt-2 text-2xl font-extrabold text-amber-600">{summary?.risk_snapshot?.pending_checkins ?? roleSummary.pending_checkins?.total ?? 0}</p>
        </div>
        <div className="rounded-[1.35rem] border border-slate-200 bg-white p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-slate-500">KPI rủi ro</p>
          <p className="mt-2 text-2xl font-extrabold text-red-600">{summary?.risk_snapshot?.risky_kpis ?? roleSummary.risky_kpis?.total ?? 0}</p>
        </div>
      </div>

      {safeArray(roleSummary.priorities || suggestions).length > 0 ? (
        <div className="rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Điều nên tập trung</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {safeArray(roleSummary.priorities || suggestions).slice(0, 5).map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function FunnyPage() {
  const [questions, setQuestions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [freeText, setFreeText] = useState('');
  const [chat, setChat] = useState([]);
  const [health, setHealth] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [freeSuggestions, setFreeSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  const conversationId = useMemo(() => `funny-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        const [questionItems, healthData, suggestionData, summaryData] = await Promise.all([
          funnyApi.questions(),
          funnyApi.health(),
          funnyApi.suggestions(),
          funnyApi.summary().catch(() => null)
        ]);

        const normalizedQuestions = safeArray(questionItems);
        setQuestions(normalizedQuestions);
        if (normalizedQuestions[0]?.id) setSelectedId(normalizedQuestions[0].id);

        setHealth(healthData || null);
        setRecommended(safeArray(suggestionData?.recommendedQuestions).map(normalizeRecommended));
        setQuickActions(safeArray(suggestionData?.quickActions).map(normalizeQuickAction));
        setInsights(safeArray(suggestionData?.insights).map(normalizeInsight));
        setFreeSuggestions(safeArray(suggestionData?.suggestions));

        if (summaryData?.summary) {
          setSummary(summaryData.summary);
          if (safeArray(summaryData.recommendedQuestions).length > 0) setRecommended(summaryData.recommendedQuestions.map(normalizeRecommended));
          if (safeArray(summaryData.quickActions).length > 0) setQuickActions(summaryData.quickActions.map(normalizeQuickAction));
          if (safeArray(summaryData.insights).length > 0) setInsights(summaryData.insights.map(normalizeInsight));
          if (safeArray(summaryData.suggestions).length > 0) setFreeSuggestions(summaryData.suggestions);
        }
      } catch (err) {
        setError(apiErrorMessage(err, TXT.loadError));
      }
    }

    bootstrap();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [chat]);

  const selectedQuestion = questions.find((item) => item.id === selectedId);
  const explainQuestions = questions.filter((item) => item.category === 'help' || String(item.intent || '').startsWith('explain_'));

  async function runQuestion({ question, message, fromQuickAction = false }) {
    if ((!question?.id && !message) || loading) return;

    const userText = question?.text || message;
    setError('');
    setLoading(true);
    setChat((prev) => [...prev, { id: `${Date.now()}-user`, role: 'user', text: userText }]);

    try {
      const response = await funnyApi.chat({ questionId: question?.id, message, conversationId });

      setChat((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          answer: response.answer || TXT.noAnswer,
          intent: response.intent,
          links: safeArray(response.links),
          quickActions: safeArray(response.quickActions).map(normalizeQuickAction),
          suggestions: safeArray(response.suggestions),
          insights: safeArray(response.insights).map(normalizeInsight),
          meta: response.meta || {}
        }
      ]);

      if (safeArray(response.recommendedQuestions).length > 0) setRecommended(response.recommendedQuestions.map(normalizeRecommended));
      if (safeArray(response.quickActions).length > 0) setQuickActions(response.quickActions.map(normalizeQuickAction));
      if (safeArray(response.insights).length > 0) setInsights(response.insights.map(normalizeInsight));
      if (safeArray(response.suggestions).length > 0) setFreeSuggestions(response.suggestions);
      if (!fromQuickAction && question?.id) setSelectedId(question.id);
      if (message) setFreeText('');
    } catch (err) {
      setError(apiErrorMessage(err, TXT.askError));
      setChat((prev) => [...prev, { id: `${Date.now()}-error`, role: 'assistant', answer: TXT.askErrorBubble, intent: '', links: [], quickActions: [], suggestions: [], insights: [], meta: { fallback: true } }]);
    } finally {
      setLoading(false);
    }
  }

  async function handlePresetAsk() {
    if (!selectedQuestion) return;
    await runQuestion({ question: selectedQuestion });
  }

  async function handleMessageSubmit(event) {
    event.preventDefault();
    const text = freeText.trim();
    if (!text) return;
    await runQuestion({ message: text });
  }

  async function handleQuickAction(action) {
    const mapped = normalizeQuickAction(action);
    if (!askableAction(mapped)) return;
    const question = questions.find((item) => item.id === mapped.questionId);
    if (question) await runQuestion({ question, fromQuickAction: true });
  }

  return (
    <AppLayout title={TXT.pageTitle} description="Giao diện trợ lý gọn hơn cho các câu hỏi OKR/KPI theo ngữ cảnh và bước tiếp theo có hướng dẫn.">
      <div className="space-y-5 ui-page-enter">
        <Card className="overflow-hidden">
          <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="ui-highlight rounded-[1.9rem] p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`status-badge ${roleBadgeTone(summary?.role || 'employee')}`}>{roleLabel(summary?.role || 'employee')}</span>
                <span className="status-badge border-slate-200 bg-white text-slate-600">{health?.dbConnected ? 'Database sẵn sàng' : 'Đang kiểm tra database'}</span>
                <span className="status-badge border-slate-200 bg-white text-slate-600">{health?.geminiConfigured ? 'Đã bật AI' : 'Chế độ dự phòng'}</span>
              </div>
              <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">{TXT.heroTitle}</h3>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{TXT.heroSubtitle}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <div className="rounded-[1.35rem] border border-slate-200 bg-white/95 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Lượt chat</p>
                <p className="mt-2 text-2xl font-extrabold tracking-tight text-brand-600 sm:text-3xl">{chat.filter((item) => item.role === 'assistant').length}</p>
              </div>
              <div className="rounded-[1.35rem] border border-slate-200 bg-white/95 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Check-ins đang chờ</p>
                <p className="mt-2 text-2xl font-extrabold tracking-tight text-amber-600 sm:text-3xl">{summary?.risk_snapshot?.pending_checkins ?? 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-5 2xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-5">
            <Card title="Hội thoại" subtitle="Lịch sử chat, preset và câu hỏi tự nhập">
              <div className="space-y-4">
                <div className="rounded-[1.6rem] border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
                  <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '26rem' }}>
                    {chat.length === 0 ? <p className="text-sm text-slate-500">{TXT.emptyChat}</p> : null}
                    {chat.map((item) => (
                      <MessageBubble key={item.id} item={item} onAskQuestion={async (questionId) => {
                        const question = questions.find((entry) => entry.id === questionId);
                        if (question) await runQuestion({ question, fromQuickAction: true });
                      }} />
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Chọn câu hỏi preset</p>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                      <div className="min-w-0 flex-1">
                        <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                          {questions.map((item) => <option key={item.id} value={item.id}>{item.text}</option>)}
                        </select>
                      </div>
                      <Button type="button" onClick={handlePresetAsk} disabled={loading || !selectedId}>
                        {loading ? 'Funny đang suy nghĩ...' : 'Hỏi bằng preset'}
                      </Button>
                    </div>
                    {selectedQuestion ? (
                      <div className="mt-3 rounded-[1.2rem] border border-brand-100 bg-brand-50/80 px-3 py-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">Prompt đang chọn</p>
                        <p className="mt-1 text-sm text-slate-700">{selectedQuestion.text}</p>
                      </div>
                    ) : null}
                  </div>

                  <form onSubmit={handleMessageSubmit} className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Tự nhập câu hỏi của bạn</p>
                    <textarea rows={4} value={freeText} onChange={(event) => setFreeText(event.target.value)} placeholder="Ví dụ: KPI nào đang gặp rủi ro trong chu kỳ này?" className="mt-3" />
                    <Button type="submit" className="mt-3 w-full" disabled={loading || !freeText.trim()}>
                      {loading ? 'Đang xử lý...' : 'Gửi câu hỏi'}
                    </Button>
                  </form>
                </div>

                {error ? <p className="rounded-[1.2rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
              </div>
            </Card>

            <Card title="Giải thích nhanh" subtitle="Các phần giải thích ngắn cho metric và khái niệm cốt lõi">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {explainQuestions.length === 0 ? <p className="text-sm text-slate-500">Hiện chưa có mẫu giải thích.</p> : explainQuestions.map((item) => (
                  <button key={`explain-${item.id}`} type="button" onClick={() => runQuestion({ question: item, fromQuickAction: true })} className="ui-soft-hover rounded-[1.35rem] border border-slate-200 bg-white p-4 text-left">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{categoryLabel(item.category || 'help')}</p>
                    <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-900">{item.text}</p>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card title="Gợi ý cho bạn" subtitle="Các prompt theo vai trò dựa trên ngữ cảnh hiện tại">
              <div className="space-y-3">
                {recommended.length === 0 ? <p className="text-sm text-slate-500">{TXT.noRecommendations}</p> : recommended.slice(0, 4).map((item) => {
                  const question = questions.find((entry) => entry.id === item.id);
                  return (
                    <button key={`rec-${item.id}`} type="button" onClick={() => question && runQuestion({ question, fromQuickAction: true })} className="ui-soft-hover w-full rounded-[1.35rem] border border-slate-200 bg-white/95 p-4 text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.text}</p>
                          {item.reason ? <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.reason}</p> : null}
                        </div>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{categoryLabel(item.category)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="Hành động gợi ý" subtitle="Lối tắt và nhận định gom trong một khu gọn hơn">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2.5">
                  {quickActions.length === 0 ? <p className="text-sm text-slate-500">{TXT.noQuickActions}</p> : quickActions.slice(0, 6).map((action, idx) => {
                    const mapped = normalizeQuickAction(action);
                    return askableAction(mapped) ? (
                      <button key={`action-${idx}`} type="button" onClick={() => handleQuickAction(mapped)} className="ui-soft-hover rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
                        {mapped.label}
                      </button>
                    ) : (
                      <Link key={`link-${idx}`} to={mapped.targetRoute} className="ui-soft-hover rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700">
                        {mapped.label}
                      </Link>
                    );
                  })}
                </div>

                <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
                  {insights.length === 0 ? <p className="text-sm text-slate-500">{TXT.noInsights}</p> : insights.slice(0, 4).map((insight) => (
                    <Link key={insight.id} to={insight.targetRoute} className="ui-soft-hover block rounded-[1.35rem] border border-slate-200 bg-white/95 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{categoryLabel(insight.type)}</p>
                          <p className="mt-2 text-sm font-semibold text-slate-900">{insight.label}</p>
                          {insight.message ? <p className="mt-2 text-xs text-slate-500">{insight.message}</p> : null}
                        </div>
                        <span className={`status-badge ${insightTone(insight.severity)}`}>{severityLabel(insight.severity)}</span>
                      </div>
                      <p className="mt-3 text-3xl font-extrabold tracking-tight text-brand-600">{insight.value}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </Card>

            <Card title="Tóm tắt theo vai trò" subtitle="Phần tóm tắt ngắn và ảnh chụp nhanh ưu tiên hiện tại">
              <SummaryPanel summary={summary} suggestions={freeSuggestions} />
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

