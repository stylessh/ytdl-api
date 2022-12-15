"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.download = void 0;
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const downloadVideoWithAudio_1 = __importDefault(require("../utils/downloadVideoWithAudio"));
const child_process_1 = __importDefault(require("child_process"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
const download = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { url, quality, trim } = req.body;
    //   console.log("trim", trim);
    res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
    res.setHeader("Content-Type", "video/mp4");
    // 18 = 360p this always come with audio so we don't need to download audio
    if (quality === 18) {
        const info = yield ytdl_core_1.default.getInfo(url);
        // get 360p video
        const format = ytdl_core_1.default.chooseFormat(info.formats, { quality: quality });
        const video = (0, ytdl_core_1.default)(url, { format });
        // if trim is set then trim the video
        if (trim) {
            const ffmpegProcess = child_process_1.default.spawn(ffmpeg_static_1.default || "d:\\ffmpeg\\bin\\ffmpeg.exe", [
                // Remove ffmpeg's console spamming
                "-loglevel",
                "0",
                "-hide_banner",
                // inputs
                "-i",
                "pipe:3",
                // trim video
                "-ss",
                trim.start,
                "-to",
                trim.end,
                // Choose some fancy codes
                "-c:v",
                "copy",
                "-c:a",
                "copy",
                // Define output container
                "-f",
                "matroska",
                "pipe:4",
            ], {
                windowsHide: true,
                stdio: [
                    /* Standard: stdin, stdout, stderr */
                    "inherit",
                    "inherit",
                    "inherit",
                    /* Custom: pipe:3, pipe:4 */
                    "pipe",
                    "pipe",
                ],
            });
            ffmpegProcess.on("close", () => {
                process.stdout.write("\n");
            });
            video.pipe(ffmpegProcess.stdio[3]);
            (_a = ffmpegProcess.stdio[4]) === null || _a === void 0 ? void 0 : _a.pipe(res);
        }
        else {
            // if trim is not set then just download the video
            video.pipe(res);
        }
    }
    else {
        // download video with audio
        (0, downloadVideoWithAudio_1.default)({ url, quality, trim }, res);
    }
});
exports.download = download;
exports.config = {
    api: {
        responseLimit: false,
    },
};
