import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config();

const connectionUrl = process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL;

async function run() {
  if (!connectionUrl) {
    console.log('No DB URL');
    return;
  }
  const conn = await mysql.createConnection({
    uri: connectionUrl,
    ssl: { rejectUnauthorized: false }
  });
  console.log('Connected to DB');
  const [res] = await conn.query(`
    UPDATE plans 
    SET has_pos = 1, 
        has_kds = 1, 
        name_ar = 'الباقة المجانية (تجريبية 14 يوم)', 
        name_en = 'Free 14-Day Trial' 
    WHERE slug = 'free' OR id = 1 OR price_monthly = 0;
  `);
  console.log('Updated plans rows:', res.affectedRows);
  await conn.end();
}

run().catch(console.error);
