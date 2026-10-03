import mysql from 'mysql2/promise';

const url = process.env.MYSQL_PUBLIC_URL || 'mysql://root:GosKQabEkLaBCIyDNQlZqGPwqhTjBDzg@altaria.proxy.rlwy.net:56675/railway';
const pool = mysql.createPool({ uri: url, ssl: { rejectUnauthorized: false } });

const initialUsers = [
  // Super Admin
  { id: 1, restaurant_id: null, branch_id: null, role_id: 1, name: 'المدير العام للمنصة', username: 'admin', email: 'admin@sufrah.com', password: 'admin123', pin: '1234', phone: '+9647700000000' },
  // Restaurant 1: مطعم السفرة
  { id: 2, restaurant_id: 1, branch_id: null, role_id: 2, name: 'أحمد السامرائي (مالك السُفرة)', username: 'owner_sufrah', email: 'owner@sufrah.com', password: 'owner123', pin: '1111', phone: '+9647701234567' },
  { id: 3, restaurant_id: 1, branch_id: 1, role_id: 3, name: 'عمر القيسي (مدير المنصور)', username: 'manager_sufrah', email: 'manager@sufrah.com', password: 'manager123', pin: '2222', phone: '+9647701112222' },
  { id: 4, restaurant_id: 1, branch_id: 1, role_id: 4, name: 'سامر العلي (كاشير المنصور)', username: 'cashier_sufrah', email: 'cashier@sufrah.com', password: 'cashier123', pin: '3333', phone: '+9647703334444' },
  { id: 5, restaurant_id: 1, branch_id: 1, role_id: 5, name: 'الشيف حسن (مطبخ المنصور)', username: 'chef_sufrah', email: 'chef@sufrah.com', password: 'chef123', pin: '4444', phone: '+9647705556666' },
  { id: 6, restaurant_id: 1, branch_id: 1, role_id: 6, name: 'علي الكرخي (دليفري المنصور)', username: 'driver_sufrah', email: 'driver@sufrah.com', password: 'driver123', pin: '5555', phone: '+9647707778888' },
  // Restaurant 2: مطعم جوان
  { id: 7, restaurant_id: 2, branch_id: null, role_id: 2, name: 'جوان (مالك مطعم جوان)', username: 'owner_jwan', email: 'owner@jwan.com', password: 'jwan123', pin: '2026', phone: '07810909577' },
  { id: 8, restaurant_id: 2, branch_id: 2, role_id: 3, name: 'مدير فرع جوان', username: 'manager_jwan', email: 'manager@jwan.com', password: 'manager123', pin: '9999', phone: '07810909578' },
  { id: 9, restaurant_id: 2, branch_id: 2, role_id: 4, name: 'كاشير مطعم جوان', username: 'cashier_jwan', email: 'cashier@jwan.com', password: 'cashier123', pin: '7777', phone: '07810909579' },
  { id: 10, restaurant_id: 2, branch_id: 2, role_id: 5, name: 'الشيف جوان (مطبخ جوان)', username: 'chef_jwan', email: 'chef@jwan.com', password: 'chef123', pin: '8888', phone: '07810909580' },
  { id: 11, restaurant_id: 2, branch_id: 2, role_id: 6, name: 'مندوب توصيل جوان', username: 'driver_jwan', email: 'driver@jwan.com', password: 'driver123', pin: '6666', phone: '07810909581' }
];

async function seed() {
  for (const u of initialUsers) {
    await pool.query(`
      INSERT INTO users (id, restaurant_id, branch_id, role_id, name, username, email, phone, password_hash, pin_code, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
      ON DUPLICATE KEY UPDATE
        restaurant_id = VALUES(restaurant_id),
        branch_id = VALUES(branch_id),
        role_id = VALUES(role_id),
        name = VALUES(name),
        username = VALUES(username),
        email = VALUES(email),
        phone = VALUES(phone),
        password_hash = VALUES(password_hash),
        pin_code = VALUES(pin_code),
        status = 'active';
    `, [u.id, u.restaurant_id, u.branch_id, u.role_id, u.name, u.username, u.email, u.phone, u.password, u.pin]);
  }
  const [rows] = await pool.query('SELECT id, name, username, phone, role_id, restaurant_id FROM users;');
  console.log('✅ SEEDED USERS SUCCESSFULLY! COUNT:', rows.length);
  console.table(rows);
  await pool.end();
}

seed().catch(console.error);
