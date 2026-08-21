import mongoose, {Schema} from "mongoose"
import { Model } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({
    content:{
        type: String,
        required: true
    },

    video:{
        type: Schema.Types.ObjectId,
        ref: "Video"
    },

    owner:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },

    parentComment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    }

},{timestamps:true})

commentSchema.pre('deleteOne', {document : true, query : false}, async function (next){
    const commentId = this._id;

    try {
        //When a comment is deleted, we need to delete all associated likes with the comment too for proper cleanup. We use mongoose.Model to prevent circular dependency issues
        await mongoose.model("Like").deleteMany({ comment: commentId});

        //Find all child replies associated with the comment
        const replies = await mongoose.model("Comment").find({ parentComment : commentId})

        //Just like the Likes, we need to delete all replies associated to this comment too
        for(const reply of replies){
            await reply.deleteOne();
        }

        //Even though deleteMany would be faster compared to using deleteOne on each iteration, we use deleteOne so that whenever a reply comment object is deleted, this hook fires AGAIN and prunes all the replies to the reply

        next();
    } catch (error) {
        next(error);
    }
})

commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)