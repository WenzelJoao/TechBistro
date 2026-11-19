-- ============================================================
-- TechBistro - Schema MySQL completo + seeds para testes
-- Execute: mysql -u root -p < backend/schema.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS techbistro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE techbistro;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS pedido_itens;
DROP TABLE IF EXISTS pedidos_comandas;
DROP TABLE IF EXISTS logs_auditoria;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS produtos;
DROP TABLE IF EXISTS mesas;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS horarios_funcionamento;
DROP TABLE IF EXISTS configuracoes;
DROP TABLE IF EXISTS usuarios;
SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- Usuários do sistema (admin | funcionario)
-- ------------------------------------------------------------
CREATE TABLE usuarios (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(120) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  senha_hash  VARCHAR(255) NOT NULL,
  cargo       ENUM('admin', 'funcionario') NOT NULL DEFAULT 'funcionario',
  criado_em   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Mesas do salão
-- ------------------------------------------------------------
CREATE TABLE mesas (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  numero_mesa  INT UNSIGNED NOT NULL UNIQUE,
  capacidade   INT UNSIGNED NOT NULL,
  status       ENUM('disponivel', 'ocupada', 'reservada') NOT NULL DEFAULT 'disponivel',
  CONSTRAINT chk_mesa_capacidade CHECK (capacidade BETWEEN 1 AND 20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Clientes (telefone único = WhatsApp usado no contato)
-- ------------------------------------------------------------
CREATE TABLE clientes (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome_completo VARCHAR(150) NOT NULL,
  telefone      VARCHAR(20) NOT NULL UNIQUE,
  cpf           VARCHAR(14) NULL UNIQUE,
  criado_em     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Reservas (bloqueio de 90 min por mesa configurável)
-- ------------------------------------------------------------
CREATE TABLE reservas (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  codigo_reserva  VARCHAR(24) NOT NULL UNIQUE,
  cliente_id      INT UNSIGNED NOT NULL,
  mesa_id         INT UNSIGNED NOT NULL,
  data_reserva    DATE NOT NULL,
  hora_inicio     TIME NOT NULL,
  hora_fim        TIME NOT NULL,
  qtd_pessoas     INT UNSIGNED NOT NULL,
  status          ENUM('em_analise', 'confirmado', 'cancelado', 'limite_atingido')
                    NOT NULL DEFAULT 'em_analise',
  observacoes     VARCHAR(300) NULL,
  criado_em       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_reserva_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reserva_mesa FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE RESTRICT,
  INDEX idx_reserva_data_hora (data_reserva, hora_inicio, hora_fim),
  INDEX idx_reserva_status (status),
  INDEX idx_reserva_codigo (codigo_reserva)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Cardápio (catálogo público informativo)
-- ------------------------------------------------------------
CREATE TABLE produtos (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nome         VARCHAR(150) NOT NULL,
  descricao    TEXT NOT NULL,
  categoria    ENUM('entradas', 'principais', 'sobremesas', 'bebidas', 'sugestao_chef') NOT NULL,
  preco        DECIMAL(10,2) NOT NULL,
  imagem_url   VARCHAR(500) NULL,
  tags         VARCHAR(255) NULL COMMENT 'Tags separadas por vírgula: Vegano, Sem Glúten...',
  ativo        BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_produto_categoria (categoria, ativo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Comandas internas (operação, sem pagamento online)
-- ------------------------------------------------------------
CREATE TABLE pedidos_comandas (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  mesa_id        INT UNSIGNED NOT NULL,
  funcionario_id INT UNSIGNED NOT NULL,
  status         ENUM('aberta', 'fechada') NOT NULL DEFAULT 'aberta',
  valor_total    DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  criado_em      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  fechado_em     TIMESTAMP NULL,
  CONSTRAINT fk_comanda_mesa FOREIGN KEY (mesa_id) REFERENCES mesas(id) ON DELETE RESTRICT,
  CONSTRAINT fk_comanda_funcionario FOREIGN KEY (funcionario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_comanda_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pedido_itens (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  pedido_id      INT UNSIGNED NOT NULL,
  produto_id     INT UNSIGNED NOT NULL,
  quantidade     INT UNSIGNED NOT NULL,
  preco_unitario DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_item_comanda FOREIGN KEY (pedido_id) REFERENCES pedidos_comandas(id) ON DELETE CASCADE,
  CONSTRAINT fk_item_produto FOREIGN KEY (produto_id) REFERENCES produtos(id) ON DELETE RESTRICT,
  CONSTRAINT chk_item_quantidade CHECK (quantidade > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Configuração de regras de negócio (editável pelo admin)
-- ------------------------------------------------------------
CREATE TABLE configuracoes (
  id                       TINYINT UNSIGNED PRIMARY KEY CHECK (id = 1),
  duracao_reserva_minutos  INT UNSIGNED NOT NULL DEFAULT 90,
  intervalo_minutos        INT UNSIGNED NOT NULL DEFAULT 30,
  cancelamento_horas       INT UNSIGNED NOT NULL DEFAULT 2,
  capacidade_por_horario   INT UNSIGNED NOT NULL DEFAULT 24,
  atualizado_em            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- dia_semana: 0=domingo, 1=segunda, ..., 6=sábado
CREATE TABLE horarios_funcionamento (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  dia_semana    TINYINT UNSIGNED NOT NULL,
  hora_abertura TIME NOT NULL,
  hora_fechamento TIME NOT NULL,
  ativo         BOOLEAN NOT NULL DEFAULT TRUE,
  CONSTRAINT uq_horario_dia UNIQUE (dia_semana)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- Log de auditoria (rastreabilidade de operações)
-- ------------------------------------------------------------
CREATE TABLE logs_auditoria (
  id          BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  usuario_id  INT UNSIGNED NULL,
  acao        VARCHAR(120) NOT NULL,
  referencia  VARCHAR(120) NOT NULL,
  detalhes    TEXT NULL,
  data_hora   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_log_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
  INDEX idx_log_data (data_hora)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEEDS
-- Senhas: admin@techbistro.com.br / Admin@123
--         funcio@techbistro.com.br / Func@123
-- (hashes bcrypt cost 10 gerados com bcrypt)
-- ============================================================

INSERT INTO usuarios (nome, email, senha_hash, cargo) VALUES
  ('Administrador TechBistro', 'admin@techbistro.com.br', '$2b$10$IDTO03U2IeGffZxLrt5bpenQlcb78kxOUvqSB8t8ybi0mmzmlCVIe', 'admin'),
  ('Marina Funcionária', 'funcio@techbistro.com.br', '$2b$10$dRQ2QhI/ofrhjvyxiIXSmOGHtQnpb2VGtzmLQ4O8okM7QdIvV7H5O', 'funcionario');

INSERT INTO mesas (numero_mesa, capacidade, status) VALUES
  (1, 2, 'disponivel'),
  (2, 2, 'disponivel'),
  (3, 2, 'disponivel'),
  (4, 4, 'disponivel'),
  (5, 4, 'disponivel'),
  (6, 4, 'disponivel'),
  (7, 6, 'disponivel'),
  (8, 8, 'disponivel');

INSERT INTO clientes (nome_completo, telefone, cpf) VALUES
  ('Ana Clara Souza',   '11988001111', '123.456.789-09'),
  ('Bruno Lima',        '11988002222', '987.654.321-00'),
  ('Carla Mendes',      '11988003333', '111.222.333-44'),
  ('Diego Ferreira',    '11988004444', '555.666.777-88'),
  ('Elisa Prado',       '11988005555', NULL);

INSERT INTO produtos (nome, descricao, categoria, preco, imagem_url, tags, ativo) VALUES
  ('Bruschetta da Casa', 'Pão artesanal tostado, tomate confitado, manjericão e azeite extra virgem.', 'entradas', 38.00,
   'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80', 'Vegetariano', TRUE),
  ('Carpaccio de Beterraba', 'Beterraba assada, queijo de cabra, nozes e redução de balsâmico.', 'entradas', 42.00,
   'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80', 'Vegano,Sem Glúten', TRUE),
  ('Risoto de Cogumelos', 'Arborio cremoso, mix de cogumelos frescos, parmesão e alecrim.', 'principais', 72.00,
   'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=800&q=80', 'Vegetariano,Sem Glúten', TRUE),
  ('Bife Ancho Grelhado', 'Corte maturado 21 dias, acompanhado de purê de mandioquinha e molho ao vinho.', 'principais', 98.00,
   'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80', 'Sem Glúten', TRUE),
  ('Bacalhau à Brás', 'Bacalhau desfiado, batata palha, cebola caramelizada e ovos caipiras.', 'principais', 89.00,
   'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80', '', TRUE),
  ('Petit Gâteau', 'Bolo de chocolate quente com recheio cremoso e sorvete de baunilha.', 'sobremesas', 36.00,
   'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', 'Vegetariano', TRUE),
  ('Cheesecake de Frutas Vermelhas', 'Base de biscoito amanteigado, creme de queijo e calda de frutas vermelhas.', 'sobremesas', 34.00,
   'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80', 'Vegetariano', TRUE),
  ('Água com Gás', 'Garrafa 500ml gelada.', 'bebidas', 12.00,
   'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80', 'Vegano,Sem Glúten', TRUE),
  ('Vinho Tinto Reserva', 'Taça 150ml - seleção da casa, corpo médio e notas de frutas vermelhas.', 'bebidas', 48.00,
   'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80', 'Vegano', TRUE),
  ('Menu Degustação do Chef', 'Sete etapas que contam a história do TechBistro: da entrada à sobremesa.', 'sugestao_chef', 168.00,
   'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', 'Sugestão do Chef', TRUE);

INSERT INTO reservas (codigo_reserva, cliente_id, mesa_id, data_reserva, hora_inicio, hora_fim, qtd_pessoas, status, observacoes) VALUES
  ('TB-DEMO-0001', 1, 4, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', '20:30:00', 4, 'confirmado', 'Aniversário'),
  ('TB-DEMO-0002', 2, 1, DATE_ADD(CURDATE(), INTERVAL 2 DAY), '19:00:00', '20:30:00', 2, 'em_analise', NULL),
  ('TB-DEMO-0003', 3, 6, DATE_ADD(CURDATE(), INTERVAL 3 DAY), '20:00:00', '21:30:00', 4, 'confirmado', NULL),
  ('TB-DEMO-0004', 4, 7, DATE_ADD(CURDATE(), INTERVAL 4 DAY), '19:30:00', '21:00:00', 6, 'confirmado', NULL),
  ('TB-DEMO-0005', 5, 2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '19:00:00', '20:30:00', 2, 'cancelado', 'Cancelado pelo cliente');

INSERT INTO pedidos_comandas (mesa_id, funcionario_id, status, valor_total) VALUES
  (4, 2, 'fechada', 184.00),
  (6, 2, 'aberta', 0.00);

INSERT INTO pedido_itens (pedido_id, produto_id, quantidade, preco_unitario) VALUES
  (1, 4, 2, 98.00),
  (1, 8, 2, 12.00),
  (2, 1, 1, 38.00);

INSERT INTO configuracoes (id, duracao_reserva_minutos, intervalo_minutos, cancelamento_horas, capacidade_por_horario) VALUES
  (1, 90, 30, 2, 24);

INSERT INTO horarios_funcionamento (dia_semana, hora_abertura, hora_fechamento, ativo) VALUES
  (0, '11:30:00', '15:00:00', TRUE),  -- domingo (almoço)
  (1, '18:00:00', '23:00:00', FALSE), -- segunda-feira fechada
  (2, '18:00:00', '23:00:00', TRUE),
  (3, '18:00:00', '23:00:00', TRUE),
  (4, '18:00:00', '23:00:00', TRUE),
  (5, '18:00:00', '23:00:00', TRUE),
  (6, '18:00:00', '23:00:00', TRUE);  -- sábado

INSERT INTO logs_auditoria (usuario_id, acao, referencia, detalhes) VALUES
  (1, 'Reserva confirmada', 'TB-DEMO-0001', 'Confirmação enviada via WhatsApp para 11988001111.'),
  (2, 'Comanda aberta', 'COM-0002', 'Comanda aberta para a mesa 06.'),
  (1, 'Configuração atualizada', 'SISTEMA', 'Prazo de cancelamento definido para 2 horas.');
