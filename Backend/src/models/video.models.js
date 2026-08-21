import mongoose from "mongoose";
import { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema= new Schema({
    videoFile:{
        type: String,
        required: true
    },
    thumbnail:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    duration:{
        type: Number,
        required: true
    },
    views:{
        type: Number,
        default:0
    },
    isPublished:{
        type: Boolean,
        default: true
    },
    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    }
},{timestamps: true})

videoSchema.pre('deleteOne', {document : true, query : false}, async function (next){
    const videoId = this._id;

    try {
        //Delete all likes associated with the video itself
        await mongoose.model("Like").deleteMany({video : videoId})

        //Find all comments on the video
        const comments = await mongoose.model("Comment").find({ video : videoId});

        //Delete all comments associated with the video
        for(const comment of comments){
            await comment.deleteOne();
        }

        //The true beauty is that once this comment.deleteOne() is called, the other pre hook for the comment will fire meaning all comments will be pruned too at the same time

        //We also need to remove the videoId from the playlist when we delete a video
        await mongoose.model("Playlist").updateMany(
            {videos : videoId},
            {$pull : {videos : videoId} }
        );
        //Before this, whenever we deleted a video our playlist counter would stil count the video inside it as that videoId still existed in the array
    } catch (error) {
        next(error);
    }
})

videoSchema.plugin(mongooseAggregatePaginate)

export const Video= mongoose.model("Video",videoSchema)