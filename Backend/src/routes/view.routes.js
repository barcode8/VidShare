import { Router } from "express";
import { recordView } from "../controllers/view.controller.js";
import { verifyJWTIfAvailable } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJWTIfAvailable)

router.route("/:videoId").post(recordView)

export default router