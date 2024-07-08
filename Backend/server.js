import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import router from "./Routes/userRoutes.js";
import dbConn from "./utlies/dbConn.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

dbConn();

app.use("/user", router);

app.get("/", (req, res) => {
  res.send("this is from backend");
});

app.listen(PORT, () => {
  console.log(`Server connected on port ${PORT}`);
});
