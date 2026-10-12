import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { TacticalMapPage } from './pages/TacticalMapPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { SosTriagePage } from './pages/SosTriagePage';
import { VolunteersPage } from './pages/VolunteersPage';
import { SuppliesPage } from './pages/SuppliesPage';
import { WarehousesPage } from './pages/WarehousesPage';
import { DispatchesPage } from './pages/DispatchesPage';
import { AlertsPage } from './pages/AlertsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SpringBootPage } from './pages/SpringBootPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-mono text-xs">
        Authenticating EOC Session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected App Layout */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="map" element={<TacticalMapPage />} />
                <Route path="incidents" element={<IncidentsPage />} />
                <Route path="sos" element={<SosTriagePage />} />
                <Route path="volunteers" element={<VolunteersPage />} />
                <Route path="supplies" element={<SuppliesPage />} />
                <Route path="warehouses" element={<WarehousesPage />} />
                <Route path="dispatches" element={<DispatchesPage />} />
                <Route path="alerts" element={<AlertsPage />} />
                <Route path="audit-logs" element={<AuditLogsPage />} />
                <Route path="spring-boot" element={<SpringBootPage />} />
              </Route>

              {/* Wildcard Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
