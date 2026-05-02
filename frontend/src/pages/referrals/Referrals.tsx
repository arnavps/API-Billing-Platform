import React, { useState, useEffect } from 'react';
import { referralService } from '../../services/referral.service';
import { 
  Gift, 
  Users, 
  ArrowUpRight, 
  Copy, 
  Check, 
  Mail, 
  TrendingUp, 
  DollarSign, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Referrals: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await referralService.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch referral stats');
    }
  };

  const handleCopy = () => {
    if (stats?.referralCode) {
      navigator.clipboard.writeText(stats.referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsInviting(true);
    setError(null);
    setSuccess(null);

    try {
      await referralService.inviteByEmail(email);
      setSuccess(`Invitation sent to ${email}`);
      setEmail('');
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-900 to-dark-950 border border-gray-800 shadow-2xl"
      >
        <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-6">
              <Gift className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">MeterFlow Rewards</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
              Grow together, <br />earn together.
            </h1>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Invite other developers to MeterFlow. When they sign up, they get <span className="text-green-400 font-bold">$2.00</span> in credits, and you earn <span className="text-primary font-bold">$5.00</span> for every successful referral.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-dark-800/50 px-4 py-2 rounded-full border border-gray-700/50">
                <Check className="h-4 w-4 text-green-400" />
                <span>Unlimited referrals</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500 bg-dark-800/50 px-4 py-2 rounded-full border border-gray-700/50">
                <Check className="h-4 w-4 text-green-400" />
                <span>Instant credit payout</span>
              </div>
            </div>
          </div>
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex-shrink-0">
            <motion.img 
              initial={{ scale: 0.8, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              src="/referral_program_hero_1777745064338.png" 
              alt="Referral Rewards" 
              className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(var(--primary-rgb),0.3)]"
            />
            {/* Decorative Orbs */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-purple-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <motion.div variants={item} className="bg-dark-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm group hover:border-primary/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Total Earned</p>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-3xl font-bold text-white">${((stats?.stats?.totalEarned || 0) / 100).toFixed(2)}</span>
            <span className="text-xs text-gray-500">USD</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="bg-dark-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm group hover:border-purple-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <Users className="h-6 w-6 text-purple-400" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Referrals</p>
          <p className="text-3xl font-bold mt-1 text-white">{stats?.stats?.total || 0}</p>
        </motion.div>

        <motion.div variants={item} className="bg-dark-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm group hover:border-blue-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <Check className="h-6 w-6 text-blue-400" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Completed</p>
          <p className="text-3xl font-bold mt-1 text-white">{stats?.stats?.completed || 0}</p>
        </motion.div>

        <motion.div variants={item} className="bg-dark-900/50 p-6 rounded-2xl border border-gray-800 backdrop-blur-sm group hover:border-amber-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pending</p>
          <p className="text-3xl font-bold mt-1 text-white">{stats?.stats?.pending || 0}</p>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Share Section */}
          <div className="bg-dark-900 border border-gray-800 rounded-3xl p-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Invite your network</h3>
                  <p className="text-gray-400 text-sm">Copy your unique referral link or send an email directly to your colleagues.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Your Referral Code</label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-dark-950 border border-gray-800 rounded-2xl px-5 py-4 font-mono text-2xl tracking-[0.2em] text-primary shadow-inner">
                      {stats?.referralCode || '-------'}
                    </div>
                    <button 
                      onClick={handleCopy}
                      className={`p-5 rounded-2xl transition-all duration-300 ${copied ? 'bg-green-500 text-white' : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30 active:scale-95'}`}
                    >
                      {copied ? <Check className="h-7 w-7" /> : <Copy className="h-7 w-7" />}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4">Invite via Email</label>
                  <form onSubmit={handleInvite} className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                      <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="w-full bg-dark-950 border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isInviting || !email}
                      className="bg-white text-dark-950 px-6 rounded-2xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50 flex items-center justify-center min-w-[60px]"
                    >
                      {isInviting ? (
                        <div className="h-5 w-5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronRight className="h-6 w-6" />
                      )}
                    </button>
                  </form>
                  <AnimatePresence>
                    {error && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-xs mt-2 font-medium">{error}</motion.p>}
                    {success && <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-green-400 text-xs mt-2 font-medium">{success}</motion.p>}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest">How it works</h4>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="h-8 w-8 rounded-full bg-dark-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">1</div>
                    <div>
                      <p className="font-semibold text-white mb-1">Share your link</p>
                      <p className="text-xs text-gray-500 leading-relaxed">Send your code or link to developers who need usage-based billing.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="h-8 w-8 rounded-full bg-dark-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-gray-400 shrink-0">2</div>
                    <div>
                      <p className="font-semibold text-white mb-1">They sign up</p>
                      <p className="text-xs text-gray-500 leading-relaxed">Your friend gets a $2.00 welcome bonus credits immediately upon registration.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">3</div>
                    <div>
                      <p className="font-semibold text-white mb-1">You get paid</p>
                      <p className="text-xs text-gray-500 leading-relaxed">Once they make their first API call, we'll credit $5.00 to your account.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="bg-dark-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-full max-h-[600px]">
          <div className="p-6 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Referrals</h3>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stats?.history?.length || 0} Total</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {stats?.history?.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {stats.history.map((referral: any) => (
                  <div key={referral._id} className="p-5 hover:bg-dark-800/30 transition-colors group">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          referral.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-dark-800 text-gray-500'
                        }`}>
                          {referral.refereeEmail[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold truncate max-w-[120px] text-white">{referral.refereeEmail}</span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{new Date(referral.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-1 rounded-lg uppercase font-black tracking-widest border ${
                        referral.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                        referral.status === 'pending' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {referral.status}
                      </span>
                    </div>
                    {referral.status === 'completed' && (
                      <div className="flex items-center space-x-1 text-green-400 text-xs font-bold bg-green-500/5 py-1 px-2 rounded-md w-fit">
                        <DollarSign className="h-3 w-3" />
                        <span>$5.00 Credited</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="p-5 bg-dark-800 rounded-2xl mb-4 border border-gray-700">
                  <Users className="h-10 w-10 text-gray-600" />
                </div>
                <p className="text-sm font-semibold text-gray-400">No referrals yet</p>
                <p className="text-xs text-gray-500 mt-2">Start sharing your link to earn credits!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
