import api from './api';

export interface ActivityLog {
  _id: string;
  userId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  teamId?: string;
  action: string;
  entityType: 'api' | 'key' | 'billing' | 'team' | 'webhook';
  entityId: string;
  metadata: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface ActivityLogsResponse {
  data: {
    logs: ActivityLog[];
    total: number;
    pages: number;
    currentPage: number;
  };
}

export const activityService = {
  getLogs: async (params: { entityType?: string; entityId?: string; page?: number; limit?: number }) => {
    const response = await api.get<ActivityLogsResponse>('/activity-logs', { params });
    return response.data.data;
  },

  getTeamLogs: async (params: { entityType?: string; page?: number; limit?: number }) => {
    const response = await api.get<ActivityLogsResponse>('/activity-logs/team', { params });
    return response.data.data;
  }
};
