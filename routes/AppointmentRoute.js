import express from "express";
import { body, param } from "express-validator";
import {
  OnlineRegister as AppointmentOnlineRegister,
  WalkInRegister as AppointmentWalkInRegister,
  UpdateRating as UpdateAppointmentRating,
  DeleteAppointment,
  AppointmentInfo,
  DoctorAvailableSlots,
  MarkAsDone,
} from "../controller/Appointment.js";
import fieldHandler from "../middleware/fieldHandler.js";

const router = express.Router();

router.post(
  "/appointment/online/register",
  body("hospital_id").trim().notEmpty().withMessage("Hospital ID is required"),
  body("doctor_id").trim().notEmpty().withMessage("Doctor ID is required"),
  body("patient_id").trim().notEmpty().withMessage("Patient ID is required"),
  body("date").trim().notEmpty().withMessage("Date is required"),
  body("time_slot").trim().notEmpty().withMessage("Time Slot is required"),
  body("auto_booked").trim().notEmpty().withMessage("Auto Booked is required"),
  fieldHandler,
  AppointmentOnlineRegister
);

router.post(
  "/appointment/walk_in/register",
  body("hospital_id").trim().notEmpty().withMessage("Hospital ID is required"),
  body("doctor_id").trim().notEmpty().withMessage("Doctor ID is required"),
  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Phone Number is required"),
  body("date").trim().notEmpty().withMessage("Date is required"),
  body("time_slot").trim().notEmpty().withMessage("Time Slot is required"),
  fieldHandler,
  AppointmentWalkInRegister
);

router.put(
  "/appointment/rating/:appointment_id",
  param("appointment_id")
    .trim()
    .notEmpty()
    .withMessage("Appointment ID is required"),
  fieldHandler,
  UpdateAppointmentRating
);

router.delete(
  "/appointment/delete/:appointment_id",
  param("appointment_id")
    .trim()
    .notEmpty()
    .withMessage("Appointment ID is required"),
  fieldHandler,
  DeleteAppointment
);

router.get(
  "/appointment/:appointment_id",
  param("appointment_id")
    .trim()
    .notEmpty()
    .withMessage("Appointment ID is required"),
  fieldHandler,
  AppointmentInfo
);

router.post(
  "/appointment/doctor/slots/:type/:doctor_id",
  param("type").trim().notEmpty().withMessage("Type is required"),
  param("doctor_id").trim().notEmpty().withMessage("Doctor ID is required"),
  fieldHandler,
  DoctorAvailableSlots
);

router.put(
  "/appointment/mark_as_done/:appointment_id",
  param("appointment_id")
    .trim()
    .notEmpty()
    .withMessage("Appointment ID is required"),
  fieldHandler,
  MarkAsDone
);

export default router;
