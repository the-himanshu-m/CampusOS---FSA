
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectToMongoDB from "../config/db.js";
import { seedData } from "./seedData.js";

// Load the server's environment variables explicitly.
dotenv.config({ path: "./server/.env" });

const runSeed = async () => {
    try {
        console.log("Connecting to database for seeding...");

        if (!process.env.MONGO_URI) {
            throw new Error(
                "MONGO_URI not found. Check server/.env"
            );
        }

        await connectToMongoDB();

        // Prevent accidentally seeding an in-memory database.
        if (mongoose.connection.host === "127.0.0.1" &&
            !process.env.MONGO_URI) {
            throw new Error("Unexpected in-memory database.");
        }

        await seedData();

        console.log("Seeding finished successfully.");
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
    }
};

runSeed();