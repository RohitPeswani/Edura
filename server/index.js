import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import connectDB from "./database/db.js";

dotenv.config({});

connectDB();
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

 
app.listen(PORT, () => {
    console.log(`Server listen at port ${PORT}`);
})


