/**
 * Permission utilities for V&V Frontend
 * Mirrors backend permission system
 */

import { PROFILES, getProfileId } from './profiles';

// Permission definitions (resource:action pattern)
// These should match the backend constants/permissions.js
export const PERMISSIONS = {
  // Users
  USERS_READ: 'users:read',
  USERS_WRITE: 'users:write',
  USERS_DELETE: 'users:delete',
  
  // Companies
  COMPANIES_READ: 'companies:read',
  COMPANIES_WRITE: 'companies:write',
  COMPANIES_DELETE: 'companies:delete',
  
  // Trips
  TRIPS_READ: 'trips:read',
  TRIPS_WRITE: 'trips:write',
  TRIPS_DELETE: 'trips:delete',
  
  // Reservations
  RESERVATIONS_READ: 'reservations:read',
  RESERVATIONS_WRITE: 'reservations:write',
  RESERVATIONS_DELETE: 'reservations:delete',
  
  // Vehicles
  VEHICLES_READ: 'vehicles:read',
  VEHICLES_WRITE: 'vehicles:write',
  VEHICLES_DELETE: 'vehicles:delete',
  
  // Payments
  PAYMENTS_READ: 'payments:read',
  PAYMENTS_WRITE: 'payments:write',
  
  // Reports
  REPORTS_READ: 'reports:read',
  REPORTS_WRITE: 'reports:write',
};

// Profile permissions - what each profile can do
export const PROFILE_PERMISSIONS = {
  [PROFILES.ADMINISTRADOR]: [
    'users:*',
    'companies:*',
    'trips:*',
    'reservations:*',
    'vehicles:*',
    'payments:*',
    'reports:*',
  ],
  [PROFILES.EMPRESA]: [
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
    'trips:read',
    'reservations:read',
    'reservations:write',
    'payments:read',
  ],
  [PROFILES.CHOFER]: [
    'trips:read',
    'reservations:read',
  ],
  [PROFILES.CLIENTE]: [
    'users:read',
    'reservations:read',
    'reservations:write',
    'payments:write',
  ],
};

/**
 * Check if a profile has a specific permission
 */
export const hasPermission = (profileId, permission) => {
  const perms = PROFILE_PERMISSIONS[profileId];
  if (!perms) return false;
  
  // Check exact permission
  if (perms.includes(permission)) return true;
  
  // Check wildcard permissions (e.g., 'users:*' grants all user permissions)
  const [resource] = permission.split(':');
  return perms.includes(`${resource}:*`) || perms.includes('*');
};

/**
 * Get all permissions for a profile
 */
export const getProfilePermissions = (profileId) => {
  return PROFILE_PERMISSIONS[profileId] || [];
};

/**
 * Check if profile is at least a certain level in hierarchy
 */
export const isAtLeastProfile = (userProfileId, minProfileId) => {
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

/**
 * Check if user can access a resource based on ownership
 */
export const canAccessResource = (user, resourceOwnerId) => {
  const profileId = Number(user?.perfil_id ?? user?.perfilId ?? getProfileId(user?.perfil));
  const userEmpresaId = user?.id_empresa ?? user?.idEmpresa;
  
  // Admin can access everything
  if (profileId === PROFILES.ADMINISTRADOR) return true;
  
  // Owner can access their own resources
  if (profileId === PROFILES.EMPRESA && userEmpresaId) {
    return Number(userEmpresaId) === Number(resourceOwnerId);
  }
  
  // Staff can access company's resources
  if ([PROFILES.MOSTRADOR, PROFILES.CHOFER].includes(profileId) && userEmpresaId) {
    return Number(userEmpresaId) === Number(resourceOwnerId);
  }
  
  return false;
};

/**
 * Get profile display info
 */
export const getProfileInfo = (profileId) => {
  const labels = {
    [PROFILES.ADMINISTRADOR]: { name: 'Administrador', color: 'success', icon: '🛡️' },
    [PROFILES.CLIENTE]: { name: 'Cliente', color: 'default', icon: '👤' },
    [PROFILES.MOSTRADOR]: { name: 'Mostrador', color: 'accent', icon: '💼' },
    [PROFILES.CHOFER]: { name: 'Chofer', color: 'primary', icon: '🚌' },
    [PROFILES.EMPRESA]: { name: 'Empresa', color: 'success', icon: '🏢' },
  };
  
  return labels[profileId] || { name: 'Desconocido', color: 'default', icon: '❓' };
};
