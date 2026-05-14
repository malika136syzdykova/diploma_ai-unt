import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from './context/UserContext'
import Home from './pages/Home'
import Test from './pages/Test'
import Progress from './pages/Progress'
import Register from './pages/Register'
import Login from './pages/Login'
import Prediction from './pages/Prediction'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import Profile from './pages/Profile'
import AddQuestion from './pages/AddQuestion'
import Admin from './pages/Admin'

function App() {
  return (
    <UserProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/test"
              element={
                <ProtectedRoute>
                  <Test />
                </ProtectedRoute>
              }
            />
            <Route
              path="/progress"
              element={
                <ProtectedRoute>
                  <Progress />
                </ProtectedRoute>
              }
            />
            <Route
              path="/prediction"
              element={
                <ProtectedRoute>
                  <Prediction />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/questions"
              element={
                <AdminRoute>
                  <AddQuestion />
                </AdminRoute>
              }
            />
          </Routes>
        </Layout>
      </Router>
    </UserProvider>
  )
}

export default App

