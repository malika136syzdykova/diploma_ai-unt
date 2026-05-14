import { Link } from 'react-router-dom'

export default function Admin() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-2 text-3xl font-extrabold text-slate-900">Админ-панель</h1>
      <p className="mb-8 text-slate-600">
        Управление контентом тренажёра. Добавление вопросов доступно только отсюда.
      </p>
      <div className="rounded-3xl border border-[#e7e4f2] bg-white p-8 shadow-sm">
        <Link
          to="/admin/questions"
          className="flex items-center justify-between rounded-2xl border border-violet-200 bg-violet-50 px-6 py-4 font-semibold text-violet-900 transition hover:bg-violet-100"
        >
          <span>Добавить вопрос в базу</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  )
}
