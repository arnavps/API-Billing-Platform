import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const domainService = {
  getDomains: async () => {
    const response = await axios.get(`${API_URL}/domains`);
    return response.data;
  },

  addDomain: async (domain: string) => {
    const response = await axios.post(`${API_URL}/domains`, { domain });
    return response.data;
  },

  verifyDomain: async (id: string) => {
    const response = await axios.post(`${API_URL}/domains/${id}/verify`);
    return response.data;
  },

  deleteDomain: async (id: string) => {
    const response = await axios.delete(`${API_URL}/domains/${id}`);
    return response.data;
  }
};
