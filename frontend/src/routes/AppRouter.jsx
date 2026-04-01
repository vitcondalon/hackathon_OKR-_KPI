import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import DepartmentsPage from '../pages/DepartmentsPage';
import CyclesPage from '../pages/CyclesPage';
import ObjectivesPage from '../pages/ObjectivesPage';
import KeyResultsPage from '../pages/KeyResultsPage';
import CheckinsPage from '../pages/CheckinsPage';
import KPIPage from '../pages/KPIPage';
import FunnyPage from '../pages/FunnyPage';
import ProfilePage from '../pages/ProfilePage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={(
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/users"
        element={(
          <ProtectedRoute roles={['admin', 'manager']}>
            <UsersPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/departments"
        element={(
          <ProtectedRoute roles={['admin', 'manager']}>
            <DepartmentsPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/cycles"
        element={(
          <ProtectedRoute roles={['admin', 'manager']}>
            <CyclesPage />
          </ProtectedRoute>
        )}
      />
      <Route path="/objectives" element={<ProtectedRoute><ObjectivesPage /></ProtectedRoute>} />
      <Route path="/key-results" element={<ProtectedRoute><KeyResultsPage /></ProtectedRoute>} />
      <Route path="/checkins" element={<ProtectedRoute><CheckinsPage /></ProtectedRoute>} />
      <Route path="/kpis" element={<ProtectedRoute><KPIPage /></ProtectedRoute>} />
      <Route path="/funny" element={<ProtectedRoute><FunnyPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
