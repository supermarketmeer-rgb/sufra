import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function deployDatabase() {
  const connectionUrl = process.argv[2] || process.env.MYSQL_PUBLIC_URL || process.env.DATABASE_URL;

  if (!connectionUrl) {
    console.error('❌ خطأ: يرجى تزويد رابط الاتصال بـ MySQL من Railway');
    console.error('الاستخدام:');
    console.error('node scripts/deploy-railway.js "mysql://root:password@host:port/railway"');
    process.exit(1);
  }

  const schemaPath = path.resolve(__dirname, '../backend-php-mvc/schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.error(`❌ لم يتم العثور على ملف السكيما في: ${schemaPath}`);
    process.exit(1);
  }

  console.log('🔄 جاري قراءة ملف schema.sql...');
  const sql = fs.readFileSync(schemaPath, 'utf8');

  console.log('🔌 جاري الاتصال بقاعدة بيانات Railway MySQL...');
  let connection;
  try {
    connection = await mysql.createConnection({
      uri: connectionUrl,
      multipleStatements: true,
      ssl: {
        rejectUnauthorized: false
      }
    });
    console.log('✅ تم الاتصال بنجاح بقاعدة البيانات!');

    console.log('🚀 جاري إنشاء الجداول وحقن البيانات الأولية (Roles, Plans, Settings)...');
    await connection.query(sql);
    console.log('🎉 تم تنفيذ كافة استعلامات schema.sql بنجاح!');

    const [tables] = await connection.query('SHOW TABLES;');
    const tableKey = Object.keys(tables[0] || {})[0];
    const tableNames = tables.map(t => t[tableKey]);

    console.log(`\n📋 إجمالي الجداول المنشأة: ${tableNames.length}`);
    tableNames.forEach((name, idx) => {
      console.log(`  ${idx + 1}. ${name}`);
    });

    console.log('\n✨ تم نشر وتجهيز قاعدة البيانات بالكامل على Railway بنجاح!');
  } catch (error) {
    console.error('❌ حدث خطأ أثناء الاتصال أو تنفيذ الاستعلامات:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

deployDatabase();
