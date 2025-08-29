import mongoose from "mongoose";
import { config } from "./index.js";
import scheduler from "../utils/scheduler.js";

export const connectDb = () =>
  mongoose
    .connect(config.mongoUrl)
    .then(() => {
      console.log("MongoDb is connected");
      scheduler.start();
    })
    .catch((err) => {
      console.log(err);
    });
