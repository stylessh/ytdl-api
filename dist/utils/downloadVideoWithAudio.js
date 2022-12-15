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
const ytdl_core_1 = __importDefault(require("ytdl-core"));
const child_process_1 = __importDefault(require("child_process"));
const ffmpeg_static_1 = __importDefault(require("ffmpeg-static"));
function downloadVideoWithAudio(data, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const info = yield ytdl_core_1.default.getInfo(data.url);
        const videoFormat = ytdl_core_1.default.chooseFormat(info.formats, {
            quality: data.quality,
            filter: "videoonly",
        });
        //  get highest quality audio
        const audioFormat = ytdl_core_1.default.chooseFormat(info.formats, {
            quality: "highestaudio",
            filter: "audioonly",
        });
        //   download video and audio and merge them into one file using ffmpeg
        const video = (0, ytdl_core_1.default)(data.url, { format: videoFormat });
        const audio = (0, ytdl_core_1.default)(data.url, { format: audioFormat });
        const ffmpegProcess = child_process_1.default.spawn(ffmpeg_static_1.default || "d:\\ffmpeg\\bin\\ffmpeg.exe", [
            // Remove ffmpeg's console spamming
            "-loglevel",
            "0",
            "-hide_banner",
            // inputs
            "-i",
            "pipe:3",
            "-i",
            "pipe:4",
            // if trim is set then trim the video
            ...(data.trim ? ["-ss", data.trim.start, "-to", data.trim.end] : []),
            // Choose some fancy codes
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            // Define output container
            "-f",
            "matroska",
            "pipe:5",
        ], {
            windowsHide: true,
            stdio: [
                /* Standard: stdin, stdout, stderr */
                "inherit",
                "inherit",
                "pipe",
                "pipe",
                "pipe",
                "pipe",
            ],
        });
        ffmpegProcess.on("close", () => {
            process.stdout.write("\n");
        });
        // return video and audio to client
        res.status(200);
        audio.pipe(ffmpegProcess.stdio[3]);
        video.pipe(ffmpegProcess.stdio[4]);
        // ignore error of index
        // @ts-ignore
        (_a = ffmpegProcess.stdio[5]) === null || _a === void 0 ? void 0 : _a.pipe(res);
    });
}
exports.default = downloadVideoWithAudio;
