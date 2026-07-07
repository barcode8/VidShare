import { Router } from 'express';
import {
    getUnreadNotifications,
    streamNotifications,
    markNotificationAsRead
} from "../controllers/notification.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

// Apply the verifyJwt middleware to ALL routes in this file
router.use(verifyJwt);

// Route to fetch historical unread notifications (Standard HTTP)
router.route("/").get(getUnreadNotifications);

// Route to keep the connection open for real-time SSE updates
router.route("/stream").get(streamNotifications);

// Route to mark a specific notification as read
router.route("/:id/read").patch(markNotificationAsRead);

export default router;