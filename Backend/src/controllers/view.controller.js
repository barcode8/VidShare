import { View } from "../models/view.models.js";
import { Video } from "../models/video.models.js";
import { isValidObjectId } from "mongoose";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const recordView = asyncHandler(async (req, res) =>{
    const {videoId} = req.params

    if(!videoId){
        throw new ApiError(400, "Video ID not recieved")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    //Extracting user id if user is logged in
    const userId = req.user?._id || null

    // Extract IP. Checking 'x-forwarded-for' is crucial if we ever deploy to platforms like Render, Vercel, or Heroku.
    const ipAddress = req.headers['x-forwarded-for'] || req.ip

    //Building a custom query object to use during find
    const query = {video : videoId}

    if(userId){
        //If user ID exists, we add the $or operation to the query object which has an array of objects of both userId and ipAddress
        query.$or = [{
            user : userId
        },
        {
            ipAddress : ipAddress
        }]
    } else {
        //If user is not logged in, we rely on IP address only
        query.ipAddress = ipAddress
    }

    const existingView = await View.findOne(query)

    if(existingView){
        //If view already exist we stop here and send a response
        return res
        .status(200)
        .json(new ApiResponse(200, existingView, "View already recorded in the past 24h"))
    }

    await View.create({
        video : videoId,
        user : userId,
        ipAddress : ipAddress
    })

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {$inc : {views : 1}},
        //Add 1 to the view count in video model and return the new updated video object
        {new : true}
    )

    if(!updatedVideo){
        throw new ApiError(404, "Video not found")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, {views : updatedVideo.views}, "View recorded successfully" ))
})

export {
    recordView
}