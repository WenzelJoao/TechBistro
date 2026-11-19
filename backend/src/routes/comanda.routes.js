import { Router } from 'express';
import { comandaController } from '../controllers/comandaController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { adminOnly, staffOnly } from '../middlewares/roleMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate);
router.get('/', staffOnly, asyncHandler(comandaController.listar));
router.get('/:id', staffOnly, asyncHandler(comandaController.buscarPorId));
router.post('/', staffOnly, asyncHandler(comandaController.abrir));
router.post('/:id/itens', staffOnly, asyncHandler(comandaController.adicionarItem));
router.patch('/:id/fechar', staffOnly, asyncHandler(comandaController.fechar));
router.delete('/:id', adminOnly, asyncHandler(comandaController.excluir));

export default router;
