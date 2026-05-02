import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Lock, Loader2, CheckCircle2 } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { token } = useParams<{ token: string }>();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await authService.resetPassword(token, { password });
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-6">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Password reset</h2>
        <p className="text-gray-400 mb-8">
          Your password has been successfully reset. You can now log in with your new password.
        </p>
        <Link
          to="/login"
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 transition-colors w-full shadow-lg shadow-primary/20"
        >
          Continue to login
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-extrabold text-white tracking-tight">
        Set new password
      </h2>
      <p className="mt-2 text-sm text-gray-400">
        Your new password must be different to previously used passwords.
      </p>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-dark-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="confirmPassword"
                type="password"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-dark-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-400 hover:to-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5 text-white" />
            ) : (
              'Reset password'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
