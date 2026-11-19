import { Router } from 'express';
import { mesaController } from '../controllers/mesaController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { adminOnly, staffOnly } from '../middlewares/roleMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/', staffOnly, asyncHandler(mesaController.listar));
router.post('/', adminOnly, asyncHandler(mesaController.criar));
router.put('/:id', adminOnly, asyncHandler(mesaController.atualizar));
router.delete('/:id', adminOnly, asyncHandler(mesaController.excluir));

export default router;
