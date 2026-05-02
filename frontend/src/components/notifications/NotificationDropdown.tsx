import React, { useEffect, useState, useRef } from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { 
  Bell, 
  CheckCheck, 
  Trash2, 
  X, 
  Clock, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  ShieldAlert,
  Settings2,
  ExternalLink
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    isLoading 
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'usage_warning':
      case 'usage_exceeded':
        return <ShieldAlert className="h-5 w-5 text-warning-500" />;
      case 'payment_failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'payment_succeeded':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'api_created':
      case 'key_created':
        return <Info className="h-5 w-5 text-primary-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-all ${
          isOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-gray-400 hover:text-white'
        }`}
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-5 w-5 bg-primary-600 border-2 border-dark-900 rounded-full text-[10px] font-black flex items-center justify-center text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-96 bg-dark-800/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h3 className="font-black text-white text-lg">Notifications</h3>
              <p className="text-xs font-bold text-gray-500">You have {unreadCount} unread messages</p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => markAllAsRead()}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
            {isLoading && notifications.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="h-8 w-8 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold text-gray-500">Syncing alerts...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-center">
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                  <Bell className="h-8 w-8 text-gray-600" />
                </div>
                <h4 className="text-white font-bold mb-1">All caught up!</h4>
                <p className="text-xs font-medium text-gray-500">No new notifications at this time.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {notifications.map((notification) => (
                  <div 
                    key={notification._id}
                    className={`p-6 flex items-start space-x-4 transition-colors hover:bg-white/[0.02] relative group ${
                      !notification.isRead ? 'bg-primary-500/[0.03]' : ''
                    }`}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-sm font-bold truncate pr-6 ${
                          !notification.isRead ? 'text-white' : 'text-gray-400'
                        }`}>
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="absolute right-6 top-7 h-2 w-2 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 font-medium leading-relaxed mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                          <Clock className="h-3 w-3" />
                          <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        </div>
                        {!notification.isRead && (
                          <button 
                            onClick={() => markAsRead(notification._id)}
                            className="text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-primary-300 transition-colors"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => deleteNotification(notification._id)}
                      className="absolute right-4 bottom-4 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white/5 border-t border-white/10 flex items-center justify-between">
            <button className="text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-white transition-colors flex items-center space-x-2">
              <Settings2 className="h-3 w-3" />
              <span>Notification Settings</span>
            </button>
            <button className="text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-primary-300 transition-colors flex items-center space-x-2">
              <span>View All</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
