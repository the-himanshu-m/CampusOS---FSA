import express from "express";
import * as userController from "../controllers/userController.js";
import authenticate from "../middleware/authMiddleware.js";
import authorize from "../middleware/authorize.js";
import { validateUserCreate, validateUserUpdate } from "../validators/userValidators.js";

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("ADMIN"), userController.getAll);
router.post("/", authorize("ADMIN"), validateUserCreate, userController.create);
router.get("/:id", userController.getById);
router.patch("/:id", validateUserUpdate, userController.update);
router.delete("/:id", authorize("ADMIN"), userController.remove);

export default router;
