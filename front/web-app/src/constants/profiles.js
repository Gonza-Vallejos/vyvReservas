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

// Profile names (for API compatibility)
export const PROFILE_NAMES = {
  1: 'usuarioAdministrador',
  2: 'usuarioCliente',
  3: 'usuarioMostrador',
  4: 'usuarioChofer',
  5: 'usuarioEmpresa',
};

// Get profile ID from name
export const getProfileId = (profileName) => {
  const entry = Object.entries(PROFILE_NAMES).find(([id, name]) => name === profileName);
  return entry ? Number(entry[0]) : null;
};

// Get profile name from ID
export const getProfileName = (profileId) => PROFILE_NAMES[profileId] || null;

export const PROFILE_LABELS = {
  [PROFILES.ADMINISTRADOR]: 'Administrador',
  [PROFILES.CLIENTE]: 'Cliente',
  [PROFILES.MOSTRADOR]: 'Mostrador',
  [PROFILES.CHOFER]: 'Chofer',
  [PROFILES.EMPRESA]: 'Empresa',
};

export const getProfileLabel = (perfilId) => PROFILE_LABELS[perfilId] || 'Desconocido';

// Profile hierarchy (for isAtLeast comparisons)
export const PROFILE_HIERARCHY = [
  PROFILES.CLIENTE,    // 0 - lowest
  PROFILES.CHOFER,      // 1
  PROFILES.MOSTRADOR,   // 2
  PROFILES.EMPRESA,    // 3
  PROFILES.ADMINISTRADOR, // 4 - highest
];
