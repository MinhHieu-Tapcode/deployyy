import * as mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const schemaFile = path.join(process.cwd(), 'schema.sql');
const dbFile = path.join(process.cwd(), 'database.json');

async function migrate() {
  console.log('=== STARTING MYSQL MIGRATION & IMPORT ===');
  
  // Connection details
  const host = process.env.DB_HOST || 'localhost';
  const port = Number(process.env.DB_PORT || 3306);
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const databaseName = process.env.DB_NAME || 'lau_nam_gia_khanh';

  console.log(`Connecting to MySQL Server at ${host}:${port} as user ${user}...`);
  let connection;
  try {
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });
  } catch (err: any) {
    console.error('Failed to connect to MySQL Server:', err.message);
    console.error('Please make sure MySQL is running and your credentials in .env are correct.');
    process.exit(1);
  }

  console.log(`Creating database \`${databaseName}\` if it doesn't exist...`);
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${databaseName}\``);

  console.log('Executing schema.sql to create tables...');
  if (!fs.existsSync(schemaFile)) {
    console.error(`Schema file not found at ${schemaFile}`);
    process.exit(1);
  }
  const schemaSql = fs.readFileSync(schemaFile, 'utf8');
  const statements = schemaSql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  for (const statement of statements) {
    if (statement.toLowerCase().startsWith('create database') || statement.toLowerCase().startsWith('use')) {
      continue;
    }
    try {
      // Extract table name from CREATE TABLE IF NOT EXISTS statement to drop it first
      const match = statement.match(/create table if not exists\s+`([^`]+)`/i);
      if (match && match[1]) {
        await connection.query(`DROP TABLE IF EXISTS \`${match[1]}\``);
      }
      await connection.query(statement);
    } catch (err: any) {
      console.error(`Error executing statement:\n${statement}\nError:`, err.message);
      process.exit(1);
    }
  }
  console.log('Tables created successfully.');

  if (!fs.existsSync(dbFile)) {
    console.log(`No database.json found at ${dbFile}. Skipping seed import.`);
    await connection.end();
    return;
  }

  console.log(`Reading seed data from ${dbFile}...`);
  const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));

  const tables = Object.keys(data);
  for (const table of tables) {
    const rows = data[table];
    if (!Array.isArray(rows) || rows.length === 0) {
      console.log(`Table \`${table}\` is empty or not an array. Skipping.`);
      continue;
    }

    console.log(`Importing ${rows.length} rows into \`${table}\`...`);
    
    await connection.query(`SET FOREIGN_KEY_CHECKS = 0`);
    await connection.query(`TRUNCATE TABLE \`${table}\``);
    await connection.query(`SET FOREIGN_KEY_CHECKS = 1`);

    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = Object.values(row);
      
      const placeholders = cols.map(() => '?').join(', ');
      const sql = `INSERT INTO \`${table}\` (${cols.map(c => `\`${c}\``).join(', ')}) VALUES (${placeholders})`;
      
      try {
        await connection.query(sql, vals);
      } catch (err: any) {
        console.error(`Failed to insert row into \`${table}\`:`, err.message);
        console.error('SQL:', sql);
        console.error('Values:', vals);
        process.exit(1);
      }
    }
  }

  console.log('=== MIGRATION & IMPORT COMPLETED SUCCESSFULLY ===');
  await connection.end();
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
