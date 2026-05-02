import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Store, 
  ChevronRight, 
  Star, 
  Users, 
  TrendingUp, 
  ShieldCheck,
  Filter,
  Zap,
  Globe,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { apiService } from '../../services/api.service';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export const Marketplace: React.FC = () => {
  const [apis, setApis] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchMarketplaceAPIs();
  }, [selectedCategory]);

  const fetchMarketplaceAPIs = async () => {
    try {
      setIsLoading(true);
      // Using global search for marketplace initially
      const data = await apiService.getAPIs(); // Filtered to public on backend usually
      setApis(data.filter((a: any) => a.visibility === 'public'));
    } catch (error) {
      console.error('Error fetching marketplace APIs', error);
    } finally {
      setIsLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All APIs', icon: Globe },
    { id: 'data', label: 'Data & AI', icon: Zap },
    { id: 'finance', label: 'Financial', icon: TrendingUp },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'social', label: 'Social', icon: Users },
  ];

  const filteredAPIs = apis.filter(api => 
    api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    api.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      {/* Hero Section */}
      <div className="relative mb-12 rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-primary to-secondary p-12 lg:p-20 text-center">
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
              <Star className="h-4 w-4 text-yellow-300 fill-yellow-300" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">Premium API Marketplace</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6 leading-tight">
              Discover the next generation of APIs.
            </h1>
            <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
              Access thousands of production-ready APIs with integrated billing, monitoring, and enterprise-grade security.
            </p>
            
            <div className="relative max-w-xl mx-auto group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-white/40 group-focus-within:text-white transition-colors" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for APIs, tools, or providers..."
                className="w-full pl-16 pr-6 py-5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-4 focus:ring-white/10 transition-all text-lg"
              />
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Sidebar Filters */}
        <div className="lg:col-span-3 space-y-8">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Categories</span>
            </h3>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all ${
                    selectedCategory === cat.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-dark-900 text-gray-400 hover:text-white hover:bg-dark-800'
                  }`}
                >
                  <cat.icon className="h-4 w-4" />
                  <span className="font-bold text-sm">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-dark-900 border border-gray-800 rounded-3xl p-8">
            <h4 className="font-bold text-white mb-4">Are you a developer?</h4>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Monetize your backend services in minutes. Reach thousands of customers instantly.
            </p>
            <button 
              onClick={() => navigate('/apis/new')}
              className="w-full py-3 bg-dark-800 text-white rounded-xl font-bold border border-gray-700 hover:bg-dark-700 transition-all text-sm"
            >
              List your API
            </button>
          </div>
        </div>

        {/* API Grid */}
        <div className="lg:col-span-9">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">
              {selectedCategory === 'all' ? 'Featured APIs' : `${categories.find(c => c.id === selectedCategory)?.label}`}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Sort by:</span>
              <select className="bg-transparent text-white font-bold focus:outline-none cursor-pointer">
                <option value="popular">Most Popular</option>
                <option value="new">Newest</option>
                <option value="price">Price: Low to High</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="text-gray-400">Curating the best APIs...</p>
            </div>
          ) : filteredAPIs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAPIs.map((api) => (
                <motion.div
                  key={api._id}
                  whileHover={{ y: -5 }}
                  className="bg-dark-900 border border-gray-800 rounded-[2rem] p-8 hover:border-primary/40 transition-all cursor-pointer group shadow-xl"
                  onClick={() => navigate(`/apis/${api._id}`)}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-16 w-16 bg-dark-950 border border-gray-800 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                      {api.icon || '🚀'}
                    </div>
                    <div className="flex items-center space-x-1 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">4.9</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{api.name}</h3>
                  <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed">
                    {api.description || 'Powerful production-ready API for professional developers.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Pricing</p>
                      <p className="text-lg font-black text-white">
                        {api.pricing.model === 'free' ? 'FREE' : `$${api.pricing.pricePerRequest}/req`}
                      </p>
                    </div>
                    <div className="p-3 bg-dark-950 rounded-xl group-hover:bg-primary transition-all">
                      <ChevronRight className="h-5 w-5 text-gray-500 group-hover:text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="bg-dark-900 border border-gray-800 rounded-3xl p-20 text-center">
              <div className="inline-flex p-6 bg-dark-800 rounded-full mb-6">
                <Store className="h-12 w-12 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No APIs found</h3>
              <p className="text-gray-400 max-w-sm mx-auto">Try adjusting your search or category filters.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
