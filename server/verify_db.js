import mongoose from "mongoose";
import dotenv from "dotenv";
import Contact from "./model/Contact.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const verifyConnection = async () => {
    console.log("⏳ Testing MongoDB Connection...");
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅ MongoDB Connected Successfully!");

        // Test Insertion
        const testContact = {
            name: "Test User",
            email: "test@example.com",
            phone: "1234567890",
            subject: "Connection Test",
            message: "This is a test message to verify database connection."
        };

        const result = await Contact.create(testContact);
        console.log("✅ Test Data Inserted:", result._id);

        // Clean up
        await Contact.findByIdAndDelete(result._id);
        console.log("✅ Test Data Cleaned Up");

        process.exit(0);
    } catch (error) {
        console.error("❌ Database Connection Failed:", error);
        process.exit(1);
    }
};

verifyConnection();
