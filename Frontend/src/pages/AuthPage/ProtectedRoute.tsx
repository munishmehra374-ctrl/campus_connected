import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import the hook

interface Props {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly }: Props) => {
  const { isAuth, user, loading } = useAuth();

  if (loading) return null;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;