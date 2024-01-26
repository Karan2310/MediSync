import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import db from "./config/db.js";
db();
import cookieParser from "cookie-parser";
import errorHandler from "./middleware/errorHandler.js";
// const IndexRoute = require("./routes/index");
// const ClientSideRoute = require("./routes/clientSide");
// const CookieRoute = require("./routes/cookie");
import HospitalRoute from "./routes/HospitalRoute.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/api", HospitalRoute);
// app.use("/api/field", IndexRoute);
// app.use("/api/auth/client", ClientSideRoute);
// app.use("/api/cookie", CookieRoute);

app.use(errorHandler);

app.listen(port, () => console.log(`http://localhost:${port}`));
