import { Router } from "express";
import { recordView } from "../controllers/view.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()
router.use(verifyJwt)

router.route("/:videoId").post(recordView)

export default router