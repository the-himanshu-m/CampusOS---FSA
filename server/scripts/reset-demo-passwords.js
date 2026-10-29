
import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

dotenv.config({ path: "server/.env" });

const demoAccounts = [
    {
        email: "admin@campus.edu",
        password: "Admin@1234",
        role: "ADMIN",
    },
    {
        email: "faculty@campus.edu",
        password: "Faculty@1234",
        role: "FACULTY",
    },
    {
        email: "student@campus.edu",
        password: "Student@1234",
        role: "STUDENT",
    },
];

const resetDemoPasswords = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;

        if (!mongoUri) {
            throw new Error(
                "MONGO_URI is missing from server/.env"
            );
        }

        console.log("Connecting to configured MongoDB Atlas...");
        await mongoose.connect(mongoUri);

        // Verify every target exists before changing any password.
        for (const account of demoAccounts) {
            const user = await User.findOne({
                email: account.email,
            }).select("_id email role");

            if (!user) {
                throw new Error(
                    `Demo account not found: ${account.email}. No passwords were changed.`
                );
            }

            if (user.role !== account.role) {
                throw new Error(
                    `Unexpected role for ${account.email}. No passwords were changed.`
                );
            }
        }

        // Update only the password fields for these three accounts.
        for (const account of demoAccounts) {
            const passwordHash = await bcrypt.hash(
                account.password,
                12
            );

            await User.updateOne(
                {
                    email: account.email,
                    role: account.role,
                },
                {
                    $set: { password: passwordHash },
                }
            );

            console.log(`Password hash updated: ${account.email}`);
        }

        // Verify all three stored hashes.
        for (const account of demoAccounts) {
            const user = await User.findOne({
                email: account.email,
            }).select("+password");

            const matches = await bcrypt.compare(
                account.password,
                user.password
            );

            if (!matches) {
                throw new Error(
                    `Password verification failed for ${account.email}`
                );
            }

            console.log(
                `Password verification passed: ${account.email}`
            );
        }

        console.log("Demo password repair completed successfully.");
    } catch (error) {
        console.error("Demo password repair failed:", error.message);
        process.exitCode = 1;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.disconnect();
        }
    }
};

resetDemoPasswords();
