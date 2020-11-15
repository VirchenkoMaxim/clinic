import { createConnection } from 'mysql2/promise';
const host = 'remotemysql.com';
const user = '57SrIgaoHb';
const password = 'aWU94eZVwq';
const database = '57SrIgaoHb';
export const conn = await createConnection({
  host,
  user,
  password,
  database,
});
