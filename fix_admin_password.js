/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
// Script to fix admin user password hash
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pro2',
  port: process.env.DB_PORT || 3306
};

async function fixAdminPassword() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✓ Connected to database\n');

    // Generate correct password hash
    const password = 'password123';
    const hash = bcrypt.hashSync(password, 12);
    console.log('Generated password hash for "password123"');
    console.log('Hash:', hash);

    // Check if admin user exists
    const [users] = await connection.query(
      'SELECT id, email, first_name, last_name, status FROM users WHERE email = ?',
      ['admin@tradepro.com']
    );

    if (users.length === 0) {
      console.log('\n✗ Admin user not found with email: admin@tradepro.com');
      console.log('Creating admin user...');
      
      // Create admin user
      const [userResult] = await connection.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, status, email_verified, kyc_status, preferred_leverage) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['admin@tradepro.com', hash, 'Admin', 'User', 'active', 1, 'approved', 100.00]
      );
      
      const userId = userResult.insertId;
      console.log(`✓ Created admin user with ID: ${userId}`);
      
      // Assign admin role
      await connection.query(
        'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
        [userId, 1] // Assuming role ID 1 is Admin
      );
      
      console.log('✓ Assigned admin role to user');
      
    } else {
      const adminUser = users[0];
      console.log('\n✓ Admin user found:');
      console.log('  ID:', adminUser.id);
      console.log('  Email:', adminUser.email);
      console.log('  Name:', adminUser.first_name, adminUser.last_name);
      console.log('  Status:', adminUser.status);

      // Update password hash
      await connection.query(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hash, 'admin@tradepro.com']
      );
      
      console.log('✓ Updated admin password hash');

      // Check role assignment
      const [roleAssignments] = await connection.query(
        `SELECT ur.id, r.name, r.is_admin 
         FROM user_roles ur 
         JOIN roles r ON ur.role_id = r.id 
         WHERE ur.user_id = ?`,
        [adminUser.id]
      );

      if (roleAssignments.length === 0) {
        console.log('⚠ No roles assigned to admin user, assigning admin role...');
        await connection.query(
          'INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)',
          [adminUser.id, 1]
        );
        console.log('✓ Assigned admin role');
      } else {
        console.log('✓ Role assignments:');
        roleAssignments.forEach(role => {
          console.log(`  - ${role.name} (admin: ${role.is_admin})`);
        });
      }
    }

    console.log('\n=== Admin Login Test ===');
    console.log('Email: admin@tradepro.com');
    console.log('Password: password123');
    console.log('✓ Ready for login test');

  } catch (error) {
    console.error('✗ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✓ Database connection closed');
    }
  }
}

fixAdminPassword();