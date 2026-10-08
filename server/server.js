import dotenv from "dotenv";
import app from "./app.js";
import connectToMongoDB from "./config/db.js";

dotenv.config();

const startServer = async () => {
    try {
        await connectToMongoDB();

        app.listen(3000, () => {
            console.log("CampusOS server running on port 3000");
        });
    } catch (error) {
        console.error("Unable to start CampusOS:", error.message);
        process.exitCode = 1;
    }   
};

startServer();