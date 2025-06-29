import mysql from 'mysql2/promise';

export const pool = mysql.createPool({
  host: 'localhost',
  user: 'web',
  password: 'raama',
  database: 'gadmin',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

