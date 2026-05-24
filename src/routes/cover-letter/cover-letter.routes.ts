import { Router } from "express";
import { authenticateJWT } from "../../middlewares/auth/jwt.middleware";
import {
  handleCreateCoverLetter,
  handleGetAllCoverLetters,
  handleGetCoverLetterById,
  handleUpdateCoverLetter,
  handleDeleteCoverLetter
} from "../../controllers/cover-letter/cover-letter.controller";

const router = Router();

router.use(authenticateJWT);

router.post("/", handleCreateCoverLetter);
router.get("/", handleGetAllCoverLetters);
router.get("/:id", handleGetCoverLetterById);
router.put("/:id", handleUpdateCoverLetter);
router.delete("/:id", handleDeleteCoverLetter);

export default router;
