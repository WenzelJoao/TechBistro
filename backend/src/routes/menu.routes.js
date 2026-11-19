import { Router } from 'express';
import { menuController } from '../controllers/menuController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/roleMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/admin', authenticate, adminOnly, asyncHandler(menuController.listarAdministrativo));
router.get('/', asyncHandler(menuController.listarPublico));
router.get('/:id', asyncHandler(menuController.buscarPorId));

router.post('/', authenticate, adminOnly, asyncHandler(menuController.criar));
router.put('/:id', authenticate, adminOnly, asyncHandler(menuController.atualizar));
router.delete('/:id', authenticate, adminOnly, asyncHandler(menuController.excluir));

export default router;
