import { Navigate } from "react-router-dom";
import { getToken, getUser } from "../services/api.js";

export default function RequireRole({ roles, children }) {
  const token = getToken();
  const user = getUser();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
