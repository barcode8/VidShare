import { Router } from "express";
import { changeCurrentPassword, changeUserAvatar, changeUserCoverImage, changeUserDetails, getCurrentUser, getUserProfile, getWatchHistory, loginUser, logoutUser, refreshAccessToken, registerUser, addVideoToWatchHistory } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJwt } from "../middlewares/auth.middleware.js";

//Initialising Router
const router= Router()

//Register route config with multer middleware
router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser)

//Login route config
router.route('/login').post(
    loginUser
)

//Logout route config
router.route("/logout").post(verifyJwt, logoutUser)

//Refresh Token route config
router.route("/refresh-token").post(refreshAccessToken)

//Change password route config
router.route("/change-password").post(verifyJwt, changeCurrentPassword)

//Current user route config
router.route("/current-user").get(verifyJwt, getCurrentUser)

//Changing user details route config, patch is used when we change a part of the existing data
router.route("/change-details").patch(verifyJwt, changeUserDetails)

//Changing avatar route config
router.route("/change-avatar").patch(verifyJwt, upload.single("avatar"), changeUserAvatar)

//Changing cover image route config
router.route("/change-coverimage").patch(verifyJwt, upload.single("coverImage"), changeUserCoverImage)

//Returning any user's profile route config
router.route("/c/:username").get(verifyJwt, getUserProfile)

//Watch history route config
router.route("/watch-history").get(verifyJwt, getWatchHistory)

//Add videos to watch history
router.route("/add/:videoId").post(verifyJwt, addVideoToWatchHistory)

export default router