import { Router } from 'express';
import { authenticateAdmin } from '../../middlewares/auth/admin.middleware';
import {
  adminLogin,
  getStats,
  getUsers,
  createUser,
  updateUser,
  updateUserPlan,
  updateUserTokens,
  updateUserBan
} from '../../controllers/admin/admin.controller';

export const adminRouter = Router();

// Public admin login
adminRouter.post('/login', adminLogin);

// Protected admin operations
adminRouter.use(authenticateAdmin);

adminRouter.get('/stats', getStats);
adminRouter.get('/users', getUsers);
adminRouter.post('/users', createUser);
adminRouter.put('/users/:id', updateUser);
adminRouter.put('/users/:id/plan', updateUserPlan);
adminRouter.put('/users/:id/tokens', updateUserTokens);
adminRouter.put('/users/:id/ban', updateUserBan);
