import mongoose, { Schema } from "mongoose";

const viewSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            default: null, // Allows us to track guest/unauthenticated users
        },
        ipAddress: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// This tells MongoDB to automatically delete the document 86,400 seconds (24 hours) after it was created.
viewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

// Compound index to make our controller query lightning fast when checking if a user/IP already viewed the video
viewSchema.index({ video: 1, user: 1, ipAddress: 1 });

export const View = mongoose.model("View", viewSchema);