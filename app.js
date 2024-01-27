import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import db from "./config/db.js";
db();
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import errorHandler from "./middleware/errorHandler.js";
import HospitalRoute from "./routes/HospitalRoute.js";
import DoctorRoute from "./routes/DoctorRoute.js";
import DashboardRoute from "./routes/DashboardRoute.js";
import LogRoute from "./routes/LogRoute.js";
import AttendanceRoute from "./routes/AttendanceRoute.js";
import PatientRoute from "./routes/PatientRoute.js";
import IndexRoute from "./routes/index.js";

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(fileUpload());

app.use("/api", HospitalRoute);
app.use("/api", DoctorRoute);
app.use("/api", DashboardRoute);
app.use("/api", LogRoute);
app.use("/api", AttendanceRoute);
app.use("/api", PatientRoute);
app.use("/api", IndexRoute);

app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("MediSync is up and running!!");
});

app.listen(port, () => console.log(`http://localhost:${port}`));
