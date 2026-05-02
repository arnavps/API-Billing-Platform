import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, X, ArrowRight, Zap, Key, CreditCard, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SearchResult {
  name: string;
  description: string;
  slug: string;
  icon: string;
  visibility: 'public' | 'private';
  category: string;
}

export const CommandSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await axios.get(`/api/marketplace/search?q=${query}`, {
          withCredentials: true,
        });
        setResults(response.data.data);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    navigate(`/apis/${result.slug}`);
  };

  const quickActions = [
    { name: 'Create API', icon: Zap, href: '/apis/create' },
    { name: 'API Keys', icon: Key, href: '/keys' },
    { name: 'Billing', icon: CreditCard, href: '/billing' },
    { name: 'Team', icon: Users, href: '/teams' },
    { name: 'Settings', icon: Settings, href: '/settings' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors group"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 bg-slate-800 border border-slate-700 rounded">
          <Command className="w-2.5 h-2.5" /> K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center px-4 py-4 border-b border-slate-800">
                <Search className="w-5 h-5 text-slate-500 mr-3" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search APIs, keys, billing, documentation..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 text-lg"
                />
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-800 rounded-md transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                {query.length === 0 ? (
                  <div className="p-2">
                    <h3 className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</h3>
                    <div className="grid grid-cols-1 gap-1">
                      {quickActions.map((action) => (
                        <button
                          key={action.name}
                          onClick={() => { navigate(action.href); setIsOpen(false); }}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white group"
                        >
                          <div className="p-2 bg-slate-800 rounded-lg group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                            <action.icon className="w-4 h-4" />
                          </div>
                          <span className="font-medium">{action.name}</span>
                          <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2">
                    <h3 className="px-2 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {isLoading ? 'Searching...' : `Results for "${query}"`}
                    </h3>
                    <div className="grid grid-cols-1 gap-1">
                      {results.length > 0 ? (
                        results.map((result, idx) => (
                          <button
                            key={result.slug}
                            onClick={() => handleSelect(result)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left w-full ${
                              idx === selectedIndex ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <div className="text-2xl">{result.icon}</div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">{result.name}</div>
                              <div className="text-sm text-slate-500 truncate">{result.description}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-800 border border-slate-700 rounded text-slate-400">
                                {result.visibility}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : !isLoading && (
                        <div className="px-3 py-8 text-center text-slate-500">
                          No results found for "{query}"
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 bg-slate-950/50 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">↑↓</kbd> to navigate</span>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">Enter</kbd> to select</span>
                </div>
                <div>
                  <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">Esc</kbd> to close</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
