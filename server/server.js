import dotenv from "dotenv";
import app from "./app.js";
import connectToMongoDB, { disconnectFromMongoDB } from "./config/db.js";

dotenv.config();

let server = null;

const startServer = async () => {
    try {
        await connectToMongoDB();

        const PORT = process.env.PORT || 5000;
        server = app.listen(PORT, () => {
            console.log(`CampusOS server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to start CampusOS:", error.message);
        process.exitCode = 1;
    }   
};

const handleShutdown = async (signal) => {
    console.log(`Received ${signal}. Shutting down CampusOS gracefully...`);
    if (server) {
        server.close(async () => {
            console.log("HTTP server closed.");
            await disconnectFromMongoDB();
            process.exit(0);
        });
    } else {
        await disconnectFromMongoDB();
        process.exit(0);
    }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));

startServer();

export { server };
