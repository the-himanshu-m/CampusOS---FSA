import mongoose from "mongoose";

const connectToMongoDB = async () => {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
        console.error("MongoDB Error: MONGO_URI is not defined in environment variables");
        throw new Error("MONGO_URI is missing");
    }

    try {
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        if (error.message.includes("whitelist") || error.name === "MongooseServerSelectionError") {
            console.error("Tip: Ensure your current IP is whitelisted (or 0.0.0.0/0) in MongoDB Atlas Network Access settings.");
        }
        throw error;
    }
};

export default connectToMongoDB;