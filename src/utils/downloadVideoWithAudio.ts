import { Response } from "express";
import ytdl from "ytdl-core";
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

export default async function downloadVideoWithAudio(
  data: BodyData,
  res: Response
) {
  const info = await ytdl.getInfo(data.url);

  const videoFormat = ytdl.chooseFormat(info.formats, {
    quality: data.quality,
    filter: "videoonly",
  });

  //  get highest quality audio
  const audioFormat = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
    filter: "audioonly",
  });

  //   download video and audio and merge them into one file using ffmpeg
  const video = ytdl(data.url, { format: videoFormat });
  const audio = ytdl(data.url, { format: audioFormat });

  // set content length
  res.setHeader("Content-Length", videoFormat.contentLength);

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
      "-i",
      "pipe:4",
      // if trim is set then trim the video
      ...(data.trim ? ["-ss", data.trim.start, "-to", data.trim.end] : []),
      // Choose some fancy codes
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      // support quicktime
      "-pix_fmt",
      "yuv420p",
      // Define output container
      "-f",
      "matroska",
      "pipe:5",
    ],
    {
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
    }
  );

  ffmpegProcess.on("close", () => {
    process.stdout.write("\n");
  });

  ffmpegProcess.on("error", (err) => {
    console.log("Error stack: ", err.stack);
  });

  video.on("error", (err) => {
    console.log("Error stack: ", err.stack);
  });

  audio.on("error", (err) => {
    console.log("Error stack: ", err.stack);
  });

  audio.pipe(ffmpegProcess.stdio[3] as any);
  video.pipe(ffmpegProcess.stdio[4] as any);

  // ignore error of index
  // @ts-ignore
  ffmpegProcess.stdio[5]?.pipe(res, {
    end: true,
  });
}
