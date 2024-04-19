import { Pool, PoolConfig } from "pg";

let conn: Pool | null = null;

if (!conn) {
  const poolConfig: PoolConfig = {
    user: process.env.PGSQL_USER || '',
    password: process.env.PGSQL_PASSWORD || '',
    host: process.env.PGSQL_HOST || '',
    port: parseInt(process.env.PGSQL_PORT || '5432', 10),
    database: process.env.PGSQL_DATABASE || ''
  };

  conn = new Pool(poolConfig);
}

export default conn;
