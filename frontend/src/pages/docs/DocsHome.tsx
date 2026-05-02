import React from 'react';
import { Link } from 'react-router-dom';
import { 
  RocketLaunchIcon, 
  KeyIcon, 
  BoltIcon, 
  ArrowPathIcon,
  CodeBracketIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

export const DocsHome: React.FC = () => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="space-y-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Welcome to <span className="text-gradient">MeterFlow Docs</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl leading-relaxed">
          Learn how to integrate MeterFlow into your applications. Start monitoring your API usage, 
          manage subscriptions, and automate billing with ease.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/docs/getting-started" className="glass-card p-6 hover:border-primary-500/30 transition-all group">
          <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4 border border-primary-500/20 group-hover:scale-110 transition-transform">
            <RocketLaunchIcon className="w-6 h-6 text-primary-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Getting Started</h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            Follow our quick-start guide to get up and running with MeterFlow in minutes.
          </p>
          <div className="flex items-center text-primary-400 text-sm font-semibold gap-1">
            Learn more <ChevronRightIcon className="w-3 h-3" />
          </div>
        </Link>

        <Link to="/docs/authentication" className="glass-card p-6 hover:border-accent-500/30 transition-all group">
          <div className="w-12 h-12 bg-accent-500/10 rounded-xl flex items-center justify-center mb-4 border border-accent-500/20 group-hover:scale-110 transition-transform">
            <KeyIcon className="w-6 h-6 text-accent-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Authentication</h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            Secure your API requests using our powerful API key and authentication system.
          </p>
          <div className="flex items-center text-accent-400 text-sm font-semibold gap-1">
            Learn more <ChevronRightIcon className="w-3 h-3" />
          </div>
        </Link>

        <Link to="/docs/rate-limiting" className="glass-card p-6 hover:border-orange-500/30 transition-all group">
          <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
            <ArrowPathIcon className="w-6 h-6 text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Rate Limiting</h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            Understand how we enforce rate limits to ensure fair usage across all consumers.
          </p>
          <div className="flex items-center text-orange-400 text-sm font-semibold gap-1">
            Learn more <ChevronRightIcon className="w-3 h-3" />
          </div>
        </Link>

        <Link to="/docs/reference" className="glass-card p-6 hover:border-emerald-500/30 transition-all group">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <CodeBracketIcon className="w-6 h-6 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">API Reference</h3>
          <p className="text-slate-400 text-sm mb-4 leading-relaxed">
            Explore our comprehensive API reference and interactive testing playground.
          </p>
          <div className="flex items-center text-emerald-400 text-sm font-semibold gap-1">
            Learn more <ChevronRightIcon className="w-3 h-3" />
          </div>
        </Link>
      </div>

      <section className="bg-gradient-to-br from-primary-500/10 to-accent-500/5 rounded-3xl p-8 border border-white/5 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <h2 className="text-2xl font-bold text-white">Need help?</h2>
          <p className="text-slate-400 max-w-xl">
            Our support team is here to help you with any questions or integration challenges you may have.
            Reach out via our support portal or join our developer community.
          </p>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-white text-surface-900 font-bold rounded-full hover:bg-slate-200 transition-all">
              Contact Support
            </button>
            <button className="px-6 py-2 bg-white/10 text-white font-bold rounded-full border border-white/10 hover:bg-white/20 transition-all">
              Join Discord
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      </section>
    </div>
  );
};
