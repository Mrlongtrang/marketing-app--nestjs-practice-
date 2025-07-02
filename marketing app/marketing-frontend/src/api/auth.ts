import axios from './axiosInstance';

export const API_URL = 'http://localhost:3000';

// Get access token from localStorage
export const getAccessToken = () => localStorage.getItem('access_token');

// Get refresh token from localStorage
export const getRefreshToken = () => localStorage.getItem('refresh_token');

// Save both tokens to localStorage
export const saveTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};

// Clear both tokens from localStorage (used on logout)
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Request new access token using refresh token
export const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  const res = await axios.post('/auth/refresh', {
    token: refreshToken,
  });

  const { access_token } = res.data;
  saveTokens(access_token, refreshToken); 
  return access_token;
};

export const login = async (username: string, password: string) => {
  const res = await axios.post('/auth/login', {
    username,
    password,
  });

  const { access_token, refresh_token } = res.data;
  saveTokens(access_token, refresh_token);
  return res.data;
};

