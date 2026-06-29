import { Router } from 'express';
import { generateAIContent } from '../../controllers/ai/generate.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';

const router = Router();

router.post('/generate', authenticateJWT, generateAIContent);

export { router as aiRouter };
