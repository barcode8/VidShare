import mongoose, { isValidObjectId } from "mongoose";
import { Notification } from "../models/notification.models.js";
import { notificationEmitter } from "../utils/eventEmitter.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Fetch historical unread notifications (Using Aggregation & Pagination)
const getUnreadNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const pipeline = [
        {
            $match: {
                user: new mongoose.Types.ObjectId(req.user._id),
                isRead: false
            }
        },
        // Optional: Lookup the video details so the frontend can display the thumbnail in the notification dropdown
        {
            $lookup: {
                from: "videos",
                localField: "videoId",
                foreignField: "_id",
                as: "videoDetails",
                pipeline: [
                    {
                        $project: {
                            title: 1,
                            thumbnail: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                videoDetails: { $first: "$videoDetails" }
            }
        },
        {
            $sort: { createdAt: -1 }
        }
    ];

    const aggregate = Notification.aggregate(pipeline);

    const options = {
        page: pageNumber,
        limit: limitNumber,
    };

    const result = await Notification.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Unread notifications fetched successfully"));
});

// The Server-Sent Events (SSE) Stream (Remains identical as it handles a direct protocol)
const streamNotifications = (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.write(`data: {"type": "connected"}\n\n`);

    const eventName = `notify-${req.user._id}`;
    
    const notificationListener = (newNotification) => {
        res.write(`data: ${JSON.stringify(newNotification)}\n\n`);
    };

    notificationEmitter.on(eventName, notificationListener);

    req.on("close", () => {
        notificationEmitter.off(eventName, notificationListener);
    });
};

// Mark notification as read (With Validation and Ownership Checks)
const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;

    // Check if we received the id
    if (!notificationId) {
        throw new ApiError(400, "Notification ID not received");
    }

    // Check if id is a valid MongoDB ObjectId
    if (!isValidObjectId(notificationId)) {
        throw new ApiError(400, "Invalid Notification ID format");
    }

    // Find the notification
    const notification = await Notification.findById(notificationId);

    if (!notification) {
        throw new ApiError(404, "Notification could not be found");
    }

    // Security Check: Ensure the user marking it as read is the actual owner
    if (notification.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You do not have permission to modify this notification");
    }

    // Save the update
    notification.isRead = true;
    await notification.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Notification marked as read"));
});

export {
    getUnreadNotifications,
    streamNotifications,
    markNotificationAsRead
};