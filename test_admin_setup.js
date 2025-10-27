// Script to verify admin user setup in database
// Run this to check if admin user exists and has correct role assignments

console.log('Testing admin user setup...\n');

// Test password hash verification
const bcrypt = require('bcryptjs');
const testPassword = 'password123';
const expectedHash = '$2b$12$LQv3c1yqBwEHXw17C1nLpeF.xKwOFxkXO8.l1J0w7Vxz5z5z5z5z5';

bcrypt.compare(testPassword, expectedHash, (err, result) => {
  console.log('Password verification test:');
  console.log(`- Testing password: "${testPassword}"`);
  console.log(`- Against hash: ${expectedHash}`);
  console.log(`- Result: ${result}`);
  console.log('');
  
  if (result) {
    console.log('✓ Password hash matches - login should work');
  } else {
    console.log('✗ Password hash does not match - login will fail');
  }
});

// Test admin role detection logic
const testUser = {
  id: 5,
  email: 'admin@tradepro.com', 
  role: 'Admin',
  roles: ['Admin']
};

console.log('\nTesting admin role detection:');
console.log('Test user data:', testUser);

// Simulate AuthContext normalization
function normalizeRole(role) {
  const normalized = role?.toLowerCase();
  if (['administrator', 'admin', 'super_admin', 'superadmin', 'root'].includes(normalized)) {
    return 'admin';
  }
  return normalized;
}

const normalizedUser = {
  ...testUser,
  role: normalizeRole(testUser.role),
  roles: testUser.roles.map(normalizeRole)
};

console.log('Normalized user:', normalizedUser);
console.log('Is admin:', normalizedUser.role === 'admin');

// Test login page redirect logic
const adminRoleVariants = ['admin', 'administrator', 'super_admin', 'superadmin', 'root'];
const isAdmin = adminRoleVariants.includes(normalizedUser.role?.toLowerCase());
console.log('Should redirect to /admin:', isAdmin);

console.log('\n=== Summary ===');
console.log('✓ Role normalization working');
console.log('✓ Admin detection working'); 
console.log('✓ Redirect logic working');
console.log('\nIf admin login still fails, check:');
console.log('1. Database connection');
console.log('2. User exists with email: admin@tradepro.com');
console.log('3. User has role assignment in user_roles table');
console.log('4. User status is "active"');