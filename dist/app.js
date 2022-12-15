"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const video_routes_1 = __importDefault(require("./routes/video.routes"));
const app = (0, express_1.default)();
const allowedOrigins = [
    "http://localhost:3000",
    "https://yt-downloader-jet.vercel.app/",
];
// settings
app.set("port", process.env.PORT || 8000);
// middlewares
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            var msg = "The CORS policy for this site does not " +
                "allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
}));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
// routes
app.use("/api/video", video_routes_1.default);
app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the API" });
});
// start
app.listen(app.get("port"), () => {
    console.log("Server on port", app.get("port"));
});
