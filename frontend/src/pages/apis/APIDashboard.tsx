import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Loader2, 
  PlusCircle, 
  Zap,
  Globe,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAPIStore } from '../../store/useAPIStore';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { APICard } from '../../components/apis/APICard';

export const APIDashboard: React.FC = () => {
  const { apis, isLoading, fetchAPIs, total } = useAPIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchAPIs({ search: searchTerm, category });
  }, [fetchAPIs, searchTerm, category]);

  return (
    <DashboardLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My APIs</h1>
          <p className="text-gray-400">Manage and monitor your API infrastructure.</p>
        </div>
        <Link 
          to="/apis/new"
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold transition-all shadow-lg shadow-primary/25 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span>Create New API</span>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total APIs', value: total, icon: Zap, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Public APIs', value: apis.filter(a => a.visibility === 'public').length, icon: Globe, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Private APIs', value: apis.filter(a => a.visibility === 'private').length, icon: Lock, color: 'text-orange-400', bg: 'bg-orange-400/10' },
          { label: 'Active Keys', value: apis.reduce((acc, a) => acc + (a.activeKeysCount || 0), 0), icon: PlusCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-dark-900 border border-gray-800 rounded-2xl p-5 flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
          <input 
            type="text"
            placeholder="Search APIs by name or description..."
            className="w-full bg-dark-900 border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="bg-dark-900 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer min-w-[140px]"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="data">Data</option>
            <option value="ai">AI</option>
            <option value="finance">Finance</option>
            <option value="social">Social</option>
            <option value="weather">Weather</option>
            <option value="crypto">Crypto</option>
          </select>
          <button className="flex items-center space-x-2 px-4 py-3 bg-dark-900 border border-gray-800 rounded-xl text-gray-400 hover:text-white hover:border-gray-700 transition-all">
            <SlidersHorizontal className="h-5 w-5" />
            <span className="font-medium hidden sm:inline">Filters</span>
          </button>
        </div>
      </div>

      {/* API Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-400 font-medium">Loading your APIs...</p>
        </div>
      ) : apis.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apis.map((api) => (
            <APICard key={api._id} api={api} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-dark-900/50 border border-dashed border-gray-800 rounded-3xl text-center px-4">
          <div className="p-4 bg-primary/10 rounded-2xl mb-6">
            <PlusCircle className="h-12 w-12 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No APIs found</h3>
          <p className="text-gray-400 max-w-sm mb-8">
            {searchTerm || category 
              ? "We couldn't find any APIs matching your current filters." 
              : "You haven't created any APIs yet. Get started by creating your first API proxy."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/apis/new"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl font-bold transition-all hover:bg-primary-hover shadow-lg shadow-primary/20"
            >
              <span>Create First API</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            {(searchTerm || category) && (
              <button 
                onClick={() => { setSearchTerm(''); setCategory(''); }}
                className="px-6 py-3 bg-dark-800 text-white rounded-xl font-bold hover:bg-dark-700 transition-all border border-gray-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
