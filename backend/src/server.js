import app from './app.js';
import { config } from './config/env.js';
import { testarConexao, fecharConexao } from './config/db.js';

const servidor = app.listen(config.port, async () => {
  console.log(`🚀 TechBistro API rodando em http://localhost:${config.port}`);
  try {
    await testarConexao();
    console.log('✅ Conexão com MySQL estabelecida.');
  } catch (error) {
    console.error('❌ Não foi possível conectar ao MySQL:', error.message);
    console.error('   Verifique o arquivo backend/.env e o schema.sql.');
  }
});

async function encerrar() {
  console.log('\nEncerrando TechBistro API...');
  servidor.close(async () => {
    await fecharConexao();
    process.exit(0);
  });
}

process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
