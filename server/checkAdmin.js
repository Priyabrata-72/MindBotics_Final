import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './model/user.js';

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const user = await User.findOne({ email: 'priyabratacharya03@gmail.com' });
        console.log("USER ROLE:", user ? user.role : "User not found");
        console.log("FULL USER:", user);
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
};

checkUser();
