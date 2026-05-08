import { Router } from "express";
import multer from "multer";
import * as versionsController from "../../controllers/versions/versions.controller";
import { authenticateJWT } from "../../middlewares/auth/jwt.middleware";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// All routes require authentication
router.use(authenticateJWT);

router.post(
  "/",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
  ]),
  versionsController.handleCreateVersion
);

router.get("/", versionsController.handleGetVersions);
router.delete("/:id", versionsController.handleDeleteVersion);

export default router;
