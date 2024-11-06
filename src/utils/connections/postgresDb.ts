import { Pool } from 'pg';
import 'dotenv/config';

export const sql = new Pool({
  connectionString: process.env.DATABASE_STRING,
});
