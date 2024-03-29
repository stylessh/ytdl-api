import express from "express";
import cors from "cors";
import morgan from "morgan";

import videoRoutes from "./routes/video.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://yt-downloader-jet.vercel.app",
  "https://www.slicetube.io",
];

// settings
app.set("port", process.env.PORT || 8000);

// middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        var msg =
          "The CORS policy for this site does not " +
          "allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

app.use(morgan("short"));

app.use(
  express.json({
    limit: "5000mb",
  })
);

// url enconded
app.use(
  express.urlencoded({
    limit: "5000mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// routes
app.use("/api/video", videoRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Welcome to the API" });
});

// start
app.listen(app.get("port"), () => {
  console.log("Server on port", app.get("port"));
});
