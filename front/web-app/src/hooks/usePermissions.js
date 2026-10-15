/**
 * Permission hooks for V&V Frontend
 */
import { useAuth } from '../context/AuthContext';
import { PROFILES } from '../constants/profiles';
import { 
  hasPermission, 
  isAtLeastProfile, 
  canAccessResource,
  getProfilePermissions,
  getProfileInfo,
  PERMISSIONS
} from '../constants/permissions';

/**
 * Hook to check permissions
 * @example
 * const { can, isAtLeast, canAccess } = usePermissions();
 * 
 * if (can('trips:write')) { ... }
 * if (isAtLeast(PROFILES.EMPRESA)) { ... }
 * if (canAccess(resourceOwnerId)) { ... }
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const profileId = Number(user?.perfil_id);
  
  /**
   * Check if current user has a specific permission
   */
  const can = (permission) => {
    return hasPermission(profileId, permission);
  };
  
  /**
   * Check if current user has ALL of the given permissions
   */
  const canAll = (...permissions) => {
    return permissions.every(p => hasPermission(profileId, p));
  };
  
  /**
   * Check if current user has ANY of the given permissions
   */
  const canAny = (...permissions) => {
    return permissions.some(p => hasPermission(profileId, p));
  };
  
  /**
   * Check if current user is at least a certain profile level
   * @param {number} minProfileId - Minimum profile ID required
   */
  const isAtLeast = (minProfileId) => {
    return isAtLeastProfile(profileId, minProfileId);
  };
  
  /**
   * Check if current user can access a resource based on ownership
   */
  const canAccess = (resourceOwnerId) => {
    return canAccessResource(user, resourceOwnerId);
  };
  
  /**
   * Get all permissions for current user
   */
  const getPermissions = () => {
    return getProfilePermissions(profileId);
  };
  
  /**
   * Get profile info for current user
   */
  const getInfo = () => {
    return getProfileInfo(profileId);
  };
  
  /**
   * Check if user is admin
   */
  const isAdmin = () => {
    return profileId === PROFILES.ADMINISTRADOR;
  };
  
  /**
   * Check if user is owner (empresa)
   */
  const isOwner = () => {
    return profileId === PROFILES.EMPRESA;
  };
  
  /**
   * Check if user is staff (empresa, mostrador, chofer)
   */
  const isStaff = () => {
    return [PROFILES.EMPRESA, PROFILES.MOSTRADOR, PROFILES.CHOFER].includes(profileId);
  };
  
  return {
    can,
    canAll,
    canAny,
    isAtLeast,
    canAccess,
    getPermissions,
    getInfo,
    isAdmin,
    isOwner,
    isStaff,
    profileId,
    PERMISSIONS,
    PROFILES,
  };
};

export default usePermissions;
