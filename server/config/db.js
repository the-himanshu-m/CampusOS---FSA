
import mongoose from "mongoose";

let memoryServer = null;

const connectToMongoDB = async () => {
    const isProduction = process.env.NODE_ENV === "production";
    const mongoUri = process.env.MONGO_URI?.trim();
    const useInMemoryDB =
        process.env.USE_IN_MEMORY_DB === "true";

    // Production must always use persistent MongoDB.
    if (isProduction) {
        if (!mongoUri) {
            throw new Error(
                "MONGO_URI is required in production."
            );
        }

        if (useInMemoryDB) {
            throw new Error(
                "USE_IN_MEMORY_DB must not be true in production."
            );
        }
    }

    // Use the configured MongoDB connection.
    if (mongoUri && !useInMemoryDB) {
        try {
            console.log(
                isProduction
                    ? "Connecting to production MongoDB..."
                    : "Connecting to configured MongoDB..."
            );

            await mongoose.connect(mongoUri, {
                serverSelectionTimeoutMS: 10000
            });

            console.log(
                "MongoDB connected successfully."
            );

            return;
        } catch (error) {
            // Never silently switch databases when a URI
            // has been configured but its connection fails.
            console.error(
                "MongoDB connection failed:",
                error.message
            );

            throw error;
        }
    }

    // In-memory MongoDB is permitted only when explicitly
    // enabled for local development or testing.
    if (useInMemoryDB && !isProduction) {
        try {
            console.log(
                "Starting explicitly requested in-memory MongoDB..."
            );

            const { MongoMemoryServer } = await import(
                "mongodb-memory-server"
            );

            memoryServer = await MongoMemoryServer.create();

            await mongoose.connect(memoryServer.getUri());

            console.log(
                "In-memory MongoDB connected successfully."
            );

            return;
        } catch (error) {
            console.error(
                "In-memory MongoDB initialization failed:",
                error.message
            );

            if (memoryServer) {
                await memoryServer.stop();
                memoryServer = null;
            }

            throw error;
        }
    }

    throw new Error(
        "MONGO_URI is missing or in-memory mode is disabled. " +
        "Configure MONGO_URI, or explicitly set " +
        "USE_IN_MEMORY_DB=true for local development/testing."
    );
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
        console.error(
            "Database shutdown error:",
            error.message
        );

        throw error;
    }
};

export {
    connectToMongoDB as default,
    disconnectFromMongoDB
};