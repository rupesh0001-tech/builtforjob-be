import { Router } from "express";
import { authenticateJWT } from "../../middlewares/auth/jwt.middleware";
import { validate } from "../../middlewares/validation/validator.middleware";
import { createCoverLetter } from "../../controllers/cover-letter/create-cover-letter.controller";
import { getAllCoverLetters } from "../../controllers/cover-letter/get-all-cover-letters.controller";
import { getCoverLetterById } from "../../controllers/cover-letter/get-cover-letter-by-id.controller";
import { updateCoverLetter } from "../../controllers/cover-letter/update-cover-letter.controller";
import { deleteCoverLetter } from "../../controllers/cover-letter/delete-cover-letter.controller";
import { createCoverLetterSchema, updateCoverLetterSchema } from "../../validators/cover-letter.validator";

const router = Router();

router.use(authenticateJWT);

router.post("/", validate(createCoverLetterSchema), createCoverLetter);
router.get("/", getAllCoverLetters);
router.get("/:id", getCoverLetterById);
router.put("/:id", validate(updateCoverLetterSchema), updateCoverLetter);
router.delete("/:id", deleteCoverLetter);

export default router;
