import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const notificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    message: {
        type: String,
        required: true
    },
    videoId: {
        type: Schema.Types.ObjectId,
        ref: "Video"
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

//  We index user and isRead because your getUnreadNotifications controller 
// is going to query these two fields heavily. This prevents database bottlenecks.
notificationSchema.index({ user: 1, isRead: 1 });
notificationSchema.plugin(mongooseAggregatePaginate)

export const Notification = mongoose.model("Notification", notificationSchema);