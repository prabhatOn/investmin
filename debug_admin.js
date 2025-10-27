// Debug script to test admin role detection
const authResponse = {
  user: {
    id: 5,
    email: 'admin@tradepro.com',
    firstName: 'Admin',
    lastName: 'User',
    roles: ['Admin'], // This is what comes from database
    role: 'Admin'     // Primary role from database
  }
};

// Simulate AuthContext normalization
function normalizeUser(user) {
  const rawRoles = Array.isArray(user.roles) ? user.roles : [];
  const normalizedRoles = rawRoles.map(role => role.toLowerCase());
  const normalizedRole = (user.role || normalizedRoles[0] || 'user').toLowerCase();
  
  return {
    ...user,
    roles: normalizedRoles,
    role: normalizedRole
  };
}

// Test normalization
const normalizedUser = normalizeUser(authResponse.user);
console.log('Original user:', authResponse.user);
console.log('Normalized user:', normalizedUser);
console.log('Is admin check (role):', normalizedUser.role === 'admin');
console.log('Is admin check (roles array):', normalizedUser.roles.includes('admin'));

// Test ProtectedRoute logic
function hasAdminAccess(user) {
  const primaryRole = user?.role?.toLowerCase();
  if (primaryRole === 'admin') {
    return true;
  }

  if (Array.isArray(user?.roles)) {
    return user.roles.some((role) => role?.toLowerCase() === 'admin');
  }

  return false;
}

console.log('ProtectedRoute admin check:', hasAdminAccess(normalizedUser));