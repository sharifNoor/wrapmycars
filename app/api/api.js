// app/api/api.js
import axios from 'axios';
import { getToken, removeToken } from '../utils/storage';

// Set your backend base URL here.
// During development, set to LAN IP like http://192.168.1.100:3000
// For Android emulator use http://10.0.2.2:3000

export const API_BASE_URL = __DEV__ ? 'https://api.wrapmycars.com/api' : 'https://api.wrapmycars.com/api'; // <-- replace

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

instance.interceptors.response.use(
  response => response,
  async error => {
    const status = error.response?.status;
    const data = error.response?.data;

    if (status === 401 || status === 403) {
      console.log(`⚠️ Auth Error (${status}) — clearing token`);

      // Preserve message if it's "Account has been deactivated"
      if (data?.message) {
        error.userMessage = data.message;
      }

      // Remove token from storage
      await removeToken();

      // Remove from axios headers
      instance.setToken(null);

      // Signal AuthContext
      error.isUnauthorized = true;
    }

    return Promise.reject(error);
  }
);


let currentToken = null;

const setToken = (t) => {
  currentToken = t;
  if (t) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${t}`;
  } else {
    delete instance.defaults.headers.common['Authorization'];
  }
};

// optional helper to initialize token from storage
const init = async () => {
  const t = await getToken();
  if (t) setToken(t);
};

instance.setToken = setToken;
instance.init = init;

export default instance;
