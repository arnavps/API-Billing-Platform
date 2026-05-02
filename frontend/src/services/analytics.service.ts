import api from './api';

export interface AnalyticsOverview {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatency: number;
  totalData: number;
  successRate: number;
}

export interface TimeSeriesPoint {
  timestamp: string;
  requests: number;
  latency: number;
  success: number;
  failed: number;
}

export interface EndpointStat {
  endpoint: string;
  count: number;
}

export interface ErrorStat {
  code: string;
  count: number;
}

export const analyticsService = {
  getOverview: async (period: string = '24h'): Promise<AnalyticsOverview> => {
    const response = await api.get(`/analytics/overview?period=${period}`);
    return response.data.data;
  },

  getTimeSeries: async (period: string = '24h', apiId?: string): Promise<TimeSeriesPoint[]> => {
    const url = apiId 
      ? `/analytics/series?period=${period}&apiId=${apiId}`
      : `/analytics/series?period=${period}`;
    const response = await api.get(url);
    return response.data.data;
  },

  getTopEndpoints: async (limit: number = 5, apiId?: string): Promise<EndpointStat[]> => {
    const url = apiId 
      ? `/analytics/endpoints?limit=${limit}&apiId=${apiId}`
      : `/analytics/endpoints?limit=${limit}`;
    const response = await api.get(url);
    return response.data.data;
  },

  getErrors: async (apiId?: string): Promise<ErrorStat[]> => {
    const url = apiId 
      ? `/analytics/errors?apiId=${apiId}`
      : `/analytics/errors`;
    const response = await api.get(url);
    return response.data.data;
  }
};
