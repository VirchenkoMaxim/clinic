import { createConnection } from 'mysql2/promise';

export const conn = await createConnection({
  host: 'remotemysql.com',
  user: '57SrIgaoHb',
  password: 'aWU94eZVwq',
  database: '57SrIgaoHb',
});
