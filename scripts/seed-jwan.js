import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    uri: 'mysql://root:GosKQabEkLaBCIyDNQlZqGPwqhTjBDzg@altaria.proxy.rlwy.net:56675/railway',
    ssl: { rejectUnauthorized: false }
  });

  try {
    const [existing] = await conn.query("SELECT id, name_ar FROM restaurants WHERE id = 2 OR name_ar LIKE '%جوان%';");
    if (existing.length === 0) {
      await conn.query(`
        INSERT INTO restaurants (id, name_ar, name_en, slug, logo_url, cover_url, description_ar, phone, email, address, currency, tax_percentage, status)
        VALUES (2, 'مطعم جوان', 'Jwan Restaurant', 'jwan-restaurant', 
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        'أشهى المأكولات والمشروبات', '07810909577', 'info@jwan-pohn.com', 'العراق - بغداد', 'IQD', 0, 'active')
      `);

      await conn.query(`
        INSERT INTO restaurant_settings (restaurant_id, theme_primary_color, delivery_fee_base, whatsapp_number)
        VALUES (2, '#f59e0b', 3000, '07810909577')
      `);

      await conn.query(`
        INSERT INTO subscriptions (restaurant_id, plan_id, status, starts_at, ends_at)
        VALUES (2, 1, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))
      `);

      const [bRes] = await conn.query(`
        INSERT INTO branches (restaurant_id, name_ar, name_en, phone, address, is_active)
        VALUES (2, 'الفرع الرئيسي', 'Main Branch', '07810909577', 'بغداد', 1)
      `);
      const bId = bRes.insertId;

      for (let i = 1; i <= 5; i++) {
        await conn.query(`
          INSERT INTO tables (branch_id, table_number, capacity, status, qr_token)
          VALUES (?, ?, 4, 'available', ?)
        `, [bId, `طاولة ${i}`, `TBL-JWAN-${i}`]);
      }

      // Copy categories and products to Jwan
      const [cats] = await conn.query('SELECT * FROM categories WHERE restaurant_id = 1;');
      for (const c of cats) {
        const [nc] = await conn.query(`
          INSERT INTO categories (restaurant_id, name_ar, name_en, slug, icon_name, sort_order, is_active)
          VALUES (2, ?, ?, ?, ?, ?, 1)
        `, [c.name_ar, c.name_en, `${c.slug}-jwan`, c.icon_name, c.sort_order]);
        const newCatId = nc.insertId;

        const [prods] = await conn.query('SELECT * FROM products WHERE category_id = ?;', [c.id]);
        for (const p of prods) {
          await conn.query(`
            INSERT INTO products (restaurant_id, category_id, name_ar, name_en, description_ar, description_en, base_price, image_url, calories, prep_time_minutes, is_available, is_featured)
            VALUES (2, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
          `, [newCatId, p.name_ar, p.name_en, p.description_ar, p.description_en, p.base_price, p.image_url, p.calories, p.prep_time_minutes, p.is_featured]);
        }
      }

      console.log('✅ Successfully added مطعم جوان to Railway MySQL with categories, products, and tables!');
    } else {
      console.log('مطعم جوان already exists in DB:', existing);
    }

    const [all] = await conn.query('SELECT id, name_ar, slug, status FROM restaurants;');
    console.log('Current Restaurants in Railway DB:', all);
  } finally {
    await conn.end();
  }
}

main().catch(console.error);
