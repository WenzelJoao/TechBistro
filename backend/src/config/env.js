import dotenv from 'dotenv';

dotenv.config();

const environment = process.env.NODE_ENV || 'development';

export const config = {
  environment,
  port: Number(process.env.PORT || 3001),
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'senai',
    database: process.env.DB_NAME || 'techbistro',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'q0rhQWiRYPG11wBsngILbsvUc50zP9D4o1hg7PUtiVW',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
};

if (environment === 'production' && config.jwt.secret.length < 32) {
  throw new Error('JWT_SECRET deve ter ao menos 32 caracteres em produção.');
}
