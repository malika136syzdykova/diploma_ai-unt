import { useState, useEffect } from 'react'
import { useUser } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

function Progress() {
  const { userId, authLoading } = useUser()
  const navigate = useNavigate()
  const [progress, setProgress] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subjectPredictions, setSubjectPredictions] = useState({})

  const subjects = [
    'Математическая грамотность',
    'Грамотность чтения',
    'История Казахстана',
  ]

  const entMaxForSubject = (subject) => (subject === 'История Казахстана' ? 20 : 10)

  useEffect(() => {
    if (authLoading) return
    if (!userId) {
      navigate('/login')
      return
    }
    fetchProgress()
  }, [authLoading, userId])

  const fetchProgress = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/progress/${userId}`)
      const data = await res.json()
      setProgress(data)
      await fetchPredictionsBySubject()
    } finally {
      setLoading(false)
    }
  }

  const fetchPredictionsBySubject = async () => {
    const entries = await Promise.all(
      subjects.map(async (subject) => {
        try {
          const res = await fetch(`/api/prediction/${userId}?subject=${encodeURIComponent(subject)}`)
          const data = await res.json()
          return [subject, data]
        } catch {
          return [subject, null]
        }
      })
    )
    setSubjectPredictions(Object.fromEntries(entries))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Загрузка...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f7ff] px-6 py-10">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-2">Ваш прогресс</h1>
          <p className="text-gray-500">Отслеживайте результаты и анализируйте слабые темы</p>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Всего вопросов', value: progress.total_questions },
            { label: 'Правильных ответов', value: progress.correct_answers },
            { label: 'Точность', value: `${progress.percentage.toFixed(1)}%` },
          ].map((item, i) => (
            <div key={i} className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
              <div className="text-gray-500 text-sm mb-2">{item.label}</div>
              <div className="text-4xl font-extrabold text-violet-600">{item.value}</div>
            </div>
          ))}
        </div>

        {/* PROGRESS BAR */}
        <div className="rounded-2xl p-6 mb-10 bg-white border border-gray-200 shadow-sm">
          <div className="flex justify-between text-sm text-gray-600 mb-3">
            <span>Общий прогресс</span>
            <span>{progress.correct_answers} / {progress.total_questions}</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* SUBJECTS */}
        <div className="space-y-6">
          {subjects.map((subject) => {
            const data = subjectPredictions[subject]
            const sections = data?.section_scores || []

            return (
              <div key={subject} className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-slate-900">{subject}</h3>
                  {data && (
                    <span className="text-sm text-gray-500">
                      Балл:{' '}
                      <span className="font-semibold text-violet-600">
                        {data.predicted_score?.toFixed?.(1)} / {data.subject_max_score ?? entMaxForSubject(subject)}
                      </span>
                    </span>
                  )}
                </div>

                {sections.length === 0 ? (
                  <p className="text-gray-400">Нет данных по подтемам</p>
                ) : (
                  <div className="space-y-4">
                    {sections.map((section, idx) => (
                      <div key={idx}>

                        {/* NAME OF SUBTOPIC */}
                        <div className="flex justify-between mb-1 text-sm">
                          <span className="font-medium text-slate-800">
                            {section.section_name || `Подтема ${idx + 1}`}
                          </span>
                          <span className="text-gray-500">
                            {(section.mastery * 100).toFixed(0)}%
                          </span>
                        </div>

                        {/* EXTRA INFO */}
                        <div className="text-xs text-gray-400 mb-2">
                          Вес: {section.weight} · Балл: {section.score.toFixed(1)} / {section.weight}
                        </div>

                        {/* BAR */}
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-indigo-500"
                            style={{ width: `${section.mastery * 100}%` }}
                          />
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}

export default Progress
