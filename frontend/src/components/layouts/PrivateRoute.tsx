import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/auth.service';

export const PrivateRoute: React.FC = () => {
  const { isAuthenticated, isLoading, setLoading, setAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        try {
          // Attempt to fetch current user (this will trigger token refresh if needed)
          const { data } = await authService.me();
          // We assume we also have the access token from the refresh flow if it happened, 
          // but if we are here, we are authenticated. 
          // The refresh logic is handled in the interceptor.
          setAuth(data.data, useAuthStore.getState().accessToken || '');
        } catch (error) {
          console.error('Authentication failed', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    checkAuth();
  }, [isAuthenticated, setAuth, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};
