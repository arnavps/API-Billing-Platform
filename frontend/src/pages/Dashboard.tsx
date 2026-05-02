import React from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/auth.service';
import { useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Shield, Activity } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      clearAuth();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-gray-800 bg-dark-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                MeterFlow
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <UserIcon className="h-4 w-4" />
                <span>{user?.firstName} {user?.lastName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-900"
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="md:flex md:items-center md:justify-between mb-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 sm:text-3xl sm:truncate">
                Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                Welcome back, {user?.firstName}. You are logged in.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* User Profile Card */}
            <div className="bg-dark-900 rounded-xl border border-gray-800 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <UserIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-white">Profile</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Name</dt>
                  <dd className="text-white font-medium">{user?.firstName} {user?.lastName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Email</dt>
                  <dd className="text-white font-medium truncate ml-4">{user?.email}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-400">Status</dt>
                  <dd>
                    {user?.emailVerified ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                        Unverified
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Account Settings Card */}
            <div className="bg-dark-900 rounded-xl border border-gray-800 p-6 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-lg font-medium text-white">Account</h3>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Role</dt>
                  <dd className="text-white font-medium capitalize">{user?.role.replace('_', ' ')}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Plan</dt>
                  <dd className="text-white font-medium capitalize">{user?.subscription?.plan || 'Free'}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
