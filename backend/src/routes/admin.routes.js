import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { adminOnly } from '../middlewares/roleMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.use(authenticate, adminOnly);

router.get('/dashboard', asyncHandler(adminController.resumo));
router.get('/logs', asyncHandler(adminController.logs));
router.get('/configuracoes', asyncHandler(adminController.regras));
router.put('/configuracoes', asyncHandler(adminController.atualizarRegras));
router.get('/usuarios', asyncHandler(adminController.usuarios));

export default router;
