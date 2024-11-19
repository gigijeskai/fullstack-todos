const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default apiConfig;
