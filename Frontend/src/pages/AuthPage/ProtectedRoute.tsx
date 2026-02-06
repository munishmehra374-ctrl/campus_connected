import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import the hook

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const { isAuth, loading } = useAuth();

  if (loading) return null; // Wait for the check to finish

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;