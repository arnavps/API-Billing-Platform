import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  action,
  secondaryAction
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center max-w-md mx-auto"
    >
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
        <div className="relative h-24 w-24 bg-dark-900 border border-gray-800 rounded-3xl flex items-center justify-center shadow-2xl">
          <Icon className="h-10 w-10 text-primary" />
        </div>
      </div>
      
      <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-10">
        {description}
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
        {action && (
          <button
            onClick={action.onClick}
            className="w-full sm:flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center space-x-2"
          >
            {action.icon && <action.icon className="h-5 w-5" />}
            <span>{action.label}</span>
          </button>
        )}
        
        {secondaryAction && (
          <button
            onClick={secondaryAction.onClick}
            className="w-full sm:flex-1 py-4 bg-dark-800 text-white rounded-2xl font-bold border border-gray-700 hover:bg-dark-700 transition-all"
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </motion.div>
  );
};
