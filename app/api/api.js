// app/api/api.js
import axios from 'axios';
import { getToken } from '../utils/storage';

// Set your backend base URL here.
// During development, set to LAN IP like http://192.168.1.100:3000
// For Android emulator use http://10.0.2.2:3000

const API_BASE_URL = __DEV__ ? 'http://192.168.1.8:4000/api' : 'https://api.yourdomain.com'; // <-- replace

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

instance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      console.log('⚠️ Unauthorized (401) — clearing token');

      // Remove token from storage
      await removeToken();

      // Remove from axios headers
      instance.setToken(null);

      // You CANNOT navigate from inside api.js
      // Instead: send a special error so AuthContext can handle logout
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
