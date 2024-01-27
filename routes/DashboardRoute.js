import express from "express";
import { param } from "express-validator";
import { Hospital, Doctor } from "../controller/Dashboard.js";
import fieldHandler from "../middleware/fieldHandler.js";

const router = express.Router();

router.get(
  "/dashboard/hospital/:hospital_id",
  param("hospital_id").trim().notEmpty().withMessage("Hospital ID is required"),
  fieldHandler,
  Hospital
);
router.get(
  "/dashboard/doctor/:doctor_id",
  param("doctor_id").trim().notEmpty().withMessage("Doctor ID is required"),
  fieldHandler,
  Doctor
);

export default router;
