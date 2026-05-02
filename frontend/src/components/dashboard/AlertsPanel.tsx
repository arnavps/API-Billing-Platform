import React from 'react';
import { useRealtimeStore } from '../../store/useRealtimeStore';
import { X, AlertTriangle, Info, CheckCircle, AlertCircle } from 'lucide-react';

export const AlertsPanel: React.FC = () => {
  const { alerts, dismissAlert } = useRealtimeStore();

  if (alerts.length === 0) return null;

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-500/10 border-green-500/20 text-green-400 shadow-green-500/5';
      case 'warning': return 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-amber-500/5';
      case 'error': return 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-500/5';
      default: return 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-blue-500/5';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'error': return <AlertCircle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  return (
    <div className="fixed top-20 right-6 z-[100] flex flex-col space-y-4 pointer-events-none">
      {alerts.map((alert) => (
        <div 
          key={alert.id}
          className={`
            w-80 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl pointer-events-auto
            flex items-start space-x-3 transition-all duration-500
            animate-in slide-in-from-right-full fade-in
            ${getAlertStyles(alert.type)}
          `}
        >
          <div className="mt-0.5 flex-shrink-0">{getIcon(alert.type)}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-black leading-none mb-1 tracking-tight">{alert.title}</h4>
            <p className="text-xs opacity-90 leading-relaxed font-medium">{alert.message}</p>
          </div>
          <button 
            onClick={() => dismissAlert(alert.id)}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
