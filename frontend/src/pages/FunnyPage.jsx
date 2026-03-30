import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { funnyApi } from '../api/funnyApi';
import { apiErrorMessage } from '../api/helpers';

const TXT = {
  pageTitle: 'Funny - Preset Questions',
  cardTitle: 'Funny Answers from a Fixed Question Set',
  cardSubtitle: 'Preset Questions Only',
  emptyChat: 'No conversation yet. Pick a question and click "Ask Funny".',
  questionLabel: 'Select a question (30 practical templates)',
  selectedPrefix: 'Selected:',
  askBtn: 'Ask Funny',
  loadingBtn: 'Funny is processing...',
  healthTitle: 'Module Status',
  healthSubtitle: 'Funny backend health',
  loadingHealth: 'Loading module status...',
  noteTitle: 'Usage Notes',
  noteSubtitle: 'Fixed Flow',
  note1: 'No free-form question input.',
  note2: 'Only questions from the preset list are allowed.',
  note3: 'Each answer includes quick navigation links.',
  linksTitle: 'Related Links',
  loadQuestionError: 'Failed to load Funny question list',
  noAnswer: 'Funny has no response yet.',
  askError: 'Funny request failed',
  askErrorBubble: 'Funny failed to process this question. Please try again.'
};

function MessageBubble({ item }) {
  const isUser = item.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[90%] rounded-2xl border px-4 py-3 text-sm ${
          isUser
            ? 'border-brand-200 bg-brand-500 text-white'
            : 'border-slate-200 bg-white text-slate-800'
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{item.text}</p>
        ) : (
          <div className="space-y-2">
            <p className="whitespace-pre-wrap">{item.answer}</p>
            {item.intent ? (
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="status-badge border-slate-200 bg-slate-50 text-slate-700">
                  intent: {item.intent}
                </span>
                {item.meta?.fallback ? (
                  <span className="status-badge border-amber-200 bg-amber-50 text-amber-700">fallback</span>
                ) : null}
                {item.meta?.usedAI ? (
                  <span className="status-badge border-emerald-200 bg-emerald-50 text-emerald-700">
                    AI: {item.meta?.model || 'gemini'}
                  </span>
                ) : null}
              </div>
            ) : null}

            {Array.isArray(item.links) && item.links.length > 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                <p className="text-xs font-semibold text-slate-600">{TXT.linksTitle}</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {item.links.map((link) => (
                    <Link
                      key={`${item.id}-${link.path}`}
                      to={link.path}
                      className="rounded-lg border border-brand-200 bg-white px-2 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-50"
                    >
                      {link.label}
                    </Link>
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

export default function FunnyPage() {
  const [questions, setQuestions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [chat, setChat] = useState([]);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const conversationId = useMemo(
    () => `funny-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    []
  );

  useEffect(() => {
    async function bootstrap() {
      try {
        const [questionItems, healthData] = await Promise.all([
          funnyApi.questions(),
          funnyApi.health()
        ]);

        setQuestions(questionItems || []);
        if (questionItems?.[0]?.id) {
          setSelectedId(questionItems[0].id);
        }
        setHealth(healthData || null);
      } catch (err) {
        setError(apiErrorMessage(err, TXT.loadQuestionError));
      }
    }

    bootstrap();
  }, []);

  const selectedQuestion = questions.find((item) => item.id === selectedId);

  async function handleAsk() {
    if (!selectedId || loading) return;

    setError('');
    setLoading(true);

    const questionText = selectedQuestion?.text || '';
    setChat((prev) => [...prev, { id: `${Date.now()}-u`, role: 'user', text: questionText }]);

    try {
      const response = await funnyApi.chat({
        questionId: selectedId,
        conversationId
      });

      setChat((prev) => [
        ...prev,
        {
          id: `${Date.now()}-a`,
          role: 'assistant',
          answer: response?.answer || TXT.noAnswer,
          intent: response?.intent,
          links: response?.links || [],
          meta: response?.meta || {}
        }
      ]);
    } catch (err) {
      setError(apiErrorMessage(err, TXT.askError));
      setChat((prev) => [
        ...prev,
        {
          id: `${Date.now()}-e`,
          role: 'assistant',
          answer: TXT.askErrorBubble,
          intent: null,
          links: [],
          meta: {}
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout title={TXT.pageTitle}>
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title={TXT.cardTitle} subtitle={TXT.cardSubtitle}>
          <div className="space-y-4">
            <div className="max-h-[500px] space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              {chat.length === 0 ? (
                <p className="text-sm text-slate-500">{TXT.emptyChat}</p>
              ) : null}
              {chat.map((item) => (
                <MessageBubble key={item.id} item={item} />
              ))}
            </div>

            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{TXT.questionLabel}</p>
              <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                {questions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.text}
                  </option>
                ))}
              </select>

              {selectedQuestion ? (
                <p className="rounded-xl border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-slate-700">
                  {TXT.selectedPrefix} <span className="font-semibold">{selectedQuestion.text}</span>
                </p>
              ) : null}

              {error ? (
                <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              ) : null}

              <div className="flex justify-end">
                <Button type="button" onClick={handleAsk} disabled={loading || !selectedId}>
                  {loading ? TXT.loadingBtn : TXT.askBtn}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card title={TXT.healthTitle} subtitle={TXT.healthSubtitle}>
            {health ? (
              <div className="space-y-2 text-sm">
                <p className="text-slate-700">
                  DB:{' '}
                  <span className={`font-semibold ${health.dbConnected ? 'text-emerald-600' : 'text-red-600'}`}>
                    {health.dbConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </p>
                <p className="text-slate-700">
                  Gemini:{' '}
                  <span className={`font-semibold ${health.geminiConfigured ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {health.geminiConfigured ? 'Configured' : 'Not configured'}
                  </span>
                </p>
                <p className="text-slate-700">
                  Model: <span className="font-semibold text-slate-900">{health.model || 'N/A'}</span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-500">{TXT.loadingHealth}</p>
            )}
          </Card>

          <Card title={TXT.noteTitle} subtitle={TXT.noteSubtitle}>
            <ul className="list-disc space-y-1 pl-4 text-sm text-slate-600">
              <li>{TXT.note1}</li>
              <li>{TXT.note2}</li>
              <li>{TXT.note3}</li>
            </ul>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
