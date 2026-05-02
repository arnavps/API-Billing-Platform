import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const VerifyEmail: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('No verification token provided');
        return;
      }

      try {
        await authService.verifyEmail(token);
        setStatus('success');
        
        // If they're already logged in, we can redirect them to the dashboard after a short delay
        if (isAuthenticated) {
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        }
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.response?.data?.error?.message || 'Verification failed. The link may be invalid or expired.');
      }
    };

    verify();
  }, [token, isAuthenticated, navigate]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center">
      {status === 'loading' && (
        <div className="py-8">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Verifying your email</h2>
          <p className="text-gray-400">Please wait while we verify your email address...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-500/20 mb-6">
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Email verified!</h2>
          <p className="text-gray-400 mb-8">
            Your email address has been successfully verified.
          </p>
          {!isAuthenticated && (
            <Link
              to="/login"
              className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 transition-colors w-full shadow-lg shadow-primary/20"
            >
              Continue to login
            </Link>
          )}
        </div>
      )}

      {status === 'error' && (
        <div className="py-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-6">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification failed</h2>
          <p className="text-gray-400 mb-8">{errorMessage}</p>
          <Link
            to="/login"
            className="inline-flex justify-center items-center px-4 py-2 border border-gray-700 shadow-sm text-sm font-medium rounded-lg text-white bg-dark-800 hover:bg-dark-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 transition-colors w-full"
          >
            Back to login
          </Link>
        </div>
      )}
    </div>
  );
};
