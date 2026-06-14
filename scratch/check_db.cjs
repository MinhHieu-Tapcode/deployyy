const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lau_nam_gia_khanh'
  });

  const [customers] = await connection.query('SELECT * FROM customers');
  console.log('Customers in MySQL:', customers);
  
  const [sessions] = await connection.query('SELECT * FROM table_sessions');
  console.log('Sessions in MySQL:', sessions);

  await connection.end();
}

run().catch(console.error);
