import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isAuthFormEndpoint = [
      '/auth/login',
      '/auth/logout',
      '/auth/recuperar-contrasenia',
      '/auth/resetear-contrasenia',
    ].some((endpoint) => url.startsWith(endpoint));

    if (error.response?.status === 401 && !isAuthFormEndpoint && typeof window !== 'undefined') {
      window.dispatchEvent(new Event('vyv:auth-expired'));
    }
    return Promise.reject(error);
  },
);

export const authService = {
  login: (usuario, contrasenia) => api.post(
    '/auth/login',
    { usuario, contrasenia },
    { headers: { 'X-Session-Auth': 'cookie' } },
  ),
  currentSession: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
  register: (userData) => api.post('/usuarios', userData),
};

export const viajeService = {
  listarTodas: () => api.get('/viajes'),
  listarDisponibles: (origen, destino, fecha) => api.get('/viajes/disponibles', { params: { origen, destino, fecha } }),
  obtenerLocalidades: () => api.get('/ubicacion/localidades'),
  obtenerPorId: (id) => api.get(`/viajes/${id}`),
  obtenerPorEmpresa: (id) => api.get(`/viajes/empresa/${id}`),
  obtenerPorChofer: (id) => api.get(`/viajes/chofer/${id}`),
  obtenerAsientosOcupados: (id) => api.get(`/viajes/${id}/asientos`),
  crear: (data) => api.post('/viajes', data),
  actualizar: (id, data) => api.put(`/viajes/${id}`, data),
  eliminar: (id) => api.delete(`/viajes/${id}`),
};

export const transporteService = {
  listarTodas: () => api.get('/medio-transporte'),
  obtenerPorEmpresa: (id) => api.get(`/medio-transporte/empresa/${id}`),
  crear: (data) => api.post('/medio-transporte', data),
};

export const empresaService = {
  crear: (data) => api.post('/empresa', data),
  obtenerUsuarios: (id) => api.get(`/usuario-empresa/empresa/${id}/usuarios`),
  listarTodas: () => api.get('/empresa'),
  obtenerPorId: (id) => api.get(`/empresa/${id}`),
  obtenerEmpresaDeUsuario: (usuarioId) => api.get(`/usuario-empresa/usuario/${usuarioId}`),
  actualizar: (id, data) => api.put(`/empresa/${id}`, data),
  asignarDueno: async (empresaId, usuarioId) => {
    try {
      return await api.put(`/empresa/${empresaId}/asignar-dueno`, { usuarioId });
    } catch (err) {
      if (err.response?.status === 404) {
        // Fallback en caso de que el backend remoto aún no tenga desplegada la ruta nueva
        try {
          await api.post(`/usuario-empresa/asociar/${usuarioId}/${empresaId}`);
        } catch {
          // Si ya estaba asociado, ignoramos el error
        }
        return await api.put(`/usuarios/${usuarioId}`, { perfil_id: 5 });
      }
      throw err;
    }
  },
};

export const usuarioService = {
  listarTodos: () => api.get('/usuarios'),
  obtenerChoferesAsociados: () => api.get('/usuarios/choferes/asociados'),
  obtenerChoferesPorEmpresa: (empresaId) => api.get(`/usuarios/choferes/empresa/${empresaId}`),
  registrarEmpleado: (data) => api.post('/usuarios/registrar-empleado', data),
  actualizar: (id, data) => api.put(`/usuarios/${id}`, data),
};

export const reservaService = {
  listarTodas: () => api.get('/reserva'),
  crear: (reservaData) => api.post('/reserva', reservaData),
  obtenerPorUsuario: () => api.get('/reserva/usuario'),
  obtenerPorEmpresa: (empresaId) => api.get(`/reserva/empresa/${empresaId}`),
  obtenerPasajerosPorViaje: (viajeId) => api.get(`/reserva/viaje/${viajeId}/pasajeros`),
  cancelar: (id) => api.delete(`/reserva/${id}`),
};

export const pagoService = {
  crearPreferencia: (reserva_id) => api.post('/pagos/crear-preferencia', { reserva_id }),
  obtenerEstado: (reservaId) => api.get(`/pagos/estado/${reservaId}`),
  reintentar: (reservaId) => api.post(`/pagos/reintentar/${reservaId}`),
  obtenerPagos: (reservaId) => api.get(`/pagos/reserva/${reservaId}`),
  obtenerMetricasComisiones: () => api.get('/pagos/metricas-comisiones'),
  actualizarComisionEmpresa: async (empresaId, comision_porcentaje) => {
    try {
      return await api.put(`/pagos/comision-empresa/${empresaId}`, { comision_porcentaje });
    } catch (err) {
      if (err.response?.status === 404) {
        return await api.put(`/empresa/${empresaId}`, { comision_porcentaje });
      }
      throw err;
    }
  },
  obtenerUrlOAuth: (empresaId, redirectUri) => api.get(`/pagos/oauth/url/${empresaId}`, { params: { redirect_uri: redirectUri } }),
  vincularMercadoPago: (empresaId, data) => api.post(`/pagos/oauth/vincular/${empresaId}`, data),
  desvincularMercadoPago: (empresaId) => api.delete(`/pagos/oauth/desvincular/${empresaId}`),
};

export default api;
