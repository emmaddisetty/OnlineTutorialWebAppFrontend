import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import Connect from './pages/Connect';
import VerifyEmail from './pages/VerifyEmail';
import ManageCourses from './pages/ManageCourses';
import Schedule from './pages/schedule';
import Quizzes from './pages/Quizzes';

function App() {
  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', width: '100%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/manage-courses" element={<ManageCourses />} />
          <Route path="/connect" element={<Connect />} />
          <Route path="/verify/:token" element={<VerifyEmail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/quizzes" element={<Quizzes />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;