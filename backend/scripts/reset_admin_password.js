/* Script to set a known password for the admin user (admin@tradingplatform.com)
   Usage: node backend/scripts/reset_admin_password.js
   Requires DB environment variables set in environment or a .env file in project root.
*/
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'pro2',
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306
};

async function resetAdminPassword() {
  let conn;
  try {
    console.log('Connecting to database...');
    conn = await mysql.createConnection(dbConfig);
    console.log('Connected to DB');

    const adminEmail = 'admin@tradingplatform.com';
    const newPassword = 'password123';
    const saltRounds = 12;

    const hash = await bcrypt.hash(newPassword, saltRounds);

    const [result] = await conn.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hash, adminEmail]);

    if (result && result.affectedRows > 0) {
      console.log(`Updated password for ${adminEmail}. New password: ${newPassword}`);
    } else {
      console.log(`No user found with email ${adminEmail}. No changes made.`);
      // Show possible similar emails
      const [rows] = await conn.execute("SELECT email FROM users WHERE email LIKE '%admin%' LIMIT 10");
      if (rows.length) {
        console.log('Users with admin-like emails found:');
        rows.forEach(r => console.log(' -', r.email));
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
    console.error(err);
  } finally {
    if (conn) await conn.end();
    console.log('Done');
  }
}

resetAdminPassword();
