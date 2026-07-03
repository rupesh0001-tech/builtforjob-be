import { Router } from 'express';
import { authenticateJWT } from '../../middlewares/auth/jwt.middleware';
import { getCompanies, createCompany } from '../../controllers/companies/companies.controller';
import { publicRateLimiter } from '../../middlewares/rate-limit/rate-limiter';

const router = Router();

router.use(authenticateJWT);
router.use(publicRateLimiter);

router.get('/', getCompanies);
router.post('/', createCompany);

export { router as companiesRouter };
