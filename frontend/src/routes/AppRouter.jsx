import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from '../pages/LoginPage';
import WorkspacePage from '../pages/WorkspacePage';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/workspace"
        element={(
          <ProtectedRoute>
            <WorkspacePage />
          </ProtectedRoute>
        )}
      />
      <Route path="/" element={<Navigate to="/workspace" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
