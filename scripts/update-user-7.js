import mysql from 'mysql2/promise';

async function update() {
  const conn = await mysql.createConnection('mysql://root:GosKQabEkLaBCIyDNQlZqGPwqhTjBDzg@altaria.proxy.rlwy.net:56675/railway');
  await conn.query("UPDATE users SET name = 'علي (مالك مطعم جوان)', password_hash = '123456', pin_code = '2026' WHERE id = 7;");
  const [rows] = await conn.query('SELECT id, name, username, restaurant_id, password_hash, pin_code FROM users WHERE id = 7;');
  console.log('UPDATED USER 7:', rows);
  await conn.end();
}

update().catch(console.error);
