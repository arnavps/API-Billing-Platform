import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/auth.service';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LogOut, 
  User as UserIcon, 
  Activity, 
  LayoutDashboard, 
  Layers, 
  Key, 
  BarChart3, 
  Settings, 
  Menu, 
  Plus,
  CreditCard
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
      active 
        ? 'bg-primary/10 text-primary border border-primary/20' 
        : 'text-gray-400 hover:text-white hover:bg-dark-800 border border-transparent'
    }`}
  >
    <Icon className={`h-5 w-5 ${active ? 'text-primary' : 'group-hover:text-white transition-colors'}`} />
    <span className="font-medium">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
  </Link>
);

export const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const navigation = [
    { label: 'Overview', icon: LayoutDashboard, to: '/dashboard' },
    { label: 'My APIs', icon: Layers, to: '/apis' },
    { label: 'API Keys', icon: Key, to: '/keys' },
    { label: 'Analytics', icon: BarChart3, to: '/analytics' },
    { label: 'Billing', icon: CreditCard, to: '/dashboard/settings/billing' },
    { label: 'Settings', icon: Settings, to: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-white flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-72 bg-dark-900 border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-xl shadow-lg shadow-primary/20">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                MeterFlow
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                active={location.pathname === item.to || (item.to !== '/dashboard' && location.pathname.startsWith(item.to))}
              />
            ))}
          </nav>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-gray-800 bg-dark-950/50">
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-dark-800/50 border border-gray-800 mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-700 flex items-center justify-center">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user?.role.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all duration-200 border border-transparent hover:border-red-400/20"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-dark-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            className="p-2 -ml-2 text-gray-400 hover:text-white lg:hidden"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Activity className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-green-500 border-2 border-dark-900" />
            </button>
            <Link 
              to="/apis/new"
              className="hidden sm:inline-flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-all shadow-lg shadow-primary/20 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>New API</span>
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
