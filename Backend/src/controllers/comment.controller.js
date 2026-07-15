import mongoose from "mongoose"
import { isValidObjectId } from "mongoose"
import { Comment } from "../models/comment.models.js"
import ApiError from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    const userId = req.user?._id

    const pageNumber = parseInt(page, 10)
    const limitNumber = parseInt(limit, 10)

    //Check if we recieved video id or not
    if(!videoId){
        throw new ApiError(400, "Video Id not received")
    }

    //Check if recieved videoId is valid or not
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format")
    }

    const pipeline = [
        {
            $match : {
                //Finding all comments for the specific video
                video : new mongoose.Types.ObjectId(videoId),
                parentComment : null
            }
        },
        {
            $lookup:{
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "ownerDetails",
                pipeline : [
                    {
                        $project:{
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup : {
                from : "likes",
                localField : "_id",
                foreignField : "comment",
                as : "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "parentComment",
                as: "replies"
            }
        },
        {
            $addFields:{
                ownerDetails : { $first: "$ownerDetails" },
                // Count the number of items in the 'likes' array
                likesCount: { $size: "$likes" },
                repliesCount: { $size: "$replies" },
                // Check if the current user's ID exists in the 'likedBy' field of the likes array
                isLiked: {
                    $cond: {
                        if: {
                            $in: [userId , "$likes.likedBy"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        //Remove the likes array from final output
        {
            $project : {
                likes : 0,
                replies: 0
            }
        },
        {
            $sort : {createdAt: -1}
        }
    ]

    const aggregate = Comment.aggregate(pipeline)

    const options = {
        page : pageNumber,
        limit : limitNumber,
    }

    const result = await Comment.aggregatePaginate(aggregate,options)

    //Send final response
    return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments fetched successfully"))
})

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const {content} = req.body
    const userId = req.user._id

    //Check if we recieved video id or not
    if(!videoId){
        throw new ApiError(400, "Video Id not received")
    }

    //Check if recieved videoId is valid or not
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID format")
    }

    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment body is mandatory")
    }

    //Check if we recieved user id or not
    if(!userId){
        throw new ApiError(400, "User not found")
    }

    //Check if recieved owner ID is valid or not
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user Id")
    }

    const comment = await Comment.create({
        content,
        video : videoId,
        owner : userId
    })

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    const {content} = req.body
    const {commentId} = req.params
    const userId = req.user._id

    //Check if we recieved comment id or not
    if(!commentId){
        throw new ApiError(400, "Comment Id not received")
    }

    //Check if recieved commentId is valid or not
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID format")
    }

    //Checking if content is empty/just spaces
    if(!content || content.trim() === ""){
        throw new ApiError(400, "Comment body is mandatory")
    }

    //Find the comment first using comment ID
    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(400, "Comment could not be found")
    }

    //We must check for ownership, whether the comment's owner itself is editing the comment or not
    if(comment.owner.toString() !== userId.toString() ){
        throw new ApiError(400, "You do not have permission to edit this comment")
    }

    //Modify the comment content to the new one
    comment.content = content

    //ValidateBeforeSave checks whether the new content matches the constraints we defined such as required:true or custom regex commands
    await comment.save({validateBeforeSave : false})

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    const userId = req.user._id

    //Check if we recieved comment id or not
    if(!commentId){
        throw new ApiError(400, "Comment Id not received")
    }

    //Check if recieved commentId is valid or not
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID format")
    }

    //Check if we recieved owner id or not
    if(!userId){
        throw new ApiError(400, "Owner Id not received")
    }

    //Check if recieved ownerId is valid or not
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid Owner ID format")
    }

    //Finding the comment
    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(400, "Comment could not be found")
    }

    //Check whether the comment owner itself is the one deleting the comment
    if(comment.owner.toString() !== userId.toString()){
        throw new ApiError(400, "You do not have permission to delete this comment")
    }

    //Delete the comment directly from here
    await comment.deleteOne()
    
    return res
    .status(200)
    .json(new ApiResponse(200, {deletedCommentId : commentId}, "Comment deleted successfully"))
})

const addCommentReply = asyncHandler(async (req,res)=>{
    const {commentId} = req.params
    const {content} = req.body

    const userId = req.user._id

    if(!commentId){
        throw new ApiError(400, "Comment ID not recieved")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Comment ID not valid")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Reply content is mandatory");
    }

    const parentComment = await Comment.findById(commentId)

    if (!parentComment) {
        throw new ApiError(404, "Parent comment not found");
    }

    const reply = await Comment.create({
        content,
        video: parentComment.video,
        owner: userId,
        parentComment: commentId
    });

    return res
        .status(201)
        .json(new ApiResponse(201, reply, "Reply added successfully"));
})

const getCommentReplies = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const userId = req.user?._id;

    if(!commentId){
        throw new ApiError(400, "Comment ID not recieved")
    }

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID format");
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const pipeline = [
        {
            $match: {
                parentComment: new mongoose.Types.ObjectId(commentId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "parentComment",
                as: "replies"
            }
        },
        {
            $addFields: {
                ownerDetails: { $first: "$ownerDetails" },
                likesCount: { $size: "$likes" },
                repliesCount: { $size: "$replies" },
                isLiked: {
                    $cond: {
                        if: { $in: [userId, "$likes.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                likes: 0,
                replies : 0
            }
        },
        {
            $sort: { createdAt: 1 } // Chronological order is usually better for replies
        }
    ];

    const aggregate = Comment.aggregate(pipeline);
    const options = {
        page: pageNumber,
        limit: limitNumber,
    };

    const result = await Comment.aggregatePaginate(aggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Replies fetched successfully"));
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment,
    addCommentReply,
    getCommentReplies
    }