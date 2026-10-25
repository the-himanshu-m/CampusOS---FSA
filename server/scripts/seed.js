import dotenv from "dotenv";
import mongoose from "mongoose";
import connectToMongoDB from "../config/db.js";
import { seedData } from "./seedData.js";

dotenv.config();

const runSeed = async () => {
    try {
        console.log("Connecting to database for seeding...");
        await connectToMongoDB();
        await seedData();
        await mongoose.connection.close();
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(1);
    }
};

runSeed();
