/**
 * Environment Configuration
 * Vite uses import.meta.env instead of process.env
 */

export const env = {
  // App info
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Dreams POS',
  
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'https://hiweb.vn/api/v1',
  
  // Base path
  BASE_PATH: import.meta.env.VITE_BASE_PATH || '/id/',
  
  // Public URL (for assets)
  PUBLIC_URL: import.meta.env.BASE_URL || '/id/',
  
  // Environment
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
};

export default env;
