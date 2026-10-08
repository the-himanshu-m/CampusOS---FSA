import dotenv from "dotenv";
import app from "./app.js";
import connectToMongoDB from "./config/db.js";

dotenv.config();

const startServer = async () => {
    try {
        await connectToMongoDB();

        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`CampusOS server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to start CampusOS:", error.message);
        process.exitCode = 1;
    }   
};

startServer();