const API_URL = process.env.REACT_APP_API_URL || 'your-elastic-beanstalk-url';

export const apiConfig = {
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
};

export default apiConfig;
