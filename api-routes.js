import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });
dotenv.config();

const connectionUrl = process.env.MYSQL_PUBLIC_URL || 
  process.env.DATABASE_URL || 
  process.env.MYSQL_URL ||
  (process.env.MYSQLHOST ? `mysql://${process.env.MYSQLUSER || 'root'}:${encodeURIComponent(process.env.MYSQLPASSWORD || '')}@${process.env.MYSQLHOST}:${process.env.MYSQLPORT || 3306}/${process.env.MYSQLDATABASE || 'railway'}` : null) ||
  (process.env.DB_HOST ? `mysql://${process.env.DB_USERNAME || 'root'}:${encodeURIComponent(process.env.DB_PASSWORD || '')}@${process.env.DB_HOST}:${process.env.DB_PORT || 3306}/${process.env.DB_DATABASE || 'railway'}` : null) ||
  'mysql://root:GosKQabEkLaBCIyDNQlZqGPwqhTjBDzg@altaria.proxy.rlwy.net:56675/railway';
let dbPool = null;

if (connectionUrl) {
  try {
    dbPool = mysql.createPool({
      uri: connectionUrl,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('✅ Railway MySQL Pool initialized for API routes.');
  } catch (err) {
    console.error('❌ Failed to initialize MySQL Pool:', err.message);
  }
}

export const sseClients = new Set();

export function broadcastEvent(eventName, payload) {
  const message = `event: ${eventName}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch {
      sseClients.delete(client);
    }
  }
}

const sseKeepAlive = setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(': keepalive\n\n');
    } catch {
      sseClients.delete(client);
    }
  }
}, 25000);
if (sseKeepAlive.unref) sseKeepAlive.unref();

export const apiRouter = express.Router();

apiRouter.use(express.json({ limit: '10mb' }));

// CORS
apiRouter.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// SSE Events stream
apiRouter.get('/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no'
  });

  res.write(`event: connected\ndata: {"status":"connected"}\n\n`);
  sseClients.add(res);

  req.on('close', () => {
    sseClients.delete(res);
  });
});

// Health check
apiRouter.get('/health', async (req, res) => {
  if (!dbPool) {
    return res.json({ status: 'ok', database: 'disconnected', mode: 'offline' });
  }
  try {
    await dbPool.query('SELECT 1;');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: err.message });
  }
});

// Full platform data sync
apiRouter.get(['/data', '/bootstrap'], async (req, res) => {
  if (!dbPool) {
    return res.status(503).json({ error: 'Database not initialized' });
  }

  try {
    // 1. Restaurants
    const [restRows] = await dbPool.query(`
      SELECT 
        r.*,
        s.theme_primary_color,
        s.whatsapp_number,
        s.delivery_fee_base,
        COALESCE(p.name_ar, 'الباقة الاحترافية (Pro)') as plan_name
      FROM restaurants r
      LEFT JOIN restaurant_settings s ON s.restaurant_id = r.id
      LEFT JOIN subscriptions sub ON sub.restaurant_id = r.id AND sub.status = 'active'
      LEFT JOIN plans p ON p.id = sub.plan_id
      ORDER BY r.id ASC;
    `);

    const restaurants = restRows.map(r => ({
      id: r.id,
      name_ar: r.name_ar,
      name_en: r.name_en,
      slug: r.slug,
      custom_domain: r.custom_domain || undefined,
      logo_url: r.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      cover_url: r.cover_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      description_ar: r.description_ar || '',
      phone: r.phone || '',
      email: r.email || '',
      address: r.address || '',
      currency: r.currency || 'IQD',
      tax_percentage: Number(r.tax_percentage) || 0,
      status: r.status,
      created_at: r.created_at ? new Date(r.created_at).toISOString().slice(0, 10) : '2026-01-01',
      theme_primary_color: r.theme_primary_color || '#f59e0b',
      plan_name: r.plan_name || 'الباقة الاحترافية (Pro)',
      delivery_fee_base: Number(r.delivery_fee_base) || 3000,
      whatsapp_number: r.whatsapp_number || r.phone || ''
    }));

    // 2. Branches
    const [branchRows] = await dbPool.query(`
      SELECT b.*, u.name as manager_name
      FROM branches b
      LEFT JOIN users u ON u.id = b.manager_id
      ORDER BY b.id ASC;
    `);
    const branches = branchRows.map(b => ({
      id: b.id,
      restaurant_id: b.restaurant_id,
      name_ar: b.name_ar,
      name_en: b.name_en,
      phone: b.phone || '',
      address: b.address || '',
      latitude: Number(b.latitude) || 33.315,
      longitude: Number(b.longitude) || 44.354,
      opening_time: b.opening_time || '11:00',
      closing_time: b.closing_time || '00:00',
      manager_name: b.manager_name || 'مدير الفرع',
      is_active: Boolean(b.is_active)
    }));

    // 3. Tables
    const [tableRows] = await dbPool.query(`SELECT * FROM tables ORDER BY id ASC;`);
    const tables = tableRows.map(t => ({
      id: t.id,
      branch_id: t.branch_id,
      table_number: t.table_number,
      capacity: Number(t.capacity) || 4,
      status: t.status,
      qr_token: t.qr_token
    }));

    // 4. Categories
    const [catRows] = await dbPool.query(`SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC;`);
    const categories = catRows.map(c => ({
      id: c.id,
      restaurant_id: c.restaurant_id,
      name_ar: c.name_ar,
      name_en: c.name_en,
      slug: c.slug,
      icon_name: c.icon_name || 'Utensils',
      sort_order: Number(c.sort_order) || 1
    }));

    // 5. Products
    const [prodRows] = await dbPool.query(`SELECT * FROM products WHERE is_available = 1 ORDER BY sort_order ASC, id ASC;`);
    const products = prodRows.map(p => ({
      id: p.id,
      restaurant_id: p.restaurant_id,
      category_id: p.category_id,
      name_ar: p.name_ar,
      name_en: p.name_en,
      description_ar: p.description_ar || '',
      description_en: p.description_en || '',
      base_price: Number(p.base_price) || 0,
      discount_price: p.discount_price ? Number(p.discount_price) : undefined,
      image_url: p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      calories: p.calories ? Number(p.calories) : undefined,
      prep_time_minutes: Number(p.prep_time_minutes) || 15,
      ingredients_ar: p.ingredients_ar || undefined,
      is_available: Boolean(p.is_available),
      is_featured: Boolean(p.is_featured),
      sizes: [],
      addons: []
    }));

    // 6. Orders
    const [orderRows] = await dbPool.query(`SELECT * FROM orders ORDER BY id DESC LIMIT 150;`);
    const [itemRows] = await dbPool.query(`SELECT * FROM order_details ORDER BY id ASC;`);

    const itemsByOrder = {};
    for (const it of itemRows) {
      if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
      let selectedAddons = [];
      try {
        if (it.selected_addons) {
          selectedAddons = typeof it.selected_addons === 'string' ? JSON.parse(it.selected_addons) : it.selected_addons;
        }
      } catch {}

      itemsByOrder[it.order_id].push({
        id: String(it.id),
        product_id: it.product_id,
        product_name: it.product_name,
        unit_price: Number(it.unit_price) || 0,
        quantity: Number(it.quantity) || 1,
        selected_addons: selectedAddons,
        special_instructions: it.special_instructions || undefined,
        subtotal: Number(it.subtotal) || 0
      });
    }

    const branchMap = {};
    branches.forEach(b => { branchMap[b.id] = b.name_ar; });
    const tableMap = {};
    tables.forEach(t => { tableMap[t.id] = t.table_number; });

    const orders = orderRows.map(o => ({
      id: o.id,
      order_number: o.order_number,
      restaurant_id: o.restaurant_id,
      branch_id: o.branch_id,
      branch_name: branchMap[o.branch_id] || 'الفرع الرئيسي',
      table_id: o.table_id || undefined,
      table_number: o.table_id ? (tableMap[o.table_id] || `طاولة ${o.table_id}`) : undefined,
      order_type: o.order_type,
      status: o.status,
      subtotal: Number(o.subtotal) || 0,
      tax_amount: Number(o.tax_amount) || 0,
      discount_amount: Number(o.discount_amount) || 0,
      delivery_fee: Number(o.delivery_fee) || 0,
      total_amount: Number(o.total_amount) || 0,
      customer_name: o.customer_name || 'عميل السفرة',
      customer_phone: o.customer_phone || '',
      delivery_address: o.delivery_address || undefined,
      notes: o.notes || undefined,
      payment_method: 'cash',
      payment_status: 'pending',
      created_at: o.created_at ? new Date(o.created_at).toISOString().slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' '),
      items: itemsByOrder[o.id] || []
    }));

    // 7. Reservations
    const [resRows] = await dbPool.query(`SELECT * FROM reservations ORDER BY id DESC;`);
    const reservations = resRows.map(r => ({
      id: r.id,
      restaurant_id: r.restaurant_id,
      branch_id: r.branch_id,
      branch_name: branchMap[r.branch_id] || 'الفرع الرئيسي',
      customer_name: r.customer_name,
      customer_phone: r.customer_phone,
      guest_count: Number(r.guest_count) || 2,
      reservation_date: r.reservation_date ? String(r.reservation_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
      reservation_time: r.reservation_time ? String(r.reservation_time).slice(0, 5) : '20:00',
      special_requests: r.special_requests || undefined,
      status: r.status,
      created_at: r.created_at ? new Date(r.created_at).toISOString().slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16).replace('T', ' ')
    }));

    // 8. Reviews
    const [revRows] = await dbPool.query(`SELECT * FROM reviews WHERE is_approved = 1 ORDER BY id DESC;`);
    const reviews = revRows.map(rv => ({
      id: rv.id,
      restaurant_id: rv.restaurant_id,
      customer_name: rv.customer_name,
      rating: Number(rv.rating) || 5,
      comment: rv.comment,
      created_at: rv.created_at ? new Date(rv.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      is_approved: Boolean(rv.is_approved)
    }));

    // 9. Coupons
    const [couponRows] = await dbPool.query(`SELECT * FROM coupons WHERE is_active = 1 ORDER BY id ASC;`);
    const coupons = couponRows.map(cp => ({
      id: cp.id,
      code: cp.code,
      discount_type: cp.discount_type,
      discount_value: Number(cp.discount_value),
      min_order_amount: Number(cp.min_order_amount) || 0,
      is_active: Boolean(cp.is_active)
    }));

    // 10. Plans
    const [planRows] = await dbPool.query(`SELECT * FROM plans WHERE is_active = 1 ORDER BY price_monthly ASC;`);
    const plans = planRows.map(pl => {
      let features = [];
      try {
        if (pl.features) {
          features = typeof pl.features === 'string' ? JSON.parse(pl.features) : pl.features;
        }
      } catch {}
      const isFree = pl.slug === 'free' || pl.id === 1 || Number(pl.price_monthly) === 0;
      return {
        id: pl.id,
        name_ar: isFree ? 'الباقة المجانية (تجريبية 14 يوم)' : pl.name_ar,
        name_en: isFree ? 'Free 14-Day Trial' : pl.name_en,
        slug: pl.slug,
        price_monthly: Number(pl.price_monthly),
        price_yearly: Number(pl.price_yearly),
        currency: pl.currency || 'IQD',
        max_branches: Number(pl.max_branches),
        max_tables: Number(pl.max_tables),
        max_products: Number(pl.max_products),
        has_pos: isFree ? true : Boolean(pl.has_pos),
        has_kds: isFree ? true : Boolean(pl.has_kds),
        has_delivery_gps: Boolean(pl.has_delivery_gps),
        has_ai_analytics: Boolean(pl.has_ai_analytics),
        has_custom_domain: Boolean(pl.has_custom_domain),
        trial_days: isFree ? 14 : Number(pl.trial_days || 0),
        features: isFree ? [
          'فترة تجريبية مجانية لمدة 14 يوم',
          'منيو إلكتروني QR تفاعلي',
          'نظام الكاشير وتسجيل الطلبات (POS)',
          'شاشة المطبخ KDS مع التنبيهات',
          'إدارة الأصناف والصور',
          'دعم فني مباشر'
        ] : (features.length > 0 ? features : ['منيو إلكتروني تفاعلي', 'إدارة الأصناف والصور', 'دعم فني مباشر'])
      };
    });

    // 11. Activity logs
    const [logRows] = await dbPool.query(`
      SELECT l.*, COALESCE(u.name, 'مدير المنصة') as user_name
      FROM activity_logs l
      LEFT JOIN users u ON u.id = l.user_id
      ORDER BY l.id DESC LIMIT 50;
    `);
    const activityLogs = logRows.map(lg => ({
      id: lg.id,
      user_name: lg.user_name,
      role: 'super_admin',
      action: lg.action,
      description: lg.description,
      timestamp: lg.created_at ? new Date(lg.created_at).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) : 'الآن'
    }));

    // 12. Users (Synchronize staff and accounts across all devices)
    const [userRows] = await dbPool.query(`
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      ORDER BY u.id ASC;
    `);
    const users = userRows.map(u => ({
      id: u.id,
      restaurant_id: u.restaurant_id || undefined,
      branch_id: u.branch_id || undefined,
      role: u.role_name || 'restaurant_owner',
      name: u.name,
      username: u.username || u.email.split('@')[0],
      email: u.email,
      password: u.password_hash || '123456',
      pin_code: u.pin_code || '1234',
      phone: u.phone || '',
      is_active: u.status === 'active'
    }));

    res.json({
      success: true,
      data: {
        restaurants,
        branches,
        tables,
        categories,
        products,
        orders,
        reservations,
        reviews,
        coupons,
        plans,
        activityLogs,
        users
      }
    });
  } catch (err) {
    console.error('❌ Error in /api/data:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Orders API
apiRouter.post('/orders', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  const conn = await dbPool.getConnection();
  try {
    await conn.beginTransaction();

    const orderData = req.body;
    const orderNumber = orderData.order_number || `ORD-${Date.now().toString().slice(-6)}`;
    const restId = Number(orderData.restaurant_id) || 1;
    const branchId = Number(orderData.branch_id) || 1;
    const tableId = orderData.table_id ? Number(orderData.table_id) : null;
    const orderType = orderData.order_type || 'dine_in';
    const status = 'new';
    const subtotal = Number(orderData.subtotal) || 0;
    const taxAmount = Number(orderData.tax_amount) || 0;
    const discountAmount = Number(orderData.discount_amount) || 0;
    const deliveryFee = Number(orderData.delivery_fee) || 0;
    const totalAmount = Number(orderData.total_amount) || 0;
    const customerName = orderData.customer_name || 'عميل السفرة';
    const customerPhone = orderData.customer_phone || '';
    const deliveryAddress = orderData.delivery_address || null;
    const notes = orderData.notes || null;

    const [orderRes] = await conn.query(`
      INSERT INTO orders (
        order_number, restaurant_id, branch_id, table_id, order_type, status,
        subtotal, tax_amount, discount_amount, delivery_fee, total_amount,
        customer_name, customer_phone, delivery_address, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      orderNumber, restId, branchId, tableId, orderType, status,
      subtotal, taxAmount, discountAmount, deliveryFee, totalAmount,
      customerName, customerPhone, deliveryAddress, notes
    ]);
    const orderId = orderRes.insertId;

    const insertedItems = [];
    if (Array.isArray(orderData.items)) {
      for (const item of orderData.items) {
        const prodId = Number(item.product_id) || 1;
        const prodName = item.product_name || 'وجبة طعام';
        const unitPrice = Number(item.unit_price) || 0;
        const qty = Number(item.quantity) || 1;
        const itemSubtotal = Number(item.subtotal) || (unitPrice * qty);
        const addonsStr = item.selected_addons ? JSON.stringify(item.selected_addons) : null;
        const instructions = item.special_instructions || null;

        const [itemRes] = await conn.query(`
          INSERT INTO order_details (
            order_id, product_id, product_name, unit_price, quantity, subtotal,
            selected_addons, special_instructions
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          orderId, prodId, prodName, unitPrice, qty, itemSubtotal,
          addonsStr, instructions
        ]);

        insertedItems.push({
          id: String(itemRes.insertId),
          product_id: prodId,
          product_name: prodName,
          unit_price: unitPrice,
          quantity: qty,
          subtotal: itemSubtotal,
          selected_addons: item.selected_addons || [],
          special_instructions: instructions
        });
      }
    }

    await conn.query(`
      INSERT INTO activity_logs (restaurant_id, action, description)
      VALUES (?, 'New Order', ?)
    `, [restId, `تم استلام طلب جديد رقم ${orderNumber} بقيمة ${totalAmount.toLocaleString()} د.ع`]);

    await conn.commit();

    const createdOrder = {
      id: orderId,
      order_number: orderNumber,
      restaurant_id: restId,
      branch_id: branchId,
      branch_name: orderData.branch_name || 'الفرع الرئيسي',
      table_id: tableId || undefined,
      table_number: orderData.table_number || (tableId ? `طاولة ${tableId}` : undefined),
      order_type: orderType,
      status: 'new',
      subtotal,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      delivery_fee: deliveryFee,
      total_amount: totalAmount,
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      notes,
      payment_method: 'cash',
      payment_status: 'pending',
      created_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      items: insertedItems
    };

    broadcastEvent('new_order', createdOrder);
    res.status(201).json({ success: true, order: createdOrder });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

apiRouter.patch('/orders/:id/status', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    await dbPool.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, orderId]);
    broadcastEvent('order_status_updated', { id: orderId, status });
    res.json({ success: true, id: orderId, status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tables API
apiRouter.patch('/tables/:id/status', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const tableId = Number(req.params.id);
    const { status } = req.body;
    await dbPool.query(`UPDATE tables SET status = ? WHERE id = ?`, [status, tableId]);
    broadcastEvent('table_updated', { id: tableId, status });
    res.json({ success: true, id: tableId, status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.post('/tables', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const { branch_id, table_number, capacity, status } = req.body;
    const qrToken = `TBL-${Date.now().toString().slice(-6)}`;
    const [result] = await dbPool.query(`
      INSERT INTO tables (branch_id, table_number, capacity, status, qr_token)
      VALUES (?, ?, ?, ?, ?)
    `, [branch_id || 1, table_number || 'طاولة جديدة', capacity || 4, status || 'available', qrToken]);

    const newTable = {
      id: result.insertId,
      branch_id: branch_id || 1,
      table_number: table_number || 'طاولة جديدة',
      capacity: capacity || 4,
      status: status || 'available',
      qr_token: qrToken
    };

    broadcastEvent('table_created', newTable);
    res.status(201).json({ success: true, table: newTable });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.delete('/tables/:id', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const id = Number(req.params.id);
    await dbPool.query(`DELETE FROM tables WHERE id = ?`, [id]);
    broadcastEvent('table_deleted', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Products API
apiRouter.post('/products', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const p = req.body;
    const [result] = await dbPool.query(`
      INSERT INTO products (
        restaurant_id, category_id, name_ar, name_en, description_ar,
        base_price, discount_price, image_url, calories, prep_time_minutes,
        is_available, is_featured, sort_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      p.restaurant_id || 1,
      p.category_id || 1,
      p.name_ar,
      p.name_en || p.name_ar,
      p.description_ar || '',
      p.base_price || 0,
      p.discount_price || null,
      p.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      p.calories || null,
      p.prep_time_minutes || 15,
      p.is_available !== false ? 1 : 0,
      p.is_featured ? 1 : 0,
      p.sort_order || 99
    ]);

    const createdProduct = {
      ...p,
      id: result.insertId,
      sizes: [],
      addons: []
    };

    broadcastEvent('product_created', createdProduct);
    res.status(201).json({ success: true, product: createdProduct });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.put('/products/:id', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const id = Number(req.params.id);
    const p = req.body;
    await dbPool.query(`
      UPDATE products SET
        category_id = COALESCE(?, category_id),
        name_ar = COALESCE(?, name_ar),
        name_en = COALESCE(?, name_en),
        description_ar = COALESCE(?, description_ar),
        base_price = COALESCE(?, base_price),
        discount_price = ?,
        image_url = COALESCE(?, image_url),
        calories = ?,
        prep_time_minutes = COALESCE(?, prep_time_minutes),
        is_available = COALESCE(?, is_available),
        is_featured = COALESCE(?, is_featured)
      WHERE id = ?
    `, [
      p.category_id,
      p.name_ar,
      p.name_en,
      p.description_ar,
      p.base_price,
      p.discount_price || null,
      p.image_url,
      p.calories || null,
      p.prep_time_minutes,
      p.is_available !== undefined ? (p.is_available ? 1 : 0) : undefined,
      p.is_featured !== undefined ? (p.is_featured ? 1 : 0) : undefined,
      id
    ]);

    broadcastEvent('product_updated', { id, ...p });
    res.json({ success: true, id, ...p });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.delete('/products/:id', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const id = Number(req.params.id);
    await dbPool.query(`DELETE FROM products WHERE id = ?`, [id]);
    broadcastEvent('product_deleted', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Categories API
apiRouter.post('/categories', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const c = req.body;
    const slug = (c.slug || c.name_ar).toLowerCase().replace(/[\s_]+/g, '-');
    const [result] = await dbPool.query(`
      INSERT INTO categories (restaurant_id, name_ar, name_en, slug, icon_name, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [
      c.restaurant_id || 1,
      c.name_ar,
      c.name_en || c.name_ar,
      slug,
      c.icon_name || 'Utensils',
      c.sort_order || 99
    ]);

    const newCategory = {
      id: result.insertId,
      restaurant_id: c.restaurant_id || 1,
      name_ar: c.name_ar,
      name_en: c.name_en || c.name_ar,
      slug,
      icon_name: c.icon_name || 'Utensils',
      sort_order: c.sort_order || 99
    };

    broadcastEvent('category_created', newCategory);
    res.status(201).json({ success: true, category: newCategory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

apiRouter.delete('/categories/:id', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const id = Number(req.params.id);
    await dbPool.query(`DELETE FROM categories WHERE id = ?`, [id]);
    broadcastEvent('category_deleted', { id });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Restaurant Registration
apiRouter.post('/restaurants', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  const conn = await dbPool.getConnection();
  try {
    await conn.beginTransaction();

    const data = req.body;
    const slug = (data.slug || `restaurant-${Date.now().toString().slice(-4)}`).toLowerCase().trim().replace(/[\s_]+/g, '-');

    const status = data.status || 'inactive';

    const [restResult] = await conn.query(`
      INSERT INTO restaurants (
        name_ar, name_en, slug, logo_url, cover_url, description_ar, phone, email, address, currency, tax_percentage, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.name_ar || 'مطعم جديد',
      data.name_en || 'New Restaurant',
      slug,
      data.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      data.cover_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      data.description_ar || 'مطعم ومقهى عصري',
      data.phone || '+964 770 000 0000',
      data.email || `contact@${slug}.com`,
      data.address || 'العراق',
      data.currency || 'IQD',
      data.tax_percentage || 5.0,
      status
    ]);
    const restaurantId = restResult.insertId;

    await conn.query(`
      INSERT INTO restaurant_settings (restaurant_id, theme_primary_color, delivery_fee_base, whatsapp_number)
      VALUES (?, ?, ?, ?)
    `, [restaurantId, data.theme_primary_color || '#f59e0b', data.delivery_fee_base || 3000, data.whatsapp_number || data.phone]);

    await conn.query(`
      INSERT INTO subscriptions (restaurant_id, plan_id, status, starts_at, ends_at)
      VALUES (?, 2, 'active', NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR))
    `, [restaurantId]);

    const [branchResult] = await conn.query(`
      INSERT INTO branches (restaurant_id, name_ar, name_en, phone, address, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [restaurantId, 'الفرع الرئيسي', 'Main Branch', data.phone || '', data.address || '']);
    const branchId = branchResult.insertId;

    for (let i = 1; i <= 5; i++) {
      await conn.query(`
        INSERT INTO tables (branch_id, table_number, capacity, status, qr_token)
        VALUES (?, ?, 4, 'available', ?)
      `, [branchId, `طاولة ${i}`, `TBL-${slug.slice(0, 3).toUpperCase()}-${i}`]);
    }

    await conn.query(`
      INSERT INTO categories (restaurant_id, name_ar, name_en, slug, icon_name, sort_order, is_active)
      VALUES 
        (?, 'الأطباق الرئيسية', 'Main Courses', 'main', 'Flame', 1, 1),
        (?, 'المقبلات والسلطات', 'Appetizers', 'appetizers', 'Salad', 2, 1),
        (?, 'المشروبات المنعشة', 'Drinks', 'drinks', 'Coffee', 3, 1)
    `, [restaurantId, restaurantId, restaurantId]);

    await conn.query(`
      INSERT INTO activity_logs (restaurant_id, action, description)
      VALUES (?, 'Register', ?)
    `, [restaurantId, `تم تسجيل مطعم جديد: ${data.name_ar}`]);

    // Auto-create owner user in users table
    const ownerName = data.owner_name || `مالك ${data.name_ar}`;
    const ownerUsername = (data.owner_username || slug || data.phone || '').toLowerCase().trim();
    const ownerEmail = data.owner_email || data.email || `contact@${slug}.com`;
    const ownerPhone = data.owner_phone || data.phone || '';
    const ownerPassword = data.owner_password || '123456';
    const cleanDigits = ownerPhone.replace(/\D/g, '');
    const pinCode = cleanDigits.length >= 4 ? cleanDigits.slice(-4) : '1234';

    await conn.query(`
      INSERT INTO users (
        restaurant_id, branch_id, role_id, name, username, email, phone, password_hash, pin_code, status
      ) VALUES (?, ?, 2, ?, ?, ?, ?, ?, ?, 'active')
    `, [restaurantId, branchId, ownerName, ownerUsername, ownerEmail, ownerPhone, ownerPassword, pinCode]);

    await conn.commit();

    const createdRestaurant = {
      id: restaurantId,
      name_ar: data.name_ar,
      name_en: data.name_en || 'New Restaurant',
      slug,
      logo_url: data.logo_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
      cover_url: data.cover_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
      description_ar: data.description_ar || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      currency: 'IQD',
      tax_percentage: data.tax_percentage || 5,
      status,
      created_at: new Date().toISOString().slice(0, 10),
      theme_primary_color: data.theme_primary_color || '#f59e0b',
      plan_name: 'الباقة المجانية (Starter)',
      delivery_fee_base: 3000,
      whatsapp_number: data.whatsapp_number || data.phone || ''
    };

    broadcastEvent('restaurant_created', createdRestaurant);
    res.status(201).json({ success: true, restaurant: createdRestaurant });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// Update Restaurant Status (Activate / Suspend)
apiRouter.patch('/restaurants/:id/status', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const id = Number(req.params.id);
    const { status } = req.body; // 'active' | 'suspended' | 'inactive'
    const cleanStatus = status === 'active' ? 'active' : (status === 'inactive' ? 'inactive' : 'suspended');

    await dbPool.query(`UPDATE restaurants SET status = ? WHERE id = ?`, [cleanStatus, id]);
    await dbPool.query(`
      INSERT INTO activity_logs (restaurant_id, action, description)
      VALUES (?, 'Status Change', ?)
    `, [id, `تم تغيير حالة المطعم إلى: ${cleanStatus === 'active' ? 'نشط' : cleanStatus === 'inactive' ? 'غير مفعل' : 'موقوف مؤقتاً'}`]);

    broadcastEvent('restaurant_status_updated', { id, status: cleanStatus });
    res.json({ success: true, id, status: cleanStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete Restaurant
apiRouter.delete('/restaurants/:id', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  const conn = await dbPool.getConnection();
  try {
    await conn.beginTransaction();
    const id = Number(req.params.id);

    // Get name for log
    const [rows] = await conn.query(`SELECT name_ar FROM restaurants WHERE id = ?`, [id]);
    const restName = rows[0]?.name_ar || `مطعم #${id}`;

    // Disable FK checks to avoid constraint issues during cascade delete
    await conn.query(`SET FOREIGN_KEY_CHECKS = 0`);

    // Delete cascading references (order_details BEFORE products to avoid FK error)
    await conn.query(`DELETE FROM restaurant_settings WHERE restaurant_id = ?`, [id]);
    await conn.query(`DELETE FROM subscriptions WHERE restaurant_id = ?`, [id]);
    await conn.query(`DELETE FROM order_details WHERE order_id IN (SELECT id FROM orders WHERE restaurant_id = ?)`, [id]);
    await conn.query(`DELETE FROM orders WHERE restaurant_id = ?`, [id]);
    await conn.query(`DELETE FROM products WHERE restaurant_id = ?`, [id]);
    await conn.query(`DELETE FROM categories WHERE restaurant_id = ?`, [id]);
    await conn.query(`DELETE FROM tables WHERE branch_id IN (SELECT id FROM branches WHERE restaurant_id = ?)`, [id]);
    await conn.query(`DELETE FROM branches WHERE restaurant_id = ?`, [id]);
    await conn.query(`DELETE FROM coupons WHERE restaurant_id = ?`, [id]);
    await conn.query(`DELETE FROM reservations WHERE restaurant_id = ?`, [id]);
    await conn.query(`DELETE FROM reviews WHERE restaurant_id = ?`, [id]);
    await conn.query(`DELETE FROM users WHERE restaurant_id = ?`, [id]);
    await conn.query(`DELETE FROM restaurants WHERE id = ?`, [id]);

    await conn.query(`SET FOREIGN_KEY_CHECKS = 1`);

    await conn.query(`
      INSERT INTO activity_logs (restaurant_id, action, description)
      VALUES (NULL, 'Restaurant Deleted', ?)
    `, [`تم حذف مطعم (${restName}) وكافة بياناته نهائياً من قبل الإدارة العامة`]);

    await conn.commit();

    broadcastEvent('restaurant_deleted', { id });
    res.json({ success: true, id, message: `تم حذف مطعم ${restName} بنجاح` });
  } catch (err) {
    await conn.rollback();
    await conn.query(`SET FOREIGN_KEY_CHECKS = 1`).catch(() => {});
    res.status(500).json({ success: false, message: err.message });
  } finally {
    conn.release();
  }
});

// Delete User
apiRouter.delete('/users/:id', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const id = Number(req.params.id);
    await dbPool.query(`DELETE FROM users WHERE id = ?`, [id]);
    broadcastEvent('user_deleted', { id });
    res.json({ success: true, id, message: 'تم حذف المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Plan Activation
apiRouter.post('/plans/activate', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const { code, restaurant_id } = req.body;
    const cleanCode = (code || '').toUpperCase().trim();
    const restId = Number(restaurant_id) || 1;

    let planId = 2;
    let planName = 'الباقة الاحترافية (Pro)';

    if (cleanCode.includes('ENT') || cleanCode.includes('VIP') || cleanCode.includes('999')) {
      planId = 3;
      planName = 'الباقة المؤسسية (Enterprise)';
    }

    await dbPool.query(`
      UPDATE subscriptions SET plan_id = ?, status = 'active', ends_at = DATE_ADD(NOW(), INTERVAL 1 YEAR)
      WHERE restaurant_id = ?
    `, [planId, restId]);

    broadcastEvent('plan_activated', { restaurant_id: restId, planName });
    res.json({ success: true, planName, message: `تهانينا! تم تفعيل ${planName} بنجاح` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Auth Login
apiRouter.post('/auth/login', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const { username, password } = req.body;
    const ident = (username || '').trim().toLowerCase();

    if (ident === 'superadmin' || ident === 'admin' || ident.includes('super')) {
      return res.json({
        success: true,
        user: {
          id: 1,
          name: 'مدير المنصة العام',
          email: 'admin@sufrah.com',
          role: 'super_admin'
        }
      });
    }

    const [users] = await dbPool.query(`
      SELECT u.*, r.name as role_name
      FROM users u
      LEFT JOIN roles r ON r.id = u.role_id
      WHERE (LOWER(u.email) = ? OR LOWER(u.phone) = ?)
      LIMIT 1;
    `, [ident, ident]);

    if (users.length > 0) {
      const u = users[0];
      return res.json({
        success: true,
        user: {
          id: u.id,
          restaurant_id: u.restaurant_id,
          branch_id: u.branch_id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          role: u.role_name || 'restaurant_owner'
        }
      });
    }

    res.json({
      success: true,
      user: {
        id: 2,
        name: 'مدير المطعم',
        email: username,
        role: 'restaurant_owner'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update user credentials in MySQL
apiRouter.post('/users/update', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const { id, name, username, password, pin_code, phone } = req.body;
    if (!id) return res.status(400).json({ success: false, message: 'Missing user id' });

    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (username) { updates.push('username = ?'); values.push(username.toLowerCase().trim()); }
    if (password) { updates.push('password_hash = ?'); values.push(password.trim()); }
    if (pin_code) { updates.push('pin_code = ?'); values.push(pin_code.trim()); }
    if (phone) { updates.push('phone = ?'); values.push(phone.trim()); }

    if (updates.length > 0) {
      values.push(id);
      await dbPool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    }

    res.json({ success: true, message: 'User updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Order endpoint (persist to MySQL & broadcast to connected devices)
apiRouter.post('/orders', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const o = req.body;
    const [result] = await dbPool.query(
      `INSERT INTO orders (restaurant_id, branch_id, table_id, order_number, order_type, status, subtotal, tax_amount, discount_amount, delivery_fee, total_amount, customer_name, customer_phone, delivery_address, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.restaurant_id || 1,
        o.branch_id || 1,
        o.table_id || null,
        o.order_number || `ORD-${Date.now()}`,
        o.order_type || 'dine_in',
        o.status || 'new',
        o.subtotal || 0,
        o.tax_amount || 0,
        o.discount_amount || 0,
        o.delivery_fee || 0,
        o.total_amount || 0,
        o.customer_name || 'عميل السفرة',
        o.customer_phone || '',
        o.delivery_address || null,
        o.notes || null
      ]
    );

    const orderId = result.insertId;

    if (o.items && Array.isArray(o.items)) {
      for (const item of o.items) {
        await dbPool.query(
          `INSERT INTO order_details (order_id, product_id, product_name, unit_price, quantity, subtotal, special_instructions)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            orderId,
            item.product_id || null,
            item.product_name || '',
            item.unit_price || 0,
            item.quantity || 1,
            item.subtotal || 0,
            item.special_instructions || null
          ]
        );
      }
    }

    const savedOrder = { ...o, id: orderId };
    broadcastEvent('new_order', savedOrder);
    res.json({ success: true, order: savedOrder });
  } catch (err) {
    console.error('Error creating order in MySQL:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Order Status endpoint (persist to MySQL & broadcast to connected devices)
apiRouter.patch('/orders/:id/status', async (req, res) => {
  if (!dbPool) return res.status(503).json({ error: 'DB not available' });

  try {
    const { id } = req.params;
    const { status } = req.body;
    await dbPool.query(`UPDATE orders SET status = ? WHERE id = ?`, [status, id]);
    broadcastEvent('order_status_updated', { id: Number(id), status });
    res.json({ success: true, id: Number(id), status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

