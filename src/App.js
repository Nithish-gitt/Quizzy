import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import FileUploadValidator from './FIleUploadValidator';
import CandidateTable from './CandidateTable';
import QuizPage from './QuizPage';
import LoginPage from './LoginPage';
import ResetPassword from './ResetPassword';
import AdminDashboard from './AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './UserDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/upload" element={
          <ProtectedRoute>
              <FileUploadValidator />
          </ProtectedRoute>} />
          <Route path='test-results' element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/candidates" element={<ProtectedRoute><CandidateTable /></ProtectedRoute>} />
        <Route path="/quiz" element={<ProtectedRoute><QuizPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;

