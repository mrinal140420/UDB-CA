import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ui/ProtectedRoute";
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const WorkerDashboard = lazy(() => import("./pages/worker/WorkerDashboard"));
const MyItemRequestsPage = lazy(() => import("./pages/worker/MyItemRequestsPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const SuperAdminDashboard = lazy(() => import("./pages/superadmin/SuperAdminDashboard"));
const ItemsPage = lazy(() => import("./pages/common/ItemsPage"));
const SuppliersPage = lazy(() => import("./pages/common/SuppliersPage"));
const TransactionsPage = lazy(() => import("./pages/common/TransactionsPage"));
const LowStockPage = lazy(() => import("./pages/common/LowStockPage"));
const ReportsPage = lazy(() => import("./pages/common/ReportsPage"));
const ItemRequestsPage = lazy(() => import("./pages/common/ItemRequestsPage"));
const ProfilePage = lazy(() => import("./pages/common/ProfilePage"));
const ItemDetailsPage = lazy(() => import("./pages/common/ItemDetailsPage"));
const UserManagementPage = lazy(() => import("./pages/superadmin/UserManagementPage"));
const AuditLogsPage = lazy(() => import("./pages/superadmin/AuditLogsPage"));
const SettingsPage = lazy(() => import("./pages/superadmin/SettingsPage"));
const UnauthorizedPage = lazy(() => import("./pages/common/UnauthorizedPage"));
const NotFoundPage = lazy(() => import("./pages/common/NotFoundPage"));

function RouteFallback() {
  return <div className="panel m-4 p-6">Loading page...</div>;
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route
          element={
            <ProtectedRoute roles={["worker", "admin", "super_admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/worker" element={<WorkerDashboard />} />
          <Route
            path="/my-requests"
            element={
              <ProtectedRoute roles={["worker"]}>
                <MyItemRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/super-admin" element={<SuperAdminDashboard />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route path="/items/:id" element={<ItemDetailsPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/low-stock" element={<LowStockPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route
            path="/item-requests"
            element={
              <ProtectedRoute roles={["admin", "super_admin"]}>
                <ItemRequestsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />

          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["super_admin"]}>
                <UserManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute roles={["super_admin"]}>
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute roles={["super_admin"]}>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
