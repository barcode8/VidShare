import express from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

// Central Express app configuration:
// - middleware stack
// - global parsers
// - route mounting

const app = express()

//Setting up CORS
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//Allows app to accept JSON data and sets payload size limit
app.use(express.json({
    limit: "16kb"
}))

//Allows the server to recieve urlencoded data
app.use(express.urlencoded({
    extended: true
}))

//Allows the public folder to be accessed from the url
app.use(express.static("public"))

//Allows app to make use of req.cookies
app.use(cookieParser())

//Routes

//Importing and using user related apis
import userRouter from "./routes/user.routes.js"
import videoRouter from "./routes/video.routes.js"
import likeRouter from "./routes/like.routes.js"
import commentRouter from "./routes/comment.routes.js"
import subscriptionRouter from "./routes/subscription.routes.js"
import healthCheckRouter from "./routes/healthcheck.routes.js"
import dashboardRouter from "./routes/dashboard.routes.js"
import playlistRouter from "./routes/playlist.routes.js"
import viewRouter from "./routes/view.routes.js"
import notificationRouter from "./routes/notification.routes.js"

//Implementing routes
app.use("/api/v1/healthcheck", healthCheckRouter)
app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos", videoRouter)
app.use("/api/v1/likes", likeRouter)
app.use("/api/v1/comments", commentRouter)
app.use("/api/v1/subscriptions", subscriptionRouter)
app.use("/api/v1/playlist", playlistRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.use("/api/v1/view", viewRouter)
app.use("/api/v1/notification", notificationRouter)

export {app};