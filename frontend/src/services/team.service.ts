import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const teamService = {
  getTeams: async () => {
    const response = await axios.get(`${API_URL}/teams`);
    return response.data;
  },

  createTeam: async (name: string) => {
    const response = await axios.post(`${API_URL}/teams`, { name });
    return response.data;
  },

  inviteMember: async (teamId: string, email: string, role: string) => {
    const response = await axios.post(`${API_URL}/teams/${teamId}/invite`, { email, role });
    return response.data;
  },

  getActivityLog: async (teamId: string) => {
    const response = await axios.get(`${API_URL}/teams/${teamId}/activity`);
    return response.data;
  },

  removeMember: async (teamId: string, userId: string) => {
    const response = await axios.delete(`${API_URL}/teams/${teamId}/members/${userId}`);
    return response.data;
  }
};
