import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: (usuario, contrasenia) => api.post('/auth/login', { usuario, contrasenia }),
  register: (userData) => api.post('/usuarios', userData),
};

export const viajeService = {
  listarDisponibles: (origen, destino, fecha) => api.get('/viajes/disponibles', { params: { origen, destino, fecha } }),
  obtenerLocalidades: () => api.get('/ubicacion/localidades'),
  obtenerPorId: (id) => api.get(`/viajes/${id}`),
  obtenerPorEmpresa: (id) => api.get(`/viajes/empresa/${id}`),
  crear: (data) => api.post('/viajes', data),
};

export const transporteService = {
  obtenerPorEmpresa: (id) => api.get(`/medio-transporte/empresa/${id}`),
  crear: (data) => api.post('/medio-transporte', data),
};

export const empresaService = {
  obtenerUsuarios: (id) => api.get(`/usuario-empresa/empresa/${id}/usuarios`),
  listarTodas: () => api.get('/empresa'),
  actualizar: (id, data) => api.put(`/empresa/${id}`, data),
};

export const usuarioService = {
  registrarEmpleado: (data) => api.post('/usuarios/registrar-empleado', data),
};

export const reservaService = {
  crear: (reservaData) => api.post('/reserva', reservaData),
  obtenerPorUsuario: () => api.get('/reserva/usuario'),
  obtenerPasajerosPorViaje: (viajeId) => api.get(`/reserva/viaje/${viajeId}/pasajeros`),
};

export default api;
