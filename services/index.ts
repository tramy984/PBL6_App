import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";

const api = axios.create({
  baseURL: "https://pbl6-backend.vercel.app/api",
  timeout: 10000,
});

api.interceptors.request.use(
  async (config: any) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export default api;