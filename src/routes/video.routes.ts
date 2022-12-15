import { Router } from "express";
const router = Router();
import { download } from "../controllers/video.controllers";

router.post("/download", download);

export default router;
