import { Router } from "express";
import { authenticateJWT } from "../../middlewares/auth/jwt.middleware";
import { 
  getPortfolio, 
  savePortfolio, 
  getPortfolioResponses, 
  getPublicPortfolio, 
  createPortfolioResponse 
} from "../../controllers/portfolio/portfolio.controller";

const router = Router();

// Public routes (for visitors viewing public portfolios and submitting responses)
router.get("/public/:id", getPublicPortfolio);
router.post("/public/:id/respond", createPortfolioResponse);

// Protected routes (for active users setting up/viewing their own portfolios)
router.use(authenticateJWT);
router.get("/", getPortfolio);
router.post("/", savePortfolio);
router.get("/responses", getPortfolioResponses);

export default router;
