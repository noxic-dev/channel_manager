import { Pool } from 'pg';

export const sql: Pool = new Pool({
  connectionString: process.env.DATABASE_STRING
});
