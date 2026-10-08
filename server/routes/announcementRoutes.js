import express from "express";
import * as announcementController from "../controllers/announcementController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import {
    validateAnnouncementCreate,
    validateAnnouncementUpdate
} from "../validators/announcementValidators.js";

const router = express.Router();

router.use(authenticate);

router.post("/", authorize("ADMIN", "FACULTY"), validateAnnouncementCreate, announcementController.create);
router.get("/", announcementController.getAll);
router.get("/:id", announcementController.getById);
router.patch("/:id", authorize("ADMIN", "FACULTY"), validateAnnouncementUpdate, announcementController.update);
router.delete("/:id", authorize("ADMIN", "FACULTY"), announcementController.remove);

export default router;
