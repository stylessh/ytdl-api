import type { Request, Response } from "express";
import ytdl from "ytdl-core";
import downloadVideoWithAudio from "../utils/downloadVideoWithAudio";

import cp from "child_process";
import ffmpeg from "ffmpeg-static";

type BodyData = {
  url: string;
  quality?: number;
  trim?: TrimData;
};

type TrimData = {
  start: string;
  end: string;
};

const audioTags = [140, 249, 250, 251];

export const download = async (req: Request, res: Response) => {
  const { url, quality, trim } = req.body as BodyData;

  const isAudio = audioTags.includes(quality || 0);

  // set headers based of format mp3/mp4
  if (isAudio) {
    res.setHeader("Content-Disposition", `attachment; filename="audio.mp3"`);
    res.setHeader("Content-Type", "audio/mp3");
  } else {
    res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
    res.setHeader("Content-Type", "video/mp4");
  }

  // if quality is a audio tag then download just audio
  if (isAudio) {
    const info = await ytdl.getInfo(url);

    const audioFormat = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    const audio = ytdl(url, { format: audioFormat });

    // set content length
    res.setHeader("Content-Length", audioFormat.contentLength);

    // if trim is set then trim the audio
    if (trim) {
      const ffmpegProcess = cp.spawn(
        ffmpeg || "d:\\ffmpeg\\bin\\ffmpeg.exe",
        [
          // Remove ffmpeg's console spamming
          "-loglevel",

          "0",
          "-hide_banner",
          // inputs
          "-i",
          "pipe:3",
          // trim audio
          "-ss",
          trim.start,
          "-to",
          trim.end,
          // Choose some fancy codes
          "-vn",
          "-ab",
          "128K",
          "-ar",
          "44100",
          // Define output container
          "-f",
          "mp3",
          "pipe:4",
        ],
        {
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
        }
      );

      ffmpegProcess.on("close", () => {
        process.stdout.write("\n");
      });

      ffmpegProcess.on("error", (err) => {
        console.log("Error stack: ", err.stack);
      });

      audio.pipe(ffmpegProcess.stdio[3] as any);
      ffmpegProcess.stdio[4]?.pipe(res);
    } else {
      // transform audio to mp3
      const ffmpegProcess = cp.spawn(
        ffmpeg || "d:\\ffmpeg\\bin\\ffmpeg.exe",
        [
          // Remove ffmpeg's console spamming
          "-loglevel",
          "0",
          "-hide_banner",
          // inputs
          "-i",
          "pipe:3",
          // Choose some fancy codes
          "-vn",
          "-ab",
          "128K",
          "-ar",
          "44100",
          // Define output container
          "-f",
          "mp3",
          "pipe:4",
        ],
        {
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
        }
      );

      ffmpegProcess.on("close", () => {
        process.stdout.write("\n");
      });

      ffmpegProcess.on("error", (err) => {
        console.log("Error stack: ", err.stack);
      });

      audio.pipe(ffmpegProcess.stdio[3] as any);
      ffmpegProcess.stdio[4]?.pipe(res);
    }
  }

  // 18 = 360p this always come with audio so we don't need to download audio
  if (!isAudio && quality === 18) {
    const info = await ytdl.getInfo(url);

    // get 360p video
    const format = ytdl.chooseFormat(info.formats, { quality: quality });

    const video = ytdl(url, { format });

    // set content length
    res.setHeader("Content-Length", format.contentLength);

    // if trim is set then trim the video
    if (trim) {
      const ffmpegProcess = cp.spawn(
        ffmpeg || "d:\\ffmpeg\\bin\\ffmpeg.exe",
        [
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
          // support quicktime
          "-pix_fmt",
          "yuv420p",
          // Define output container
          "-f",
          "matroska",
          "pipe:4",
        ],
        {
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
        }
      );

      ffmpegProcess.on("close", () => {
        process.stdout.write("\n");
      });

      ffmpegProcess.on("error", (err) => {
        console.log("Error stack: ", err.stack);
      });

      video.pipe(ffmpegProcess.stdio[3] as any);
      ffmpegProcess.stdio[4]?.pipe(res);
    } else {
      // if trim is not set then just download the video
      video.pipe(res);
    }
  } else if (!isAudio && quality !== 18) {
    // download video with audio
    downloadVideoWithAudio({ url, quality, trim }, res);
  }
};
