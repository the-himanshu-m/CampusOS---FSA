import express from "express";
import * as assignmentController from "../controllers/assignmentController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import {
    validateAssignmentCreate,
    validateAssignmentUpdate,
    validateSubmission,
    validateGrade
} from "../validators/assignmentValidators.js";

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("ADMIN", "FACULTY"), validateAssignmentCreate, assignmentController.create);
router.get("/", assignmentController.getAll);
router.get("/:id", assignmentController.getById);
router.patch("/:id", authorize("ADMIN", "FACULTY"), validateAssignmentUpdate, assignmentController.update);
router.delete("/:id", authorize("ADMIN", "FACULTY"), assignmentController.remove);

router.post("/:id/submit", authorize("STUDENT"), validateSubmission, assignmentController.submit);
router.patch(
    "/:id/submissions/:submissionId/grade",
    authorize("ADMIN", "FACULTY"),
    validateGrade,
    assignmentController.grade
);

export default router;
