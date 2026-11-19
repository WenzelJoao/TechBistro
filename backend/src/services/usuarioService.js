import bcrypt from 'bcrypt';
import { withTransaction } from '../config/db.js';
import { AppError } from '../utils/AppError.js';
import { usuarioRepository } from '../repositories/usuarioRepository.js';
import { auditoriaService } from './auditoriaService.js';

const SALT_ROUNDS = 10;

/** Regras de negócio do cadastro de usuários (somente administradores). */
export const usuarioService = {
  listar() {
    return usuarioRepository.listar();
  },

  /**
   * Cria um usuário com senha criptografada e registra a auditoria
   * na MESMA transação: se qualquer passo falhar, nada é persistido.
   */
  async criar({ nome, email, senha, cargo, criadoPor }) {
    const emailNormalizado = String(email).trim().toLowerCase();
    const nomeNormalizado = String(nome).trim();

    return withTransaction(async (connection) => {
      const existente = await usuarioRepository.buscarPorEmail(emailNormalizado, connection);
      if (existente) {
        throw AppError.conflict(
          'Já existe um usuário cadastrado com este e-mail.',
          'EMAIL_JA_CADASTRADO',
        );
      }

      const senhaHash = await bcrypt.hash(String(senha), SALT_ROUNDS);

      const id = await usuarioRepository.criar(
        { nome: nomeNormalizado, email: emailNormalizado, senha_hash: senhaHash, cargo },
        connection,
      );

      await auditoriaService.registrar({
        usuarioId: criadoPor?.id ?? null,
        acao: 'Usuário criado',
        referencia: `usuario:${id}`,
        detalhes: JSON.stringify({
          nome: nomeNormalizado,
          email: emailNormalizado,
          cargo,
          criado_por: criadoPor?.nome ?? null,
          criado_por_id: criadoPor?.id ?? null,
        }),
        connection,
      });

      // Nunca devolver a coluna senha_hash: buscarPorId seleciona só dados públicos.
      return usuarioRepository.buscarPorId(id, connection);
    });
  },
};
