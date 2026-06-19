import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const fetchProfile = useAuthStore((state) => state.fetchProfile);
  const fetchPermissions = useAuthStore((state) => state.fetchPermissions);

  useEffect(() => {
    if (token && !user) {
      fetchProfile().then(() => fetchPermissions());
    }
  }, [token, user, fetchProfile, fetchPermissions]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
