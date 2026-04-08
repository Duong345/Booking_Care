import express from "express";
import bodyParser from "body-parser";
import viewEngine from "./config/viewEngine";
import initWebRoute from "./route/web";
import connectDB from "../config/connectDB";
import cors from "cors";
require("dotenv").config();
let app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
viewEngine(app);
initWebRoute(app);
connectDB();
let port = process.env.PORT || 8080;
app.listen(process.env.PORT || 8080, () => {
  console.log("Server is running on port " + (process.env.PORT || 8080));
});
