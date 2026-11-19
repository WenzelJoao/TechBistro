import { Route, Routes } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout.jsx';
import PrivateLayout from './components/layout/PrivateLayout.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

import Home from './pages/public/Home.jsx';
import Cardapio from './pages/public/Cardapio.jsx';
import NovaReserva from './pages/public/NovaReserva.jsx';
import ConsultaReserva from './pages/public/ConsultaReserva.jsx';
import Login from './pages/public/Login.jsx';
import NotFound from './pages/public/NotFound.jsx';

import Dashboard from './pages/private/Dashboard.jsx';
import Agendamentos from './pages/private/Agendamentos.jsx';
import Comandas from './pages/private/Comandas.jsx';
import CardapioAdmin from './pages/private/CardapioAdmin.jsx';
import MesasAdmin from './pages/private/MesasAdmin.jsx';
import Auditoria from './pages/private/Auditoria.jsx';
import Configuracoes from './pages/private/Configuracoes.jsx';
import AreaInterna from './pages/private/AreaInterna.jsx';

export default function App() {
  return (
    <Routes>
      {/* Login tem layout próprio: sem navbar/rodapé/botão flutuante, ocupando a viewport. */}
      <Route path="login" element={<Login />} />

      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="cardapio" element={<Cardapio />} />
        <Route path="reservar" element={<NovaReserva />} />
        <Route path="consulta" element={<ConsultaReserva />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<PrivateLayout />}>
          <Route path="admin" element={<Dashboard />} />
          <Route path="admin/agendamentos" element={<Agendamentos />} />
          <Route path="admin/comandas" element={<Comandas />} />

          <Route element={<ProtectedRoute permissoes={['admin']} />}>
            <Route path="admin/usuarios" element={<AreaInterna />} />
            <Route path="admin/cardapio" element={<CardapioAdmin />} />
            <Route path="admin/mesas" element={<MesasAdmin />} />
            <Route path="admin/auditoria" element={<Auditoria />} />
            <Route path="admin/configuracoes" element={<Configuracoes />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}
