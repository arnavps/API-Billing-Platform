import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../store/useAuthStore';
import { Mail, Lock, User, Building, Loader2, ArrowRight } from 'lucide-react';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    company: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data } = await authService.register(formData);
      setAuth(data.data, data.data.accessToken);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response?.data?.error?.details) {
        setError(err.response.data.error.details[0].message);
      } else {
        setError(err.response?.data?.error?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
        Create an account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-400">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-400 transition-colors">
          Sign in
        </Link>
      </p>

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="firstName">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="firstName"
                type="text"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-dark-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="lastName">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input
                id="lastName"
                type="text"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-dark-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="email"
              type="email"
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-dark-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="company">
            Company (Optional)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building className="h-5 w-5 text-gray-500" />
            </div>
            <input
              id="company"
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-dark-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all sm:text-sm"
              placeholder="Acme Inc"
              value={formData.company}
              onChange={handleChange}
            />
          </div>
        </div>

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
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long.</p>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-primary to-primary-600 hover:from-primary-400 hover:to-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-dark-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isLoading ? (
              <Loader2 className="animate-spin h-5 w-5 text-white" />
            ) : (
              <span className="flex items-center">
                Create Account
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
