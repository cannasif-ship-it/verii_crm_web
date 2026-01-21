import { api } from '@/lib/axios';

const DEFAULT_API_URL = 'https://crmapi.v3rii.com';

export const getImageUrl = (relativePath: string | null | undefined): string | null => {
  if (!relativePath) return null;
  
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
    return relativePath;
  }
  
  let baseURL: string = DEFAULT_API_URL;
  try {
    const apiBaseURL = api.defaults.baseURL;
    if (apiBaseURL) {
      baseURL = typeof apiBaseURL === 'string' ? apiBaseURL : String(apiBaseURL);
    }
  } catch (error) {
    console.warn('Failed to get baseURL from axios, using default:', error);
  }
  
  const cleanBaseURL = baseURL.replace(/\/$/, '');
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${cleanBaseURL}${cleanPath}`;
};
