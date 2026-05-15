import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { apiFetch } from '../api'

const SUBJECTS = [
  'Математическая грамотность',
  'Грамотность чтения',
  'История Казахстана',
]

export default function AddQuestion() {
  const { token, userId, authLoading } = useUser()
  const navigate = useNavigate()
  const [subject, setSubject] = useState(SUBJECTS[0])
  const [topic, setTopic] = useState('')
  const [questionText, setQuestionText] = useState('')
  const [opts, setOpts] = useState(['', '', '', '', ''])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (!authLoading && !userId) navigate('/login')
  }, [authLoading, userId, navigate])

  const nonEmptyOptions = opts.map((o) => o.trim()).filter(Boolean)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!token) {
      setError('Войдите в аккаунт.')
      return
    }
    if (nonEmptyOptions.length < 2) {
      setError('Заполните минимум два варианта ответа.')
      return
    }
    if (!correctAnswer || !nonEmptyOptions.includes(correctAnswer)) {
      setError('Выберите правильный ответ из списка вариантов.')
      return
    }
    setLoading(true)
    try {
      const res = await apiFetch('/api/questions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject,
          topic: topic.trim() || 'Общее',
          question_text: questionText.trim(),
          options: nonEmptyOptions,
          correct_answer: correctAnswer,
          explanation: explanation.trim(),
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error(data.error || 'Нет прав администратора')
        }
        throw new Error(data.error || 'Ошибка сохранения')
      }
      setSuccess(`Вопрос сохранён (id: ${data.id}).`)
      setQuestionText('')
      setOpts(['', '', '', '', ''])
      setCorrectAnswer('')
      setExplanation('')
    } catch (err) {
      setError(err.message || 'Не удалось сохранить.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <Link to="/admin" className="text-sm font-semibold text-violet-700 hover:underline">
          ← Админ-панель
        </Link>
      </div>
      <h1 className="mb-2 text-3xl font-extrabold text-slate-900">Добавить вопрос</h1>
      <p className="mb-8 text-slate-600">
        Только для администратора. Вопрос попадёт в общую базу тестов ЕНТ.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{success}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-[#e7e4f2] bg-white p-8 shadow-sm">
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Предмет</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-slate-900 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Тема / подтема</label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            placeholder="Например: Проценты и дроби"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Текст вопроса</label>
          <textarea
            required
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            placeholder="Формулировка вопроса..."
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Варианты ответов (2–6)</label>
          <div className="space-y-2">
            {opts.map((o, i) => (
              <input
                key={i}
                value={o}
                onChange={(e) => {
                  const next = [...opts]
                  next[i] = e.target.value
                  setOpts(next)
                }}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
                placeholder={`Вариант ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Правильный ответ</label>
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
          >
            <option value="">— выберите из введённых вариантов —</option>
            {nonEmptyOptions.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Пояснение (необязательно)</label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200"
            placeholder="Краткое объяснение для разбора после ответа"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-500 py-3.5 text-sm font-bold text-white shadow-md transition hover:brightness-105 disabled:opacity-50"
        >
          {loading ? 'Сохранение...' : 'Сохранить вопрос'}
        </button>
      </form>
    </div>
  )
}
