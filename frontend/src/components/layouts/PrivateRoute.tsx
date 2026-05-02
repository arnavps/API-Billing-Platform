import { SocketService } from '../../services/socket.service';

export const PrivateRoute: React.FC = () => {
  const { isAuthenticated, user, accessToken, isLoading, setLoading, setAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isAuthenticated) {
        try {
          const { data } = await authService.me();
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

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      SocketService.connect(accessToken);
    }

    return () => {
      SocketService.disconnect();
    };
  }, [isAuthenticated, accessToken]);

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
