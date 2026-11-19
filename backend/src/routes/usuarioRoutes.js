import { Router } from 'express';
import { usuarioController } from '../controllers/usuarioController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { isAdmin } from '../middlewares/roleMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// RBAC na borda: sem JWT válido -> 401; com perfil diferente de admin -> 403.
router.use(authenticate, isAdmin);

router.get('/', asyncHandler(usuarioController.listar));
router.post('/', asyncHandler(usuarioController.criar));

export default router;
