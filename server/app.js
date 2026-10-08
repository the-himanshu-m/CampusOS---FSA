import express from "express";
import cors from "cors";
import helmet from "helmet";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import courseRouter from "./routes/courseRoutes.js";
import assignmentRouter from "./routes/assignmentRoutes.js";
import announcementRouter from "./routes/announcementRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";

import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());

const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
app.use(
    cors({
        origin: clientUrl === "*" ? "*" : [clientUrl, "http://localhost:3000"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json());

// Health Check
app.get("/api/health", (req, res) => {
    return res.status(200).json({
        status: "ok",
        message: "CampusOS API is operational",
        timestamp: new Date().toISOString()
    });
});

// Mount Resource Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/assignments", assignmentRouter);
app.use("/api/announcements", announcementRouter);
app.use("/api/dashboard", dashboardRouter);

// 404 handler for unrecognized routes
app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: `Endpoint ${req.method} ${req.originalUrl} not found`
    });
});

// Centralized error handler
app.use(errorHandler);

export default app;