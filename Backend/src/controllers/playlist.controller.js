import mongoose, {isValidObjectId} from "mongoose"
import { Playlist } from "../models/playlist.models.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name){
        throw new ApiError(400, "Playlist name is required")
    }

    const existingPlaylist = await Playlist.findOne(
        {
            name,
            owner : req.user._id
        }
    )

    if(existingPlaylist){
        throw new ApiError(409, "Playlist with the same name already exists in your account")
    }

    const playlist = await Playlist.create({
        name : name,
        description : description,
        owner : req.user._id
    })

    return res
    .status(200)
    .json(new ApiResponse(201, playlist, `Playlist ${name} successfully created`))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if(!userId){
        throw new ApiError(400, "User ID not recieved")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID")
    }

    const playlists = await Playlist.find(
        {
            owner : userId
        }
    )

    return res
    .status(200)
    .json(new ApiResponse(200, playlists, "User playlists fetched successfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!playlistId){
        throw new ApiError(400, "Playlist ID not recieved")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    const playlist = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        // Lookup the playlist owner details
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
        // Lookup the videos array
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    // Nested lookup for each video's owner
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
                    // Flatten the video's owner array using $first
                    {
                        $addFields: {
                            ownerDetails: { $first: "$ownerDetails" }
                        }
                    }
                ]
            }
        },
        // Final data shaping at the root level
        {
            $addFields: {
                // Flatten the playlist's owner array using $first
                ownerDetails: { $first: "$ownerDetails" },
                // Calculate the total videos dynamically using $size
                totalVideos: { $size: "$videos" }
            }
        }
    ]);

    if (!playlist?.length) {
        throw new ApiError(404, "Playlist not found");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId){
        throw new ApiError(400, "Playlist ID not recieved")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    if(!videoId){
        throw new ApiError(400, "Video ID not recieved")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You do not have permission to modify this playlist")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id : playlistId,
            owner : req.user._id
        },
        {
            $push : {
                videos : videoId
            }
        },
        {new : true}
    )

    if(!updatedPlaylist){
        throw new ApiError(404, "Error adding video to playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(!playlistId){
        throw new ApiError(400, "Playlist ID not recieved")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    if(!videoId){
        throw new ApiError(400, "Video ID not recieved")
    }

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist not found")
    }

    if(playlist.owner.toString() !== req.user._id.toString()){
        throw new ApiError(403, "You do not have permission to modify this playlist")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id : playlistId,
            owner : req.user._id
        },
        {
            $pull : {
                videos : videoId
            }
        },
        {new : true}
    )

    if(!updatedPlaylist){
        throw new ApiError(404, "Error removing video from playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video removed successfully"))
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!playlistId){
        throw new ApiError(400, "Playlist ID not recieved")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    const deletedPlaylist = await Playlist.findOneAndDelete(
        {
            _id : playlistId,
            owner : req.user._id
        }
    )

    if (!deletedPlaylist) {
        throw new ApiError(404, "Playlist not found or you don't have permission to delete it");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    
    if(!playlistId){
        throw new ApiError(400, "Playlist ID not recieved")
    }

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID")
    }

    if (name === undefined && description === undefined) {
        throw new ApiError(400, "Please provide a name or description to update");
    }

    const updateFields = {}

    if (name !== undefined) {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new ApiError(400, "Playlist name cannot be empty");
        }
        updateFields.name = trimmedName;
    }

    if (description !== undefined) {
        updateFields.description = description.trim(); 
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate(
        {
            _id: playlistId,
            owner: req.user._id
        },
        {
            $set: updateFields
        },
        { new: true }
    )

    if (!updatedPlaylist) {
        throw new ApiError(404, "Playlist not found or you don't have permission to update it");
    }

    return res
    .status(200)
    .json(new ApiResponse(200, updateFields, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}