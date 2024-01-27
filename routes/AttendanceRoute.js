import express from "express";
import { param } from "express-validator";
import {
  Register as RegisterAttendance,
  DeleteAttendance,
  AttendanceInfo,
} from "../controller/Attendance.js";
import fieldHandler from "../middleware/fieldHandler.js";

const router = express.Router();

router.post(
  "/attendance/register/:rfid_tag",
  param("rfid_tag").trim().notEmpty().withMessage("RFID Tag is required"),
  fieldHandler,
  RegisterAttendance
);

router.delete(
  "/attendance/delete/:attendance_id",
  param("attendance_id")
    .trim()
    .notEmpty()
    .withMessage("Attendance ID is required"),
  fieldHandler,
  DeleteAttendance
);

router.get(
  "/attendance/:attendance_id",
  param("attendance_id")
    .trim()
    .notEmpty()
    .withMessage("Attendance ID is required"),
  fieldHandler,
  AttendanceInfo
);

export default router;
