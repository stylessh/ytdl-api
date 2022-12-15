"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const video_controllers_1 = require("../controllers/video.controllers");
router.post("/download", video_controllers_1.download);
exports.default = router;
