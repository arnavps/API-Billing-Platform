import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

type ShortcutAction = () => void;

interface Shortcuts {
  [key: string]: ShortcutAction;
}

export const useShortcuts = (shortcuts: Shortcuts) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? event.metaKey : event.ctrlKey;

      // Handle Command/Ctrl shortcuts
      if (modifier) {
        const key = event.key.toLowerCase();
        if (shortcuts[`mod+${key}`]) {
          event.preventDefault();
          shortcuts[`mod+${key}`]();
        }
      } else {
        // Handle single key shortcuts (if not typing in an input)
        const activeElement = document.activeElement;
        const isInput = activeElement instanceof HTMLInputElement || 
                        activeElement instanceof HTMLTextAreaElement ||
                        activeElement?.getAttribute('contenteditable') === 'true';

        if (!isInput) {
          const key = event.key.toLowerCase();
          if (shortcuts[key]) {
            shortcuts[key]();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Global shortcuts hook for the main layout
export const useGlobalShortcuts = () => {
  const navigate = useNavigate();

  useShortcuts({
    'mod+k': () => {
      // Focus search or open command palette
      const searchInput = document.getElementById('global-search');
      searchInput?.focus();
    },
    'g h': () => navigate('/dashboard'),
    'g a': () => navigate('/apis'),
    'g b': () => navigate('/billing'),
    'g r': () => navigate('/referrals'),
    'g t': () => navigate('/team'),
    'g s': () => navigate('/settings'),
    '?': () => {
      // Open shortcuts help modal (to be implemented)
      console.log('Shortcuts help');
    }
  });
};
