// src/config/config.ts
interface Config {
    development: { apiUrl: string };
    production: { apiUrl: string };
    test: { apiUrl: string }; 
  }
  
const configs: Config = {
    development: {
      apiUrl: 'http://localhost:5000',
    },
    production: {
      apiUrl: '/api',
    },
    test: { 
      apiUrl: 'http://localhost:5001',
    }
  };

  const env = process.env.NODE_ENV as keyof Config || 'development';
  const config = configs[env];
  
  export default config;