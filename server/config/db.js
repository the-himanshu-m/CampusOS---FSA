
import mongoose from "mongoose";

let memoryServer = null;

const connectToMongoDB = async () => {
    const isProduction = process.env.NODE_ENV === "production";
    const mongoUri = process.env.MONGO_URI;
    const useInMemoryDB = process.env.USE_IN_MEMORY_DB === "true";

    // Production must use the configured persistent database.
    if (isProduction) {
        if (!mongoUri) {
            throw new Error(
                "MONGO_URI is required in production. Configure MongoDB Atlas."
            );
        }

        if (useInMemoryDB) {
            throw new Error(
                "USE_IN_MEMORY_DB cannot be enabled in production."
            );
        }

        console.log("Connecting to production MongoDB...");

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("Connected to production MongoDB successfully.");
        return;
    }

    // Use Atlas when configured, unless memory mode is explicitly requested.
    if (mongoUri && !useInMemoryDB) {
        console.log("Attempting connection to configured MongoDB...");

        try {
            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 6000,
            });

            console.log("MongoDB connected successfully.");
            return;
        } catch (error) {
            console.warn("MongoDB connection failed:", error.message);
            console.warn(
                "Falling back to in-memory MongoDB for development only."
            );
        }
    }

    // Local development/test fallback only.
    try {
        console.log("Starting embedded in-memory MongoDB...");

        const { MongoMemoryServer } = await import("mongodb-memory-server");

        memoryServer = await MongoMemoryServer.create();

        await mongoose.connect(memoryServer.getUri());

        console.log("Embedded MongoDB connected successfully.");

        const { default: User } = await import("../models/User.js");
        const userCount = await User.countDocuments();

        if (userCount === 0) {
            console.log("Seeding initial demo data...");

            const { seedData } = await import("../scripts/seedData.js");
            await seedData();
        }
    } catch (error) {
        console.error(
            "Failed to initialize development database:",
            error.message
        );
        throw error;
    }
};

const disconnectFromMongoDB = async () => {
    try {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log("Mongoose connection closed.");
        }

        if (memoryServer) {
            await memoryServer.stop();
            memoryServer = null;
            console.log("Embedded MongoDB stopped.");
        }
    } catch (error) {
        console.error("Database shutdown error:", error.message);
    }
};

export { connectToMongoDB as default, disconnectFromMongoDB };
