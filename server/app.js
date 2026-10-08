import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRouter from "./routes/authRoutes.js";

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);

export default app;