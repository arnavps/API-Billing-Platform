import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { 
  BookOpenIcon, 
  CodeBracketIcon, 
  CommandLineIcon, 
  QuestionMarkCircleIcon, 
  ChevronRightIcon,
  MagnifyingGlassIcon,
  BoltIcon,
  KeyIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  RectangleGroupIcon,
  LifebuoyIcon
} from '@heroicons/react/24/outline';
import { useDocsStore } from '../../store/useDocsStore';

const sidebarLinks = [
  { 
    title: 'Welcome', 
    items: [
      { name: 'Getting Started', path: '/docs', icon: BookOpenIcon },
      { name: 'Introduction', path: '/docs/intro', icon: QuestionMarkCircleIcon },
    ]
  },
  { 
    title: 'Guides', 
    items: [
      { name: 'Authentication', path: '/docs/auth', icon: KeyIcon },
      { name: 'Rate Limiting', path: '/docs/rate-limiting', icon: ArrowPathIcon },
      { name: 'Error Codes', path: '/docs/errors', icon: ExclamationTriangleIcon },
      { name: 'Webhooks', path: '/docs/webhooks', icon: RectangleGroupIcon },
    ]
  },
  { 
    title: 'Reference', 
    items: [
      { name: 'API Reference', path: '/docs/reference', icon: CodeBracketIcon },
      { name: 'API Playground', path: '/docs/playground', icon: CommandLineIcon },
      { name: 'SDKs', path: '/docs/sdks', icon: LifebuoyIcon },
    ]
  }
];

export const DocsLayout: React.FC = () => {
  const location = useLocation();
  const { fetchPublicAPIs, publicAPIs } = useDocsStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPublicAPIs();
  }, [fetchPublicAPIs]);

  return (
    <div className="min-h-screen bg-surface-900 text-slate-200 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-white/5 bg-surface-900/50 backdrop-blur-md sticky top-0 z-50 flex items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary-600 to-accent-500 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/20">
              <BoltIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Meter<span className="text-primary-400">Flow</span>
              <span className="ml-2 text-xs font-medium px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-full border border-primary-500/20 uppercase tracking-widest">
                Docs
              </span>
            </span>
          </Link>

          <div className="hidden md:flex relative group">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search documentation..."
              className="pl-10 pr-4 py-1.5 bg-surface-800/50 border border-white/5 rounded-full text-sm focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/20 w-64 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Back to Dashboard
          </Link>
          <a href="https://github.com/meterflow" target="_blank" rel="noreferrer" className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
          </a>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r border-white/5 overflow-y-auto max-h-[calc(100vh-4rem)] p-6 sticky top-16 hidden lg:block">
          <nav className="space-y-8">
            {sidebarLinks.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 px-3">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.name}>
                        <Link 
                          to={item.path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive 
                              ? 'bg-primary-500/10 text-primary-400 font-medium border border-primary-500/20' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* Dynamic Public APIs Section */}
            {publicAPIs.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-4 px-3">
                  Public APIs
                </h3>
                <ul className="space-y-1">
                  {publicAPIs.map((api) => {
                    const path = `/docs/apis/${api.slug}`;
                    const isActive = location.pathname === path;
                    return (
                      <li key={api.slug}>
                        <Link 
                          to={path}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                            isActive 
                              ? 'bg-primary-500/10 text-primary-400 font-medium border border-primary-500/20' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span className="text-lg">{api.icon || '⚡'}</span>
                          {api.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto max-h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto p-8 lg:p-12">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
