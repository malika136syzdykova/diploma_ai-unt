import { useState, useEffect, useRef } from 'react'
import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../api'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@400;700;900&family=Onest:wght@300;400;500;600&display=swap');

  :root {
    --ink: #0d0b18;
    --fog: #f4f2fb;
    --accent: #7c3aed;
    --accent2: #a855f7;
    --muted: #8b83a3;
    --card-bg: #ffffff;
    --border: rgba(124, 58, 237, 0.12);
    --glow: rgba(124, 58, 237, 0.15);
  }

  .test-root { font-family: 'Onest', sans-serif; color: var(--ink); }
  .ub { font-family: 'Unbounded', sans-serif; }

  /* ── SUBJECT SELECTION ── */
  .subject-header { margin-bottom: 36px; }
  .subject-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: rgba(124,58,237,0.08); border: 1px solid rgba(124,58,237,0.2);
    border-radius: 99px; padding: 5px 14px;
    font-size: 11px; font-weight: 700; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--accent); margin-bottom: 16px;
  }
  .subject-title {
    font-family: 'Unbounded', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.8rem);
    font-weight: 900; line-height: 1.1; color: var(--ink); margin-bottom: 10px;
  }
  .subject-title span { color: var(--accent); }
  .subject-sub { font-size: 1rem; color: var(--muted); }

  .subject-grid {
    display: grid; grid-template-columns: repeat(3,1fr); gap: 16px;
  }
  @media(max-width:900px){ .subject-grid{ grid-template-columns: repeat(2,1fr); } }
  @media(max-width:580px){ .subject-grid{ grid-template-columns: 1fr; } }

  .subject-card {
    background: var(--card-bg);
    border: 1.5px solid var(--border);
    border-radius: 24px; padding: 28px 24px;
    display: flex; flex-direction: column;
    transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
    cursor: default;
    position: relative; overflow: hidden;
  }
  .subject-card::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(ellipse at top left, rgba(124,58,237,0.06) 0%, transparent 60%);
    pointer-events: none;
  }
  .subject-card:hover {
    border-color: rgba(124,58,237,0.4);
    box-shadow: 0 8px 32px var(--glow);
    transform: translateY(-4px);
  }

  .subject-icon-wrap {
    width: 56px; height: 56px; border-radius: 16px;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.5rem; margin-bottom: 20px;
    box-shadow: 0 4px 16px rgba(124,58,237,0.3);
  }

  .subject-name {
    font-family: 'Unbounded', sans-serif;
    font-size: 1rem; font-weight: 700;
    color: var(--ink); line-height: 1.3; margin-bottom: 10px;
  }
  .subject-desc { font-size: 0.83rem; color: var(--muted); line-height: 1.6; flex: 1; margin-bottom: 16px; }
  .subject-count {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.78rem; font-weight: 600; color: var(--accent);
    background: rgba(124,58,237,0.07); border-radius: 8px;
    padding: 4px 10px; margin-bottom: 20px; width: fit-content;
  }

  .subject-btn {
    width: 100%; border: none; cursor: pointer;
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    color: #fff; font-family: 'Unbounded', sans-serif;
    font-size: 0.75rem; font-weight: 700;
    padding: 13px 20px; border-radius: 14px;
    box-shadow: 0 4px 20px rgba(124,58,237,0.35);
    transition: transform 0.2s, box-shadow 0.2s;
    letter-spacing: 0.03em;
  }
  .subject-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(124,58,237,0.5); }

  /* ── LOADING ── */
  .loader-wrap {
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; min-height: 60vh; gap: 16px;
  }
  .loader-ring {
    width: 48px; height: 48px; border-radius: 50%;
    border: 3px solid rgba(124,58,237,0.15);
    border-top-color: var(--accent);
    animation: spin 0.9s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loader-text { font-size: 0.9rem; color: var(--muted); }

  /* ── QUESTION ── */
  .q-layout { display: grid; grid-template-columns: 1fr 340px; gap: 20px; align-items: start; }
  @media(max-width:900px){ .q-layout{ grid-template-columns: 1fr; } }

  .q-card {
    background: var(--card-bg); border: 1.5px solid var(--border);
    border-radius: 24px; padding: 36px;
  }

  .q-meta {
    display: flex; align-items: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap;
  }
  .q-badge {
    font-size: 10px; font-weight: 700; letter-spacing: 0.1em;
    text-transform: uppercase; border-radius: 8px;
    padding: 4px 10px;
  }
  .q-badge-subject { background: rgba(124,58,237,0.1); color: var(--accent); }
  .q-badge-topic { background: var(--fog); color: var(--muted); }

  .q-text {
    font-size: 1.05rem; font-weight: 500; line-height: 1.7;
    color: var(--ink); margin-bottom: 28px;
  }

  .options-list { display: flex; flex-direction: column; gap: 10px; }

  .option-btn {
    width: 100%; text-align: left; border: 1.5px solid var(--border);
    border-radius: 14px; padding: 14px 18px; cursor: pointer;
    background: var(--card-bg); transition: border-color 0.2s, background 0.2s, transform 0.15s;
    display: flex; align-items: center; gap: 14px;
  }
  .option-btn:hover:not(:disabled) { border-color: rgba(124,58,237,0.4); background: rgba(124,58,237,0.03); transform: translateX(3px); }
  .option-btn:disabled { cursor: default; }

  .option-radio {
    width: 20px; height: 20px; border-radius: 50%;
    border: 2px solid #d1d5db; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    transition: border-color 0.2s, background 0.2s;
  }
  .option-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
  .option-text { font-size: 0.9rem; color: #374151; line-height: 1.45; }

  /* states */
  .opt-selected { border-color: var(--accent); background: rgba(124,58,237,0.05); }
  .opt-selected .option-radio { border-color: var(--accent); background: var(--accent); }
  .opt-correct { border-color: #16a34a; background: #f0fdf4; }
  .opt-correct .option-radio { border-color: #16a34a; background: #16a34a; }
  .opt-wrong { border-color: #dc2626; background: #fef2f2; }
  .opt-wrong .option-radio { border-color: #dc2626; background: #dc2626; }
  .opt-dim { border-color: #e5e7eb; background: #fafafa; }
  .opt-dim .option-text { color: #9ca3af; }

  /* ── ACTIONS ── */
  .action-row { display: flex; gap: 12px; margin-top: 28px; flex-wrap: wrap; }

  .btn {
    border: none; cursor: pointer; font-family: 'Onest', sans-serif;
    font-weight: 700; font-size: 0.88rem; border-radius: 12px;
    padding: 12px 24px; transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
    display: inline-flex; align-items: center; gap: 8px;
  }
  .btn:hover:not(:disabled) { transform: translateY(-2px); }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .btn-primary {
    background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff;
    box-shadow: 0 4px 18px rgba(124,58,237,0.35);
  }
  .btn-primary:hover:not(:disabled) { box-shadow: 0 8px 28px rgba(124,58,237,0.5); }

  .btn-ghost {
    background: var(--fog); color: var(--ink); border: 1.5px solid var(--border);
  }
  .btn-ghost:hover:not(:disabled) { border-color: rgba(124,58,237,0.4); }

  .btn-success {
    background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff;
    box-shadow: 0 4px 18px rgba(22,163,74,0.3);
  }
  .btn-success:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(22,163,74,0.45); }

  /* ── SIDEBAR ── */
  .sidebar { display: flex; flex-direction: column; gap: 16px; }

  .result-card {
    border-radius: 20px; padding: 24px; border: 1.5px solid;
    animation: slide-in 0.35s ease;
  }
  @keyframes slide-in { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }

  .result-card.correct { border-color: #bbf7d0; background: #f0fdf4; }
  .result-card.wrong { border-color: #fecaca; background: #fef2f2; }

  .result-verdict {
    font-family: 'Unbounded', sans-serif;
    font-size: 1rem; font-weight: 900; margin-bottom: 10px;
  }
  .result-verdict.correct { color: #16a34a; }
  .result-verdict.wrong { color: #dc2626; }

  .result-answer-label { font-size: 0.75rem; font-weight: 600; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
  .result-answer-val { font-size: 0.88rem; font-weight: 600; color: var(--ink); margin-bottom: 12px; }

  .result-explanation {
    font-size: 0.83rem; color: #4b5563; line-height: 1.6;
    background: rgba(255,255,255,0.7); border-radius: 10px; padding: 12px;
    border: 1px solid rgba(0,0,0,0.06);
  }

  /* AI feedback */
  .ai-card {
    background: var(--ink); border-radius: 20px; padding: 22px;
    animation: slide-in 0.4s ease 0.1s both;
  }
  .ai-card-header {
    display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
  }
  .ai-dot { width: 8px; height: 8px; border-radius: 50%; background: #a855f7; animation: pulse-dot 2s ease-in-out infinite; }
  @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
  .ai-label { font-family: 'Unbounded', sans-serif; font-size: 0.75rem; font-weight: 700; color: #c4b5fd; letter-spacing: 0.06em; }
  .ai-text { font-size: 0.83rem; color: rgba(255,255,255,0.75); line-height: 1.65; }
  .ai-loading { font-size: 0.83rem; color: rgba(255,255,255,0.45); font-style: italic; }

  .chat-btn-wrap { display: flex; }
  .chat-open-btn {
    width: 100%; border: 1.5px solid rgba(124,58,237,0.3); border-radius: 16px;
    padding: 14px 20px; background: rgba(124,58,237,0.05); cursor: pointer;
    display: flex; align-items: center; gap: 10px; transition: border-color 0.2s, background 0.2s;
    font-family: 'Onest', sans-serif;
  }
  .chat-open-btn:hover { border-color: rgba(124,58,237,0.5); background: rgba(124,58,237,0.08); }
  .chat-open-icon { font-size: 1.2rem; }
  .chat-open-text { font-size: 0.88rem; font-weight: 600; color: var(--accent); }
  .chat-open-sub { font-size: 0.75rem; color: var(--muted); }

  /* ── CHAT MODAL ── */
  .chat-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(13,11,24,0.6); backdrop-filter: blur(6px);
    display: flex; align-items: flex-end; justify-content: center; padding: 0;
    animation: fade-in 0.2s ease;
  }
  @keyframes fade-in { from{opacity:0} to{opacity:1} }
  @media(min-width:640px){ .chat-overlay{ align-items: center; padding: 20px; } }

  .chat-modal {
    width: 100%; max-width: 600px;
    background: var(--card-bg); border-radius: 24px 24px 0 0;
    overflow: hidden; display: flex; flex-direction: column;
    max-height: 90vh; box-shadow: 0 -8px 60px rgba(0,0,0,0.3);
    animation: slide-up 0.3s ease;
  }
  @keyframes slide-up { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
  @media(min-width:640px){ .chat-modal{ border-radius: 24px; max-height: 80vh; } }

  .chat-header {
    padding: 18px 22px; border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }
  .chat-header-icon { font-size: 1rem; }
  .chat-header-title { font-family: 'Unbounded', sans-serif; font-size: 0.85rem; font-weight: 700; color: var(--ink); flex: 1; }
  .chat-close {
    background: var(--fog); border: none; cursor: pointer;
    width: 30px; height: 30px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem; color: var(--muted); transition: background 0.2s;
  }
  .chat-close:hover { background: #e9e5f8; }

  .chat-messages {
    flex: 1; overflow-y: auto; padding: 18px;
    display: flex; flex-direction: column; gap: 12px;
    background: var(--fog);
  }

  .chat-bubble-wrap { display: flex; }
  .chat-bubble-wrap.user { justify-content: flex-end; }

  .chat-bubble {
    max-width: 78%; border-radius: 18px;
    padding: 11px 16px; font-size: 0.88rem; line-height: 1.55;
  }
  .bubble-ai {
    background: var(--card-bg); border: 1px solid var(--border); color: var(--ink);
    border-bottom-left-radius: 4px;
  }
  .bubble-user {
    background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff;
    border-bottom-right-radius: 4px;
  }
  .bubble-typing { color: var(--muted); font-style: italic; }

  .chat-input-area {
    padding: 14px 16px; border-top: 1px solid var(--border);
    display: flex; gap: 10px; align-items: center;
  }
  .chat-input {
    flex: 1; border: 1.5px solid var(--border); border-radius: 14px;
    padding: 11px 16px; font-size: 0.88rem; font-family: 'Onest', sans-serif;
    background: var(--fog); color: var(--ink); outline: none;
    transition: border-color 0.2s;
  }
  .chat-input:focus { border-color: rgba(124,58,237,0.5); background: #fff; }
  .chat-send {
    width: 42px; height: 42px; border-radius: 12px; border: none; cursor: pointer;
    background: linear-gradient(135deg, #7c3aed, #a855f7); color: #fff;
    display: flex; align-items: center; justify-content: center; font-size: 1rem;
    transition: transform 0.15s, box-shadow 0.15s; box-shadow: 0 3px 12px rgba(124,58,237,0.35);
    flex-shrink: 0;
  }
  .chat-send:hover:not(:disabled) { transform: scale(1.08); box-shadow: 0 5px 18px rgba(124,58,237,0.5); }
  .chat-send:disabled { opacity: 0.4; cursor: not-allowed; }
`

export default function Test() {
  const { userId, authLoading } = useUser()
  const navigate = useNavigate()
  const [selectedSubject, setSelectedSubject] = useState('')
  const [question, setQuestion] = useState(null)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [aiFeedback, setAiFeedback] = useState('')
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false)
  const [aiFeedbackError, setAiFeedbackError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [options, setOptions] = useState([])
  const [chatOpen, setChatOpen] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatError, setChatError] = useState('')
  const chatEndRef = useRef(null)
  const [questionLimit, setQuestionLimit] = useState(10)
  const [answeredInSession, setAnsweredInSession] = useState(0)
  const [correctInSession, setCorrectInSession] = useState(0)
  const askedIdsRef = useRef([])
  const [wrongSnapshots, setWrongSnapshots] = useState([])
  const [mistakeReviewOpen, setMistakeReviewOpen] = useState(false)
  const [mistakeIndex, setMistakeIndex] = useState(0)

  useEffect(() => {
    if (authLoading) return
    if (!userId) navigate('/login')
  }, [authLoading, userId, navigate])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, chatLoading])

  const subjectCards = [
    { id: 'math', name: 'Математическая грамотность', desc: 'Логика, базовые вычисления и практические задачи.', count: '10 вопросов', questionLimit: 10, icon: '🧮' },
    { id: 'history', name: 'История Казахстана', desc: 'Ключевые события, даты, личности и исторические процессы.', count: '20 вопросов', questionLimit: 20, icon: '🏛️' },
    { id: 'reading', name: 'Грамотность чтения', desc: 'Понимание текста, анализ и интерпретация информации.', count: '10 вопросов', questionLimit: 10, icon: '📘' },
  ]

  const fetchQuestion = async (subjectForApi) => {
    const subj = subjectForApi ?? selectedSubject
    setLoading(true); setSelectedAnswer(''); setResult(null)
    setAiFeedback(''); setAiFeedbackError('')
    setChatOpen(false); setChatMessages([]); setChatInput(''); setChatError('')
    try {
      const params = new URLSearchParams({ user_id: String(userId), subject: subj })
      const ex = askedIdsRef.current
      if (ex.length > 0) params.set('exclude_ids', ex.join(','))
      const res = await apiFetch(`/api/questions?${params.toString()}`)
      const data = await res.json()
      if (data.length > 0) {
        const q = data[0]
        askedIdsRef.current = [...askedIdsRef.current, q.id]
        setQuestion(q)
        try { setOptions(typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || [])) }
        catch { setOptions([]) }
      } else { setQuestion(null); setOptions([]) }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  const startTest = (card) => {
    setSelectedSubject(card.name)
    setQuestionLimit(card.questionLimit)
    setAnsweredInSession(0)
    setCorrectInSession(0)
    askedIdsRef.current = []
    setWrongSnapshots([])
    setMistakeReviewOpen(false)
    setMistakeIndex(0)
    fetchQuestion(card.name)
  }

  const backToSubjects = () => {
    setSelectedSubject('')
    setQuestion(null)
    setResult(null)
    setAnsweredInSession(0)
    setCorrectInSession(0)
    askedIdsRef.current = []
    setWrongSnapshots([])
    setMistakeReviewOpen(false)
    setMistakeIndex(0)
  }

  const handleAnswerSelect = (a) => { if (!result) setSelectedAnswer(a) }

  const handleSubmit = async () => {
    if (!selectedAnswer || !question) return
    setSubmitting(true)
    try {
      const res = await apiFetch('/api/answer', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, question_id: question.id, user_answer: selectedAnswer }),
      })
      const data = await res.json()
      const r = { correct: data.correct, correct_answer: data.correct_answer, explanation: data.explanation }
      setResult(r)
      setAnsweredInSession((n) => n + 1)
      if (data.correct) setCorrectInSession((c) => c + 1)
      else {
        setWrongSnapshots((prev) => [
          ...prev,
          {
            id: question.id,
            question_text: question.question_text,
            topic: question.topic,
            options: Array.isArray(options) ? [...options] : [],
            user_answer: selectedAnswer,
            correct_answer: data.correct_answer,
            explanation: data.explanation || '',
          },
        ])
      }
      if (!r.correct) fetchAIFeedback(r)
    } catch (e) { console.error(e); alert('Ошибка при отправке ответа') }
    finally { setSubmitting(false) }
  }

  const fetchAIFeedback = async (r) => {
    if (!question) return
    setAiFeedback(''); setAiFeedbackError(''); setAiFeedbackLoading(true)
    try {
      const res = await apiFetch('/api/ai-feedback', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.question_text, correct_answer: r.correct_answer, user_answer: selectedAnswer, explanation: r.explanation || '' }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAiFeedback(data.ai_feedback || '')
    } catch { setAiFeedbackError('Не удалось получить подсказку от AI.') }
    finally { setAiFeedbackLoading(false) }
  }

  const openChat = () => {
    setChatOpen(true); setChatError('')
    if (chatMessages.length === 0)
      setChatMessages([{ role: 'ai', text: 'Я помогу разобрать этот вопрос. Спроси, что осталось непонятно.' }])
  }

  const sendChatMessage = async () => {
    const t = chatInput.trim()
    if (!t || chatLoading || !result) return
    setChatMessages(p => [...p, { role: 'user', text: t }])
    setChatInput(''); setChatError(''); setChatLoading(true)
    try {
      const res = await apiFetch('/api/ai-chat', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: t, context: { question: question?.question_text || '', correct_answer: result.correct_answer, user_answer: selectedAnswer } }),
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setChatMessages(p => [...p, { role: 'ai', text: data.reply || 'Не удалось получить ответ.' }])
    } catch { setChatError('Ошибка отправки. Попробуйте снова.') }
    finally { setChatLoading(false) }
  }

  const getOptionClass = (opt) => {
    if (!result) return selectedAnswer === opt ? 'opt-selected' : ''
    if (opt === result.correct_answer) return 'opt-correct'
    if (opt === selectedAnswer && !result.correct) return 'opt-wrong'
    return 'opt-dim'
  }

  const openMistakeReview = () => {
    setMistakeIndex(0)
    setMistakeReviewOpen(true)
  }

  const finishMistakeReview = () => {
    setMistakeReviewOpen(false)
    setMistakeIndex(0)
  }

  // ── Работа над ошибками (после блока) ──
  if (selectedSubject && mistakeReviewOpen && wrongSnapshots.length > 0) {
    const w = wrongSnapshots[mistakeIndex]
    const isLast = mistakeIndex >= wrongSnapshots.length - 1
    return (
      <div className="test-root">
        <style>{styles}</style>
        <div className="q-card" style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="q-meta">
            <span className="q-badge q-badge-subject">{selectedSubject}</span>
            <span className="q-badge q-badge-topic">Разбор ошибок</span>
            <span className="q-badge q-badge-topic" style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--accent)' }}>
              Ошибка {mistakeIndex + 1} из {wrongSnapshots.length}
            </span>
          </div>
          {w.topic && (
            <div style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: 12 }}>{w.topic}</div>
          )}
          <div className="q-text">{w.question_text}</div>
          <div className="options-list" style={{ marginBottom: 20 }}>
            {(w.options || []).map((opt, i) => {
              let cls = 'option-btn opt-dim'
              if (opt === w.correct_answer) cls = 'option-btn opt-correct'
              else if (opt === w.user_answer) cls = 'option-btn opt-wrong'
              return (
                <div key={i} className={cls} style={{ cursor: 'default' }}>
                  <div className="option-radio">
                    {(opt === w.correct_answer || opt === w.user_answer) && (
                      <div className="option-radio-dot" />
                    )}
                  </div>
                  <span className="option-text">{opt}</span>
                </div>
              )
            })}
          </div>
          {w.explanation && (
            <div className="result-explanation" style={{ marginBottom: 24 }}>
              {w.explanation}
            </div>
          )}
          <div className="action-row">
            <button type="button" className="btn btn-ghost" onClick={finishMistakeReview}>
              Закрыть разбор
            </button>
            {!isLast ? (
              <button type="button" className="btn btn-primary" onClick={() => setMistakeIndex((i) => i + 1)}>
                Следующая ошибка →
              </button>
            ) : (
              <button type="button" className="btn btn-success" onClick={() => { finishMistakeReview(); backToSubjects() }}>
                Готово
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── SUBJECT SELECTION ──
  if (!selectedSubject) return (
    <div className="test-root">
      <style>{styles}</style>
      <div className="subject-header">
        <div className="subject-eyebrow">✦ Тесты ЕНТ</div>
        <h1 className="subject-title">Выберите <span>предмет</span></h1>
      </div>
      <div className="subject-grid">
        {subjectCards.map(s => (
          <div className="subject-card" key={s.id}>
            <div className="subject-icon-wrap">{s.icon}</div>
            <div className="subject-name">{s.name}</div>
            <div className="subject-desc">{s.desc}</div>
            <div className="subject-count">◉ {s.count}</div>
            <button className="subject-btn" onClick={() => startTest(s)}>Начать тест →</button>
          </div>
        ))}
      </div>
    </div>
  )

  // ── LOADING ──
  if (loading) return (
    <div className="test-root">
      <style>{styles}</style>
      <div className="loader-wrap">
        <div className="loader-ring" />
        <div className="loader-text">Загрузка вопроса...</div>
      </div>
    </div>
  )

  // ── NO QUESTION ──
  if (!question) return (
    <div className="test-root">
      <style>{styles}</style>
      <div className="loader-wrap">
        <div style={{ fontSize: '2rem' }}>🎉</div>
        <div className="loader-text">Вопросы не найдены</div>
      </div>
    </div>
  )

  // ── QUESTION ──
  return (
    <div className="test-root">
      <style>{styles}</style>

      <div className="q-layout">
        {/* Left: question card */}
        <div className="q-card">
          <div className="q-meta">
            <span className="q-badge q-badge-subject">{selectedSubject}</span>
            {question.topic && <span className="q-badge q-badge-topic">{question.topic}</span>}
            <span className="q-badge q-badge-topic" style={{ background: 'rgba(124,58,237,0.12)', color: 'var(--accent)' }}>
              {result ? `Отвечено: ${answeredInSession} / ${questionLimit}` : `Вопрос ${answeredInSession + 1} из ${questionLimit}`}
            </span>
          </div>

          <div className="q-text">{question.question_text}</div>

          <div className="options-list">
            {options.map((opt, i) => (
              <button
                key={i}
                className={`option-btn ${getOptionClass(opt)}`}
                onClick={() => handleAnswerSelect(opt)}
                disabled={!!result}
              >
                <div className="option-radio">
                  {(selectedAnswer === opt || (result && opt === result.correct_answer)) && (
                    <div className="option-radio-dot" />
                  )}
                </div>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>

          <div className="action-row">
            <button type="button" className="btn btn-ghost" onClick={backToSubjects}>
              ← К предметам
            </button>
            {!result && (
              <button
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={!selectedAnswer || submitting}
              >
                {submitting ? 'Отправка...' : 'Проверить ответ'}
              </button>
            )}
            {result && (
              <>
                {!result.correct && (
                  <button className="btn btn-ghost" onClick={openChat}>
                    💬 Обсудить с AI
                  </button>
                )}
                {answeredInSession >= questionLimit ? (
                  <>
                    <button type="button" className="btn btn-ghost" onClick={backToSubjects}>
                      Завершить тренировку
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => navigate('/progress')}>
                      Проверить результаты
                    </button>
                    {wrongSnapshots.length > 0 && (
                      <button type="button" className="btn btn-success" onClick={openMistakeReview}>
                        Работа над ошибками ({wrongSnapshots.length})
                      </button>
                    )}
                  </>
                ) : (
                  <button className="btn btn-success" onClick={() => fetchQuestion()}>
                    Следующий вопрос →
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right: sidebar */}
        <div className="sidebar">
          {result && answeredInSession >= questionLimit && (
            <div className="q-card" style={{ border: '1.5px solid #bbf7d0', background: '#f0fdf4' }}>
              <div style={{ fontFamily: 'Unbounded, sans-serif', fontWeight: 800, fontSize: '0.95rem', color: '#15803d', marginBottom: 8 }}>
                Блок завершён
              </div>
              <div style={{ fontSize: '0.88rem', color: '#166534', marginBottom: 14 }}>
                Правильных ответов: <strong>{correctInSession}</strong> из {questionLimit}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button type="button" className="btn btn-ghost" style={{ width: '100%' }} onClick={backToSubjects}>
                  Завершить тренировку
                </button>
                <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/progress')}>
                  Проверить результаты
                </button>
                {wrongSnapshots.length > 0 && (
                  <button type="button" className="btn btn-success" style={{ width: '100%' }} onClick={openMistakeReview}>
                    Работа над ошибками ({wrongSnapshots.length})
                  </button>
                )}
              </div>
            </div>
          )}

          {result && (
            <div className={`result-card ${result.correct ? 'correct' : 'wrong'}`}>
              <div className={`result-verdict ${result.correct ? 'correct' : 'wrong'}`}>
                {result.correct ? '✓ Правильно!' : '✗ Неправильно'}
              </div>
              <div className="result-answer-label">Правильный ответ</div>
              <div className="result-answer-val">{result.correct_answer}</div>
              {result.explanation && (
                <div className="result-explanation">{result.explanation}</div>
              )}
            </div>
          )}

          {result && !result.correct && (
            <div className="ai-card">
              <div className="ai-card-header">
                <div className="ai-dot" />
                <div className="ai-label">AI‑подсказка</div>
              </div>
              {aiFeedbackLoading && <div className="ai-loading">Анализирую ответ...</div>}
              {!aiFeedbackLoading && aiFeedbackError && (
                <div className="ai-text" style={{ color: '#fca5a5' }}>{aiFeedbackError}</div>
              )}
              {!aiFeedbackLoading && aiFeedback && (
                <div className="ai-text">{aiFeedback}</div>
              )}
            </div>
          )}

          {result && !result.correct && (
            <div className="chat-btn-wrap">
              <button className="chat-open-btn" onClick={openChat}>
                <span className="chat-open-icon">💬</span>
                <div>
                  <div className="chat-open-text">Обсудить с AI</div>
                  <div className="chat-open-sub">Задай любой вопрос по теме</div>
                </div>
              </button>
            </div>
          )}

          {!result && (
            <div className="q-card" style={{ background: 'var(--fog)', border: 'none', padding: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>Совет</div>
              <div style={{ fontSize: '0.83rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                Читайте вопрос внимательно. Исключайте явно неверные варианты и выбирайте наиболее точный ответ.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="chat-overlay" onClick={(e) => e.target === e.currentTarget && setChatOpen(false)}>
          <div className="chat-modal">
            <div className="chat-header">
              <span className="chat-header-icon">🤖</span>
              <span className="chat-header-title">AI‑наставник</span>
              <button className="chat-close" onClick={() => setChatOpen(false)}>✕</button>
            </div>

            <div className="chat-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-bubble-wrap ${msg.role === 'user' ? 'user' : ''}`}>
                  <div className={`chat-bubble ${msg.role === 'ai' ? 'bubble-ai' : 'bubble-user'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="chat-bubble-wrap">
                  <div className="chat-bubble bubble-ai bubble-typing">AI печатает...</div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
              {chatError && <div style={{ fontSize: '0.78rem', color: '#dc2626', marginBottom: 6 }}>{chatError}</div>}
              <input
                className="chat-input"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendChatMessage() } }}
                placeholder="Задай вопрос по этой теме..."
              />
              <button
                className="chat-send"
                onClick={sendChatMessage}
                disabled={!chatInput.trim() || chatLoading}
              >
                ↑
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}