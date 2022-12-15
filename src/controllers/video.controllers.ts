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

export const download = async (req: Request, res: Response) => {
  const { url, quality, trim } = req.body as BodyData;

//   console.log("trim", trim);

  res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
  res.setHeader("Content-Type", "video/mp4");

  // 18 = 360p this always come with audio so we don't need to download audio
  if (quality === 18) {
    const info = await ytdl.getInfo(url);

    // get 360p video
    const format = ytdl.chooseFormat(info.formats, { quality: quality });

    const video = ytdl(url, { format });

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

      video.pipe(ffmpegProcess.stdio[3] as any);
      ffmpegProcess.stdio[4]?.pipe(res);
    } else {
      // if trim is not set then just download the video
      video.pipe(res);
    }
  } else {
    // download video with audio
    downloadVideoWithAudio({ url, quality, trim }, res);
  }
};

export const config = {
  api: {
    responseLimit: false,
  },
};
