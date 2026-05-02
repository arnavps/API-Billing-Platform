import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Clock, 
  MoreVertical, 
  Mail, 
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2
} from 'lucide-react';
import { DashboardLayout } from '../../components/layouts/DashboardLayout';
import { teamService } from '../../services/team.service';
import { motion, AnimatePresence } from 'framer-motion';

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [activityLog, setActivityLog] = useState<any[]>([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchActivity(selectedTeam._id);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    try {
      const data = await teamService.getTeams();
      setTeams(data);
      if (data.length > 0 && !selectedTeam) {
        setSelectedTeam(data[0]);
      }
    } catch (error) {
      console.error('Error fetching teams', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivity = async (teamId: string) => {
    try {
      const data = await teamService.getActivityLog(teamId);
      setActivityLog(data);
    } catch (error) {
      console.error('Error fetching activity', error);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam || !inviteEmail) return;

    try {
      setIsInviting(true);
      await teamService.inviteMember(selectedTeam._id, inviteEmail, inviteRole);
      setInviteEmail('');
      setIsInviting(false);
      fetchTeams(); // Refresh to show pending invitation
    } catch (error) {
      console.error('Error inviting member', error);
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
          <p className="text-gray-400">Loading workspace...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Team Collaboration</h1>
          <p className="text-gray-400">Manage your workspace members, roles, and shared resources.</p>
        </div>
        <button className="flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">
          <Plus className="h-5 w-5" />
          <span>Create New Team</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Teams List Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Your Teams</p>
          <div className="space-y-2">
            {teams.map((team) => (
              <button
                key={team._id}
                onClick={() => setSelectedTeam(team)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl border transition-all ${
                  selectedTeam?._id === team._id 
                    ? 'bg-primary/10 border-primary/20 text-primary shadow-sm shadow-primary/5' 
                    : 'bg-dark-900 border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
              >
                <div className={`p-2 rounded-lg ${selectedTeam?._id === team._id ? 'bg-primary/20' : 'bg-dark-800'}`}>
                  <Users className="h-4 w-4" />
                </div>
                <span className="font-bold text-sm truncate">{team.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {selectedTeam ? (
            <>
              {/* Member Management */}
              <div className="bg-dark-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-8 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-1">Members</h2>
                    <p className="text-sm text-gray-500">{selectedTeam.members.length} people have access to this team.</p>
                  </div>
                  
                  <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input 
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        placeholder="colleague@company.com"
                        className="pl-11 pr-4 py-3 bg-dark-950 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-primary transition-all w-full sm:w-64"
                        required
                      />
                    </div>
                    <select 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="px-4 py-3 bg-dark-950 border border-gray-800 rounded-xl text-sm focus:outline-none focus:border-primary transition-all text-gray-300"
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button 
                      type="submit"
                      disabled={isInviting}
                      className="px-6 py-3 bg-white text-dark-950 rounded-xl font-bold hover:bg-gray-200 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                      <span>Invite</span>
                    </button>
                  </form>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-dark-950/50">
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">User</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Role</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Permissions</th>
                        <th className="px-8 py-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Joined</th>
                        <th className="px-8 py-4"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {selectedTeam.members.map((member: any) => (
                        <tr key={member.userId} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 border border-gray-700 flex items-center justify-center text-xs font-bold text-white uppercase">
                                {member.email?.substring(0, 2)}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{member.email}</p>
                                {member.status === 'pending' && (
                                  <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-tight">Pending Invite</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${
                              member.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                              member.role === 'member' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                              'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>
                              {member.role}
                            </span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex -space-x-1">
                              {Object.entries(member.permissions || {}).filter(([_, v]) => v).slice(0, 3).map(([k]) => (
                                <div key={k} className="h-6 w-6 rounded-full bg-dark-800 border border-gray-700 flex items-center justify-center" title={k}>
                                  <Shield className="h-3 w-3 text-gray-500" />
                                </div>
                              ))}
                              {Object.values(member.permissions || {}).filter(v => v).length > 3 && (
                                <div className="h-6 w-6 rounded-full bg-dark-800 border border-gray-700 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                  +{Object.values(member.permissions || {}).filter(v => v).length - 3}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-8 py-5 text-sm text-gray-500">
                            {new Date(member.joinedAt || member.invitedAt).toLocaleDateString()}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <button className="p-2 text-gray-500 hover:text-white transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Activity Feed */}
              <div className="bg-dark-900 border border-gray-800 rounded-3xl overflow-hidden shadow-xl">
                <div className="p-8 border-b border-gray-800">
                  <h3 className="font-bold text-white flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span>Activity Audit Log</span>
                  </h3>
                </div>
                <div className="p-8 space-y-6">
                  {activityLog.length > 0 ? (
                    activityLog.map((log) => (
                      <div key={log._id} className="flex items-start space-x-4">
                        <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-300">
                            <span className="font-bold text-white">{log.userId?.email || 'System'}</span>
                            {' '} {log.action.replace('_', ' ')} {' '}
                            {log.metadata?.apiName && <span className="font-mono text-xs text-primary px-1.5 py-0.5 bg-primary/10 rounded">{log.metadata.apiName}</span>}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <div className="inline-flex p-4 bg-dark-800 rounded-full mb-4">
                        <Clock className="h-8 w-8 text-gray-600" />
                      </div>
                      <p className="text-gray-500">No activity recorded yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-dark-900 border border-gray-800 rounded-3xl p-20 text-center">
              <div className="inline-flex p-6 bg-primary/10 rounded-full mb-6">
                <Users className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Select a workspace</h3>
              <p className="text-gray-400 mb-8 max-w-sm mx-auto">Choose a team from the sidebar or create a new one to start collaborating.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
