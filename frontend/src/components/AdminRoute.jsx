import { Navigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

export default function AdminRoute({ children }) {
  const { token, user, authLoading } = useUser()

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-lg text-slate-600">Загрузка...</div>
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!user?.is_admin) {
    return <Navigate to="/" replace />
  }

  return children
}
