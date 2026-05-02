import api from './api';

export const referralService = {
  getStats: async () => {
    const response = await api.get('/referrals/stats');
    return response.data;
  },

  inviteByEmail: async (email: string) => {
    const response = await api.post('/referrals/invite', { email });
    return response.data;
  }
};
