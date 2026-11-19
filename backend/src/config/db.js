import mysql from 'mysql2/promise';
import { config } from './env.js';

let pool = null;

/** Pool único de conexões (lazy initialization). */
export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: config.database.host,
      port: config.database.port,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: false,
      charset: 'utf8mb4',
      timezone: 'local',
      // DATE/TIME/DATETIME voltam como strings ('YYYY-MM-DD', 'HH:mm:ss'),
      // evitando conversões de fuso horário entre API e frontend.
      dateStrings: true,
    });
  }
  return pool;
}

/** Executa uma query parametrizada usando o pool. */
export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

/** Executa um bloco dentro de uma transação, fazendo commit/rollback automaticamente. */
export async function withTransaction(callback) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function testarConexao() {
  const connection = await getPool().getConnection();
  try {
    await connection.ping();
    return true;
  } finally {
    connection.release();
  }
}

export async function fecharConexao() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
