import express from "express";
import * as courseController from "../controllers/courseController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { validateCourseCreate, validateCourseUpdate } from "../validators/courseValidators.js";

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("ADMIN"), validateCourseCreate, courseController.create);
router.get("/", courseController.getAll);
router.get("/:id", courseController.getById);
router.patch("/:id", authorize("ADMIN", "FACULTY"), validateCourseUpdate, courseController.update);
router.delete("/:id", authorize("ADMIN"), courseController.remove);

router.post("/:id/enroll", authorize("STUDENT", "ADMIN"), courseController.enroll);
router.post("/:id/unenroll", authorize("STUDENT", "ADMIN"), courseController.unenroll);

export default router;
