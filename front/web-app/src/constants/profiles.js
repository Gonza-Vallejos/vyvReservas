/**
 * IDs de perfiles de usuario (deben coincidir con la tabla Perfiles del backend).
 */
export const PROFILES = {
  ADMINISTRADOR: 1,
  CLIENTE: 2,
  MOSTRADOR: 3,
  CHOFER: 4,
  EMPRESA: 5,
};

export const PROFILE_LABELS = {
  [PROFILES.ADMINISTRADOR]: 'Administrador',
  [PROFILES.CLIENTE]: 'Cliente',
  [PROFILES.MOSTRADOR]: 'Mostrador',
  [PROFILES.CHOFER]: 'Chofer',
  [PROFILES.EMPRESA]: 'Empresa',
};

export const getProfileLabel = (perfilId) => PROFILE_LABELS[perfilId] || 'Desconocido';
