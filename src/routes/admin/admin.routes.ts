import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/auth/admin.middleware';
import { validate } from '../../middlewares/validation/validator.middleware';
import {
  adminLogin,
  getAdminMe,
  getStats,
  getUsers,
  createUser,
  updateUser,
  updateUserPlan,
  updateUserTokens,
  updateUserBan
} from '../../controllers/admin/admin.controller';
import {
  adminLoginSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminUpdatePlanSchema,
  adminUpdateTokensSchema,
  adminUpdateBanSchema,
} from '../../validators/admin.validator';
import { authRateLimiter } from '../../middlewares/rate-limit/rate-limiter';

export const adminRouter = Router();

// Public: admin login (rate limited + validated)
adminRouter.post('/login', authRateLimiter, validate(adminLoginSchema), adminLogin);

// Protected admin operations (cookie-based auth via httpOnly token)
adminRouter.use(authenticateAdmin);

// HIGH-02: Session restore endpoint — used instead of localStorage
adminRouter.get('/me', getAdminMe);

adminRouter.get('/stats', getStats);
adminRouter.get('/users', getUsers);
adminRouter.post('/users', validate(adminCreateUserSchema), createUser);
adminRouter.put('/users/:id', validate(adminUpdateUserSchema), updateUser);
adminRouter.put('/users/:id/plan', validate(adminUpdatePlanSchema), updateUserPlan);
adminRouter.put('/users/:id/tokens', validate(adminUpdateTokensSchema), updateUserTokens);
adminRouter.put('/users/:id/ban', validate(adminUpdateBanSchema), updateUserBan);
