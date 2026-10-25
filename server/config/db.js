const connectToMongoDB = async () => {
    const isProduction = process.env.NODE_ENV === "production";
    const mongoUri = process.env.MONGO_URI;

    if (isProduction) {
        if (!mongoUri) {
            throw new Error("MONGO_URI is required in production");
        }

        console.log("Connecting to production MongoDB Atlas...");

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });

        console.log("Connected to production MongoDB successfully.");
        return;
    }

    // Keep your existing development-only connection and
    // in-memory fallback logic below this point.
};