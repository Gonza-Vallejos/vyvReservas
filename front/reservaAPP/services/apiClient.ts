import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../environment/config";

/**
 * Cliente HTTP centralizado para la app móvil.
 * Agrega automáticamente el token de autenticación en cada request.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Logging centralizado; se puede extender para manejar 401 globalmente
    if (__DEV__) {
      console.error("API Error:", error.response?.config?.url, error.response?.data);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
