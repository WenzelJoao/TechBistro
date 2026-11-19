import { Router } from 'express';
import authRoutes from './auth.routes.js';
import reservaRoutes from './reserva.routes.js';
import menuRoutes from './menu.routes.js';
import mesaRoutes from './mesa.routes.js';
import comandaRoutes from './comanda.routes.js';
import adminRoutes from './admin.routes.js';
import usuarioRoutes from './usuarioRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/reservas', reservaRoutes);
router.use('/menu', menuRoutes);
router.use('/mesas', mesaRoutes);
router.use('/comandas', comandaRoutes);
router.use('/admin', adminRoutes);
router.use('/usuarios', usuarioRoutes);

export default router;
