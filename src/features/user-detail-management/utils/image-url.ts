import { api } from '@/lib/axios';
import apiUrl from '../../../../public/config.json';

export const getImageUrl = (relativePath: string | null | undefined): string | null => {
  if (!relativePath) return null;
  
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://') || relativePath.startsWith('data:')) {
    return relativePath;
  }
  
  let baseURL: string = apiUrl.apiUrl;
  try {
    const apiBaseURL = api.defaults.baseURL;
    if (apiBaseURL) {
      baseURL = typeof apiBaseURL === 'string' ? apiBaseURL : (apiBaseURL as string).toString();
    }
  } catch (error) {
    console.warn('Failed to get baseURL from axios, using default:', error);
  }
  
  const cleanBaseURL = baseURL.replace(/\/$/, '');
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${cleanBaseURL}${cleanPath}`;
};
