import { Navigate } from 'react-router-dom';
import PageHeader from '../../components/admin/PageHeader.jsx';
import GerenciarUsuarios from '../../components/admin/GerenciarUsuarios.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';

/**
 * Página da aba "Equipe / Usuários".
 * A rota já é protegida por `ProtectedRoute permissoes={['admin']}`;
 * este redirect é uma segunda camada de RBAC no cliente.
 */
export default function AreaInterna() {
  const { isAdmin } = useAuth();
  if (!isAdmin) return <Navigate to="/admin" replace />;

  return (
    <>
      <PageHeader
        titulo="Equipe / Usuários"
        descricao="Gerencie quem acessa a área interna e o nível de permissão de cada membro. Cada criação é registrada na auditoria."
      />
      <GerenciarUsuarios />
    </>
  );
}
