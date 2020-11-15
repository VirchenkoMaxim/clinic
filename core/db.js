import { config } from 'dotenv';
config();
import { createConnection } from 'mysql2/promise';

const password = process.env.DB_PASSWORD;
const user = process.env.DB_USER;
const host = process.env.DB_HOST;
const database = process.env.DATABASE;

export const conn = await createConnection({
  host,
  user,
  password,
  database,
});
