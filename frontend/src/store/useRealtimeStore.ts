import { create } from 'zustand';

export interface RealtimeRequest {
  requestId: string;
  apiId: string;
  apiName: string;
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  timestamp: string | Date;
}

export interface RealtimeAlert {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

interface RPMDataPoint {
  timestamp: string;
  count: number;
}

interface RealtimeState {
  recentRequests: RealtimeRequest[];
  requestsPerMinute: RPMDataPoint[];
  activeAPIs: number;
  errors: RealtimeRequest[];
  alerts: RealtimeAlert[];
  
  addRequest: (request: RealtimeRequest) => void;
  addAlert: (alert: Omit<RealtimeAlert, 'id' | 'timestamp'>) => void;
  dismissAlert: (id: string) => void;
  updateRequestsPerMinute: () => void;
  setActiveAPIs: (count: number) => void;
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  recentRequests: [],
  requestsPerMinute: Array.from({ length: 60 }, (_, i) => ({
    timestamp: new Date(Date.now() - (59 - i) * 1000).toISOString(),
    count: 0
  })),
  activeAPIs: 0,
  errors: [],
  alerts: [],

  addRequest: (request) => {
    set((state) => {
      const recentRequests = [request, ...state.recentRequests].slice(0, 50);
      const errors = request.status >= 400 
        ? [request, ...state.errors].slice(0, 50) 
        : state.errors;
      
      // Update RPM for the current second bucket
      const rpm = [...state.requestsPerMinute];
      if (rpm.length > 0) {
        rpm[rpm.length - 1].count += 1;
      }

      return { recentRequests, errors, requestsPerMinute: rpm };
    });
  },

  addAlert: (alert) => {
    const id = Math.random().toString(36).substring(7);
    const newAlert = { ...alert, id, timestamp: new Date() };
    set((state) => ({ alerts: [newAlert, ...state.alerts].slice(0, 10) }));
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => get().dismissAlert(id), 5000);
  },

  dismissAlert: (id) => {
    set((state) => ({ alerts: state.alerts.filter((a) => a.id !== id) }));
  },

  updateRequestsPerMinute: () => {
    set((state) => {
      const now = new Date();
      const newPoint = { timestamp: now.toISOString(), count: 0 };
      const requestsPerMinute = [...state.requestsPerMinute.slice(1), newPoint];
      return { requestsPerMinute };
    });
  },

  setActiveAPIs: (count) => set({ activeAPIs: count }),
}));
