import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import path from "path";
import fs from "fs"

dotenv.config(
    {
        path: "./.env"
    }
)

//Boot-up check, check if temp folder exists
const tempDirPath = path.resolve('./public/temp');
if (!fs.existsSync(tempDirPath)) {
    fs.mkdirSync(tempDirPath, { recursive: true });
    console.log(`Created missing temp directory at: ${tempDirPath}`);
}

const PORT = process.env.PORT || 8000
const HOST = process.env.HOST || '0.0.0.0'
connectDB()
.then(()=>{
    const server = app.listen(process.env.PORT || 8000,()=>{
        console.log(`App is listening on PORT:${process.env.PORT || 8000}`)
    })

    server.on('error', (error) => {
        if (error.code === 'EADDRINUSE') {
            console.error(`Port ${PORT} is already in use.`);
        } else {
            console.error('Server startup error:', error);
        }
        process.exit(1);
    });
})
.catch((error)=>{
    console.log("DB connection failed!! ",error)
})

console.log("CI/CD WORKS")