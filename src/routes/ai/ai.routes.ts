import { Router } from 'express';
import { generateAIContent } from '../../controllers/ai/generate.controller';
import { 
  generateJobDescription, 
  optimizeResume, 
  optimizeCoverLetter 
} from '../../controllers/ai/optimize.controller';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';
import { requirePro } from '../../middlewares/auth/plan.middleware';
import { aiRateLimiter } from '../../middlewares/rate-limit/rate-limiter';

const router = Router();

router.use(authenticateJWT);
router.use(aiRateLimiter);

router.post('/generate', generateAIContent);
router.post('/generate-jd', generateJobDescription);
router.post('/optimize-resume', requirePro, optimizeResume);
router.post('/optimize-cover-letter', requirePro, optimizeCoverLetter);

export { router as aiRouter };
