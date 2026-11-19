import { Router } from 'express';
import { reservaController } from '../controllers/reservaController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { adminOnly, staffOnly } from '../middlewares/roleMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// ---------------- Rotas públicas ----------------
router.get('/disponibilidade', asyncHandler(reservaController.disponibilidade));
router.get('/consulta', asyncHandler(reservaController.consultar));
router.post('/', asyncHandler(reservaController.criar));
router.patch('/:id/cancelar-publico', asyncHandler(reservaController.cancelarPublico));
router.patch('/:id/alterar-publico', asyncHandler(reservaController.alterarPublico));

// ---------------- Rotas internas (RBAC) ----------------
router.use(authenticate);
router.get('/', staffOnly, asyncHandler(reservaController.listar));
router.get('/:id', staffOnly, asyncHandler(reservaController.buscarPorId));
router.patch('/:id/confirmar', staffOnly, asyncHandler(reservaController.confirmar));
router.patch('/:id/cancelar', staffOnly, asyncHandler(reservaController.cancelar));
router.patch('/:id/mesa', adminOnly, asyncHandler(reservaController.alterarMesa));
router.delete('/:id', adminOnly, asyncHandler(reservaController.excluir));

export default router;
