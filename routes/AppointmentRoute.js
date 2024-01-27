import express from "express";
import {
  OnlineRegister as AppointmentOnlineRegister,
  WalkInRegister as AppointmentWalkInRegister,
  UpdateRating as UpdateAppointmentRating,
  DeleteAppointment,
  AppointmentInfo,
  DoctorAvailableSlots,
  MarkAsDone,
} from "../controller/Appointment.js";

const router = express.Router();

router.post("/appointment/online/register", AppointmentOnlineRegister);
router.post("/appointment/walk_in/register", AppointmentWalkInRegister);
router.put("/appointment/rating/:appointment_id", UpdateAppointmentRating);
router.delete("/appointment/delete/:appointment_id", DeleteAppointment);
router.get("/appointment/:appointment_id", AppointmentInfo);
router.post("/appointment/doctor/slots/:type/:doctor_id", DoctorAvailableSlots);
router.put("/appointment/mark_as_done/:appointment_id", MarkAsDone);

export default router;
