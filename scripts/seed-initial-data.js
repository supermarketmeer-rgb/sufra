import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config();

const connectionUrl = process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL;

if (!connectionUrl) {
  console.error('❌ MYSQL connection string not found.');
  process.exit(1);
}

async function seed() {
  console.log('🔌 Connecting to Railway MySQL to complete production seed...');
  const conn = await mysql.createConnection({
    uri: connectionUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    let restaurantId = 1;
    const [existingRests] = await conn.query('SELECT id, name_ar FROM restaurants WHERE id = 1;');
    if (existingRests.length === 0) {
      // 1. Insert Restaurant
      const [restResult] = await conn.query(`
        INSERT INTO restaurants (name_ar, name_en, slug, logo_url, cover_url, description_ar, phone, email, address, currency, tax_percentage, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'مطعم السُفرة الأصيل',
        'Sufrah Authentic Restaurant',
        'sufrah-restaurant',
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
        'أفخم المأكولات الشرقية والغربية بنكهة أصيلة وتجربة ضيافة فريدة',
        '+964 770 123 4567',
        'contact@sufrah-restaurant.com',
        'بغداد - المنصور - شارع 14 رمضان',
        'IQD',
        5.00,
        'active'
      ]);
      restaurantId = restResult.insertId;
    }

    // 2. Settings
    await conn.query(`
      INSERT INTO restaurant_settings (restaurant_id, theme_primary_color, enable_online_ordering, enable_table_ordering, enable_takeaway, enable_delivery, delivery_fee_base, whatsapp_number)
      VALUES (?, ?, 1, 1, 1, 1, 3000.00, ?)
      ON DUPLICATE KEY UPDATE whatsapp_number = VALUES(whatsapp_number), theme_primary_color = VALUES(theme_primary_color)
    `, [restaurantId, '#f59e0b', '+9647701234567']);

    // 3. Subscription
    const [sub] = await conn.query('SELECT id FROM subscriptions WHERE restaurant_id = ?;', [restaurantId]);
    if (sub.length === 0) {
      await conn.query(`
        INSERT INTO subscriptions (restaurant_id, plan_id, status, starts_at, ends_at, amount_paid, payment_method)
        VALUES (?, 2, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 65000.00, 'manual')
      `, [restaurantId]);
    }

    // 4. Main Branch
    let branchId = 1;
    const [existingBranches] = await conn.query('SELECT id FROM branches WHERE restaurant_id = ?;', [restaurantId]);
    if (existingBranches.length === 0) {
      const [branchResult] = await conn.query(`
        INSERT INTO branches (restaurant_id, name_ar, name_en, phone, address, opening_time, closing_time, is_active)
        VALUES (?, ?, ?, ?, ?, '11:00', '01:00', 1)
      `, [
        restaurantId,
        'الفرع الرئيسي - المنصور',
        'Main Branch - Al Mansour',
        '+964 770 123 4567',
        'بغداد - المنصور'
      ]);
      branchId = branchResult.insertId;
    } else {
      branchId = existingBranches[0].id;
    }

    // 5. Tables
    const [existingTables] = await conn.query('SELECT id FROM tables WHERE branch_id = ?;', [branchId]);
    if (existingTables.length === 0) {
      for (let i = 1; i <= 10; i++) {
        await conn.query(`
          INSERT INTO tables (branch_id, table_number, capacity, status, qr_token)
          VALUES (?, ?, ?, 'available', ?)
        `, [branchId, `طاولة ${i}`, i <= 4 ? 4 : (i <= 8 ? 6 : 8), `TBL-MAN-${i}`]);
      }
    }

    // 6. Categories
    const categoriesData = [
      { ar: 'مشاوي وشاورما', en: 'Grills & Shawarma', slug: 'grills', icon: 'Flame', sort: 1 },
      { ar: 'برغر وساندويشات', en: 'Burgers & Sandwiches', slug: 'burgers', icon: 'Utensils', sort: 2 },
      { ar: 'مقبلات وسلطات', en: 'Appetizers & Salads', slug: 'salads', icon: 'Salad', sort: 3 },
      { ar: 'مشروبات وعصائر', en: 'Drinks & Juices', slug: 'drinks', icon: 'Coffee', sort: 4 },
      { ar: 'حلويات فاخرة', en: 'Desserts', slug: 'desserts', icon: 'Cake', sort: 5 }
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      const [catRow] = await conn.query('SELECT id FROM categories WHERE restaurant_id = ? AND slug = ?;', [restaurantId, cat.slug]);
      if (catRow.length > 0) {
        categoryMap[cat.slug] = catRow[0].id;
      } else {
        const [res] = await conn.query(`
          INSERT INTO categories (restaurant_id, name_ar, name_en, slug, icon_name, sort_order, is_active)
          VALUES (?, ?, ?, ?, ?, ?, 1)
        `, [restaurantId, cat.ar, cat.en, cat.slug, cat.icon, cat.sort]);
        categoryMap[cat.slug] = res.insertId;
      }
    }

    // 7. Products
    const [existingProducts] = await conn.query('SELECT id FROM products WHERE restaurant_id = ?;', [restaurantId]);
    if (existingProducts.length === 0) {
      const productsData = [
        {
          cat: 'grills',
          ar: 'كباب لحم عراقي مشوي',
          en: 'Iraqi Lamb Kebab',
          desc: 'أسياخ كباب لحم غنم طازج متبل بالخلطة البغدادية مع الخبز الحار والخضار المشوية والسماق',
          price: 14000,
          img: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
          cal: 680,
          prep: 20,
          feat: 1
        },
        {
          cat: 'grills',
          ar: 'شاورما لحم عربي صحن',
          en: 'Arabic Meat Shawarma Plate',
          desc: 'شرائح لحم بقري ممتازة مع الطحينية والمخللات والبطاطا المقرمشة وخبز الصاج',
          price: 9000,
          img: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=600&q=80',
          cal: 550,
          prep: 15,
          feat: 1
        },
        {
          cat: 'grills',
          ar: 'شيش طاووق بتتبيلة الزعفران',
          en: 'Saffron Shish Tawook',
          desc: 'قطع صدور دجاج متبلة باللبن والثوم والزعفران تقدم مع الثومية والبطاطا',
          price: 11000,
          img: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
          cal: 510,
          prep: 18,
          feat: 0
        },
        {
          cat: 'burgers',
          ar: 'برغر سُفرة الملكي دبل لحم',
          en: 'Sufrah Royal Double Burger',
          desc: 'قطعتان من لحم الأنجوس مع جبنة الشيدر الذائبة، البصل المكرمل، وصوص السفرة السري الخاص',
          price: 9500,
          img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
          cal: 780,
          prep: 15,
          feat: 1
        },
        {
          cat: 'burgers',
          ar: 'برغر كريسبي تشيكن مدخن',
          en: 'Smoked Crispy Chicken Burger',
          desc: 'صدر دجاج مقرمش ذهبي مع صوص الباربيكيو المدخن والخس الأمريكي وسلطة الكولسلو',
          price: 8000,
          img: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=600&q=80',
          cal: 620,
          prep: 12,
          feat: 0
        },
        {
          cat: 'salads',
          ar: 'حمص بيروتي باللحمة والصنوبر',
          en: 'Beiruti Hummus with Meat & Pine Nuts',
          desc: 'حمص ناعم بزيت الزيتون البكر مع لحم مفروم محموس وصنوبر محمص',
          price: 5500,
          img: 'https://images.unsplash.com/photo-1574484284002-952d92456975?auto=format&fit=crop&w=600&q=80',
          cal: 380,
          prep: 8,
          feat: 0
        },
        {
          cat: 'salads',
          ar: 'سلطة تبولة شامية فاخرة',
          en: 'Shami Tabbouleh Salad',
          desc: 'بقدونس مفروم ناعم مع برغل ناعم، طماطم، نعناع، عصير ليمون طازج وزيت زيتون',
          price: 4500,
          img: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
          cal: 210,
          prep: 8,
          feat: 0
        },
        {
          cat: 'drinks',
          ar: 'موهيتو توت بري أزرق مثلج',
          en: 'Iced Blue Ocean Mojito',
          desc: 'مشروب منعش بالنكهة المنعشة مع النعناع الطازج، الليمون وقطع الثلج المجروش',
          price: 3500,
          img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
          cal: 150,
          prep: 5,
          feat: 1
        },
        {
          cat: 'drinks',
          ar: 'عصير برتقال طبيعي معصور طازج',
          en: 'Fresh Orange Juice',
          desc: 'برتقال طبيعي 100% معصور فور الطلب بدون سكر مضاف أو ماء',
          price: 3000,
          img: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80',
          cal: 120,
          prep: 5,
          feat: 0
        },
        {
          cat: 'desserts',
          ar: 'كنافة نابلسية بالجبنة الساخنة',
          en: 'Hot Cheese Nabulsi Knafeh',
          desc: 'كنافة ذهبية مقرمشة محشوة بجبنة عكاوية ذائبة ومسقية بالقطر العطري مع الفستق الحلبي',
          price: 6500,
          img: 'https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=600&q=80',
          cal: 480,
          prep: 12,
          feat: 1
        }
      ];

      for (let i = 0; i < productsData.length; i++) {
        const prod = productsData[i];
        const catId = categoryMap[prod.cat];
        await conn.query(`
          INSERT INTO products (restaurant_id, category_id, name_ar, name_en, description_ar, base_price, image_url, calories, prep_time_minutes, is_available, is_featured, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
        `, [restaurantId, catId, prod.ar, prod.en, prod.desc, prod.price, prod.img, prod.cal, prod.prep, prod.feat, i + 1]);
      }
    }

    // 8. Coupons
    const [existingCoupons] = await conn.query('SELECT id FROM coupons WHERE restaurant_id = ?;', [restaurantId]);
    if (existingCoupons.length === 0) {
      await conn.query(`
        INSERT INTO coupons (restaurant_id, code, discount_type, discount_value, min_order_amount, is_active)
        VALUES (?, 'SUFRAH20', 'percentage', 20.00, 10000.00, 1),
               (?, 'WELCOME10', 'percentage', 10.00, 5000.00, 1)
      `, [restaurantId, restaurantId]);
    }

    // 9. Users
    const [adminUser] = await conn.query('SELECT id FROM users WHERE email = ?;', ['admin@sufrah.com']);
    if (adminUser.length === 0) {
      await conn.query(`
        INSERT INTO users (restaurant_id, role_id, name, email, phone, password_hash, status)
        VALUES (NULL, 1, 'مدير المنصة العام', 'admin@sufrah.com', '+9647700000000', 'admin123', 'active')
      `);
    }

    const [ownerUser] = await conn.query('SELECT id FROM users WHERE email = ?;', ['owner@sufrah.com']);
    if (ownerUser.length === 0) {
      await conn.query(`
        INSERT INTO users (restaurant_id, role_id, name, email, phone, password_hash, status)
        VALUES (?, 2, 'أحمد المدير', 'owner@sufrah.com', '+9647701234567', 'owner123', 'active')
      `, [restaurantId]);
    }

    // 10. Initial Log
    await conn.query(`
      INSERT INTO activity_logs (restaurant_id, action, description)
      VALUES (?, 'Production Ready', 'تمت تهيئة قاعدة البيانات وإنشاء مطعم السفرة الأصيل ومنيوه وقوائمه للإنتاج')
    `, [restaurantId]);

    console.log('🎉 Production initial seed completed successfully with all tables linked!');
  } catch (err) {
    console.error('❌ Error during seed:', err);
  } finally {
    await conn.end();
  }
}

seed();
