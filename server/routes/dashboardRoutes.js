import express from "express";
import * as dashboardController from "../controllers/dashboardController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";

const router = express.Router();

router.use(authenticate);

router.get("/student", authorize("STUDENT"), dashboardController.getStudent);
router.get("/faculty", authorize("FACULTY"), dashboardController.getFaculty);
router.get("/admin", authorize("ADMIN"), dashboardController.getAdmin);

export default router;
