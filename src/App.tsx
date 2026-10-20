import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import NewAdmission from './pages/NewAdmission';
import StudentProfile from './pages/StudentProfile';
import Courses from './pages/Courses';
import FeeStructure from './pages/FeeStructure';
import CollectFee from './pages/CollectFee';
import FeeRecords from './pages/FeeRecords';
import OutstandingFees from './pages/OutstandingFees';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useApp();
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { state } = useApp();

  return (
    <Routes>
      <Route path="/login" element={
        state.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<Students />} />
        <Route path="students/new" element={<NewAdmission />} />
        <Route path="students/:id" element={<StudentProfile />} />
        <Route path="courses" element={<Courses />} />
        <Route path="fee-structure" element={<FeeStructure />} />
        <Route path="collect-fee" element={<CollectFee />} />
        <Route path="fee-records" element={<FeeRecords />} />
        <Route path="outstanding" element={<OutstandingFees />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
