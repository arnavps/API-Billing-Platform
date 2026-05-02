import React, { useEffect, useState, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, XCircle, CheckCircle2 } from 'lucide-react';
import { useNotificationStore } from '../../store/useNotificationStore';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

export const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchNotifications();
    
    // Close dropdown on outside click
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
      case 'success': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-dark-800 active:scale-95"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 border-2 border-dark-900 text-[10px] font-bold text-white flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-dark-900 border border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-dark-800/50">
            <h3 className="font-semibold text-sm text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  markAllAsRead();
                }}
                className="text-xs text-primary hover:text-primary-hover font-medium flex items-center space-x-1 transition-colors"
              >
                <Check className="h-3 w-3" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-dark-800 mb-3 text-gray-500">
                  <Bell className="h-6 w-6" />
                </div>
                <p className="text-gray-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {notifications.map((n) => (
                  <div 
                    key={n._id}
                    className={`p-4 hover:bg-dark-800/50 transition-colors group cursor-pointer ${!n.isRead ? 'bg-primary/5' : ''}`}
                    onClick={() => {
                      if (!n.isRead) markAsRead(n._id);
                    }}
                  >
                    <div className="flex space-x-3">
                      <div className="mt-0.5 flex-shrink-0">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-sm font-medium truncate ${!n.isRead ? 'text-white' : 'text-gray-300'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-gray-500 flex-shrink-0 ml-2">
                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 mb-2 leading-relaxed">
                          {n.message}
                        </p>
                        {n.link && (
                          <Link 
                            to={n.link}
                            className="text-[10px] text-primary hover:text-primary-hover font-bold uppercase tracking-wider inline-flex items-center"
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpen(false);
                            }}
                          >
                            View Action
                          </Link>
                        )}
                      </div>
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(var(--color-primary),0.5)]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-800 text-center bg-dark-800/30">
              <button className="text-xs text-gray-500 hover:text-white transition-colors font-medium">
                View all history
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
