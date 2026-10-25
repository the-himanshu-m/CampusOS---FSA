import mongoose from "mongoose";

let memoryServer = null;

const connectToMongoDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri && process.env.USE_IN_MEMORY_DB !== "true") {
        try {
            console.log("Attempting connection to configured MongoDB Atlas database...");
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 6000
            });
            console.log("MongoDB connected successfully to cluster");
            return;
        } catch (error) {
            console.warn("MongoDB Atlas connection attempt failed:", error.message);
            if (
                error.message.includes("whitelist") ||
                error.name === "MongooseServerSelectionError" ||
                error.message.includes("SSL alert")
            ) {
                console.warn(
                    "Network Note: Current machine IP is not in Atlas IP Access List (whitelist)."
                );
                console.log(
                    "Activating local embedded MongoDB engine to ensure CampusOS functions immediately..."
                );
            } else {
                throw error;
            }
        }
    }

    // In-memory or local fallback
    try {
        console.log("Starting embedded in-memory MongoDB service...");
        const { MongoMemoryServer } = await import("mongodb-memory-server");
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri);
        console.log("Embedded MongoDB connected successfully at:", memUri);

        // Auto-seed demo data if empty
        const { default: User } = await import("../models/User.js");
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log("Database initialized empty. Auto-seeding initial demo records...");
            const { seedData } = await import("../scripts/seedData.js");
            await seedData();
        }
    } catch (fallbackError) {
        console.error("Failed to initialize embedded MongoDB engine:", fallbackError.message);
        throw fallbackError;
    }
};

const disconnectFromMongoDB = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("Mongoose connection closed");
        }
        if (memoryServer) {
            await memoryServer.stop();
            console.log("Embedded MongoDB stopped");
        }
    } catch (err) {
        console.error("Error during MongoDB disconnection:", err.message);
    }
};

export { connectToMongoDB as default, disconnectFromMongoDB };
