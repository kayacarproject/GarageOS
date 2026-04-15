import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { CompanyDetail } from './pages/CompanyDetail';
import { CompanyUsers } from './pages/CompanyUsers';
import { Subscriptions } from './pages/Subscriptions';
import { Settings } from './pages/Settings';

// ─── Auth Guard ───────────────────────────────────────────────────────────────

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || user?.role !== 'superadmin') {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected — superadmin only */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"                    element={<Dashboard />} />
            <Route path="companies"                    element={<Companies />} />
            <Route path="companies/:id"                element={<CompanyDetail />} />
            <Route path="companies/:id/users"          element={<CompanyUsers />} />
            <Route path="subscriptions"                element={<Subscriptions />} />
            <Route path="settings"                     element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
