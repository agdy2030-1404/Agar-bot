import dotenv from "dotenv";

dotenv.config();

export const config = {
    mongoUrl: process.env.MONGODB_URI,
};