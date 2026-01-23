import { api, getApiBaseUrl } from '@/lib/axios';

export const getImageUrl = (relativePath: string | null | undefined): string | null => {
  if (!relativePath) return null;
  
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
    return relativePath;
  }
  
  let baseURL: string = getApiBaseUrl();
  try {
    const apiBaseURL = api.defaults.baseURL;
    if (apiBaseURL) {
      baseURL = typeof apiBaseURL === 'string' ? apiBaseURL : String(apiBaseURL);
    }
  } catch (error) {
    console.warn('Failed to get baseURL from axios, using fallback:', error);
  }
  
  const cleanBaseURL = baseURL.replace(/\/$/, '');
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${cleanBaseURL}${cleanPath}`;
};
