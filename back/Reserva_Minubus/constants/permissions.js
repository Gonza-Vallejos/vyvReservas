/**
 * Permission system for V&V Reservas
 * 
 * Based on resource:action pattern for fine-grained control
 * Profiles are hierarchical (higher can do everything lower can)
 */

// Profile IDs (from database)
const PROFILES = {
  ADMINISTRADOR: 1,
  CLIENTE: 2,
  MOSTRADOR: 3,
  CHOFER: 4,
  EMPRESA: 5,
};

// Profile names (from database)
const PROFILE_NAMES = {
  1: 'usuarioAdministrador',
  2: 'usuarioCliente',
  3: 'usuarioMostrador',
  4: 'usuarioChofer',
  5: 'usuarioEmpresa',
};

// Permission definitions: what each profile can do
const PROFILE_PERMISSIONS = {
  [PROFILES.ADMINISTRADOR]: [
    // Can manage all resources
    'users:read',
    'users:write',
    'users:delete',
    'companies:read',
    'companies:write',
    'companies:delete',
    'trips:read',
    'trips:write',
    'trips:delete',
    'reservations:read',
    'reservations:write',
    'reservations:delete',
    'vehicles:read',
    'vehicles:write',
    'vehicles:delete',
    'payments:read',
    'payments:write',
    'reports:read',
    'reports:write',
  ],
  [PROFILES.EMPRESA]: [
    // Can manage their own company resources
    'users:read',
    'companies:read',
    'trips:read',
    'trips:write',
    'trips:delete',
    'reservations:read',
    'reservations:write',
    'vehicles:read',
    'vehicles:write',
    'payments:read',
    'reports:read',
  ],
  [PROFILES.MOSTRADOR]: [
    // Can manage reservations and view trips
    'trips:read',
    'reservations:read',
    'reservations:write',
    'payments:read',
  ],
  [PROFILES.CHOFER]: [
    // Can view assigned trips and passengers
    'trips:read',
    'reservations:read',
  ],
  [PROFILES.CLIENTE]: [
    // Can manage own reservations and view own profile
    'users:read',
    'reservations:read',
    'reservations:write',
    'payments:write',
  ],
};

/**
 * Check if a profile has a specific permission
 */
const hasPermission = (profileId, permission) => {
  const perms = PROFILE_PERMISSIONS[profileId];
  if (!perms) return false;
  
  // Check exact permission
  if (perms.includes(permission)) return true;
  
  // Check wildcard permissions (e.g., 'users:*' grants all user permissions)
  const [resource] = permission.split(':');
  return perms.includes(`${resource}:*`) || perms.includes('*');
};

/**
 * Check if profile can access resource based on ownership
 * Only applies to resources that have an empresa_id or similar owner field
 */
const canAccessResource = (user, resource, resourceOwnerId) => {
  const profileId = Number(user.perfil_id);
  
  // Admin can access everything
  if (profileId === PROFILES.ADMINISTRADOR) return true;
  
  // Owner can access their own resources
  if (profileId === PROFILES.EMPRESA && user.id_empresa) {
    return Number(user.id_empresa) === Number(resourceOwnerId);
  }
  
  // Staff can access company's resources
  if ([PROFILES.MOSTRADOR, PROFILES.CHOFER].includes(profileId) && user.id_empresa) {
    return Number(user.id_empresa) === Number(resourceOwnerId);
  }
  
  return false;
};

/**
 * Get profile ID from profile name
 */
const getProfileId = (profileName) => {
  return PROFILE_NAMES[profileName] ? 
    Object.keys(PROFILE_NAMES).find(k => PROFILE_NAMES[k] === profileName) : 
    null;
};

/**
 * Get profile name from ID
 */
const getProfileName = (profileId) => {
  return PROFILE_NAMES[profileId] || null;
};

/**
 * Check if profile is at least a certain level in hierarchy
 */
const isAtLeastProfile = (userProfileId, minProfileId) => {
  const hierarchy = [
    PROFILES.CLIENTE,
    PROFILES.CHOFER,
    PROFILES.MOSTRADOR,
    PROFILES.EMPRESA,
    PROFILES.ADMINISTRADOR,
  ];
  
  const userIndex = hierarchy.indexOf(Number(userProfileId));
  const minIndex = hierarchy.indexOf(Number(minProfileId));
  
  return userIndex >= minIndex;
};

module.exports = {
  PROFILES,
  PROFILE_NAMES,
  PROFILE_PERMISSIONS,
  hasPermission,
  canAccessResource,
  getProfileId,
  getProfileName,
  isAtLeastProfile,
};
