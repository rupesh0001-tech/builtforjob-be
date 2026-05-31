import { Router } from "express";
import multer from "multer";
import { createVersion } from "../../controllers/versions/create-version.controller";
import { getVersions } from "../../controllers/versions/get-versions.controller";
import { deleteVersion } from "../../controllers/versions/delete-version.controller";
import { authenticateJWT } from "../../middlewares/auth/jwt.middleware";
import { validate } from "../../middlewares/validation/validator.middleware";
import { createApplicationVersionSchema } from "../../validators/versions.validator";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authenticateJWT);

router.post(
  "/",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
  ]),
  validate(createApplicationVersionSchema),
  createVersion
);

router.get("/", getVersions);
router.delete("/:id", deleteVersion);

export default router;
