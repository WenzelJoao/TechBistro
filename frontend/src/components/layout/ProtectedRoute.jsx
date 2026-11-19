import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import LoadingScreen from '../ui/LoadingScreen.jsx';

export default function ProtectedRoute({ permissoes = [] }) {
  const { usuario, carregando, isAutenticado } = useAuth();
  const localizacao = useLocation();

  if (carregando) return <LoadingScreen mensagem="Verificando seu acesso..." />;
  if (!isAutenticado) {
    return <Navigate to="/login" replace state={{ origem: localizacao.pathname }} />;
  }
  if (permissoes.length && !permissoes.includes(usuario?.cargo)) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}
