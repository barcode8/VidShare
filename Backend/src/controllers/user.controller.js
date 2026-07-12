import {asyncHandler} from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import {User} from "../models/user.models.js"
import {Video} from "../models/video.models.js"
import { isValidObjectId } from "mongoose"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"
import dotenv from "dotenv";

dotenv.config()

const generateAccessAndRefreshTokens= async(userId)=>{
    try {
        const user=await User.findById(userId)
        const accessToken= user.generateAccessToken()
        const refreshToken= user.generateRefreshToken()

        user.refreshToken= refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    //get user details from frontend
    //validate user inputs
    //check if user already exists
    //check for images
    //check for avatar
    //upload images to cloudinary,check if avatar got uploaded to cloudinary or not
    //create user object
    //remove password and refresh token field from response

    //step 1
    const {username, email, fullName, password}=req.body
    
    if(
        [username, email, password].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existingUser=await User.findOne({
        $or: [{username} , {email}]
    })

    if(existingUser){
        throw new ApiError(409,"User with email or username already exists")
    }
    const defaultAvatar=process.env.DEFAULT_AVATAR
    const defaultCoverImage=process.env.DEFAULT_COVER_IMAGE

    // if(!avatarLocalPath){
    //     throw new ApiError(400,"Avatar is compulsory")
    // }

    // let coverImageLocalPath= req.files?.coverImage?.[0]?.path;
    // if(req.files.coverImage?.[0]){
    //     coverImageLocalPath= req.files.coverImage[0].path
    // }

    // const avatar=await uploadOnCloudinary(avatarLocalPath)
    // const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    // if(!avatar){
    //     throw new ApiError(400,"Avatar is compulsory")
    // }

    const user=await User.create({
        username: username.toLowerCase(),
        fullName : fullName || username,
        avatar: defaultAvatar,
        coverImage: defaultCoverImage,
        email,
        password,
    })

    const createdUser=await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered sucessfully")
    )
})

const loginUser= asyncHandler(async (req,res)=>{
    const {email, username, password}= req.body

    if(!username && !email){
        throw new ApiError(400,"Username or email is required")
    }

    const user= await User.findOne({
        $or: [{username},{email}]
    })

    if(!user){
        throw new ApiError(400,"User does not exist")
    }

    const isPasswordValid= await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Email or password is incorrect")
    }

    const {accessToken, refreshToken}= await generateAccessAndRefreshTokens(user._id)

    const loggedInUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )

    const options={
        httpOnly: true,
        secure: true,
        sameSite: "Lax"
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,{
            user: loggedInUser, accessToken, refreshToken
        },"User logged in successfully")
    )

})

const logoutUser= asyncHandler(async (req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options={
        httpOnly: true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(new ApiResponse(
        200, {}, "User logged out successfully"
    ))
})

const refreshAccessToken= asyncHandler(async (req,res)=>{
    const incomingRefreshToken=req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401,'Unauthorized request')
    }

    try {
        const decodedToken= jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user= await User.findById(decodedToken?._id)
    
        if(!user){
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401,'Invalid Refresh Token')
        }
    
        const options={
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, refreshToken}=await generateAccessAndRefreshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {accessToken, refreshToken}, "Access token refreshed successfully ")
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword= asyncHandler(async (req,res)=>{
    const {oldPassword, newPassword}=req.body
    const user=await User.findById(req.user?._id)

    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(401,"Invalid old password")
    }

    user.password= newPassword
    user.refreshToken = undefined;
    await user.save({validateBeforeSave: true})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Password Changed Successfully ")
    )
})

const getCurrentUser= asyncHandler(async (req,res)=>{
    return res
    .status(200)
    .json(
        new ApiResponse(200,req.user,"Current user fetched successfully")
    )
})

const changeUserDetails= asyncHandler(async (req,res)=>{
    const {fullName}= req.body
    const user= await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName
            }
        },
        {new: true}
    ).select("-password")

    return res
    .status(200)
    .json(
        200,user,"Account details updated successfully"
    )
})

const changeUserAvatar= asyncHandler(async (req,res)=>{
    const avatarLocalPath= req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(401,"Avatar file is missing")
    }

    const avatar= await uploadOnCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new ApiError(401,"Error while uploading an avatar")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Avatar image updated successfully")
    )
})

const changeUserCoverImage= asyncHandler(async (req,res)=>{
    const coverImageLocalPath= req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(401,"Cover Image file is missing")
    }

    const coverImage= await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage.url){
        throw new ApiError(401,"Error while uploading the cover image")
    }

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage: coverImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res
    .status(200)
    .json(
        new ApiResponse(200,user,"Cover image updated successfully")
    )
})

const getUserProfile= asyncHandler(async (req,res)=>{
    const {username}= req.params

    if(!username?.trim()){
        throw new ApiError(401, "Username not found")
    }

    const channel= await User.aggregate([{
        $match:{
            username: username?.toLowerCase()
        },
    },
    {
        $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
    },
    {
        $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }
    },
    {
        $addFields:{
            subscribersCount:{
                $size: "$subscribers"
            },
            subscribedToCount:{
                $size: "$subscribedTo"
            },
            isSubscribed:{
                $cond: {
                    if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                    then: true,
                    else: false
                }
            }
        }
    },{
        $project:{
            fullName: 1,
            username: 1,
            subscribersCount: 1,
            subscribedToCount: 1,
            avatar: 1,
            coverImage: 1,
            isSubscribed: 1,
        }
    }])

    if(!channel?.length){
        throw new ApiError(404,"Channel does not exist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "User channel fetched successfully")
    )
})

const getWatchHistory= asyncHandler(async (req,res)=>{
    const user= await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline:[
                    {
                        $lookup:{
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                            pipeline:[
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            ownerDetails: {
                                $first: "$ownerDetails"
                            }
                        }    
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, user[0].watchHistory, "User watch history fetched successfully")
    )
})

const addVideoToWatchHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if(!videoId){
        throw new ApiError(400, "Video ID not recieved")
    }

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }

    // Pull the video from the array if it already exists (prevents duplicates)
    await User.findByIdAndUpdate(
        req.user?._id,
        {
            $pull: { watchHistory: videoId }
        }
    );

    // Push the video to the end of the array (marks it as recently watched)
    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $push: {
                watchHistory : {
                    $each : [videoId],
                    $slice : -50
                }
            }
        },
        { new: true }
    )

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200, 
                updatedUser.watchHistory, 
                "Video successfully added to watch history"
            )
        );
});

export {registerUser,loginUser,logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, changeUserDetails, changeUserAvatar, changeUserCoverImage, getUserProfile, getWatchHistory, addVideoToWatchHistory}