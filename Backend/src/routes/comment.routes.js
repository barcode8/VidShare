import { Router } from 'express';
import {
    addComment,
    deleteComment,
    getVideoComments,
    updateComment,
} from "../controllers/comment.controller.js"
import { verifyJWTIfAvailable, verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:videoId").get(verifyJWTIfAvailable, getVideoComments)

router.route("/:videoId").post(verifyJwt, addComment);
router.route("/c/:commentId").delete(verifyJwt, deleteComment).patch(verifyJwt, updateComment);

export default router