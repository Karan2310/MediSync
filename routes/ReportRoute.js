import express from "express";
import { body, param } from "express-validator";
import {
  PatientRegister,
  DoctorRegister,
  DeleteReport,
  ReportInfo,
} from "../controller/Report.js";
import fieldHandler from "../middleware/fieldHandler.js";

const router = express.Router();

router.post(
  "/report/register/patient",
  body("patient_id").trim().notEmpty().withMessage("Patient ID is required"),
  fieldHandler,
  PatientRegister
);

router.post(
  "/report/register/doctor",
  body("patient_id").trim().notEmpty().withMessage("Patient ID is required"),
  body("doctor_id").trim().notEmpty().withMessage("Doctor ID is required"),
  fieldHandler,
  DoctorRegister
);

router.delete(
  "/report/delete/:report_id",
  param("report_id").trim().notEmpty().withMessage("Report ID is required"),
  fieldHandler,
  DeleteReport
);

router.get(
  "/report/:report_id",
  param("report_id").trim().notEmpty().withMessage("Report ID is required"),
  fieldHandler,
  ReportInfo
);

export default router;
