import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../context/useAuthStore";

export default function ProtectedRoute({ roles, children }) {
  const { token, user } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
