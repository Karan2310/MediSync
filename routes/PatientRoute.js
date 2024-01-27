import express from "express";
import { body, param } from "express-validator";
import {
  VerifyPatient,
  DeletePatient,
  PatientInfo,
} from "../controller/Patient.js";
import { PatientLogin } from "../controller/Login.js";
import fieldHandler from "../middleware/fieldHandler.js";

const router = express.Router();

router.get(
  "/patient/verify/:phone_number",
  param("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Phone Number is required"),
  fieldHandler,
  VerifyPatient
);

router.post(
  "/patient/login",
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("age")
    .trim()
    .notEmpty()
    .withMessage("Age is required")
    .isNumeric()
    .withMessage("Age must be a number"),
  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Phone Number is required"),
  body("gender").trim().notEmpty().withMessage("Gender is required"),
  body("habits").trim().notEmpty().withMessage("Habits is required"),
  body("lifestyle").trim().notEmpty().withMessage("Lifestyle is required"),
  fieldHandler,
  PatientLogin
);

router.delete(
  "/patient/delete/:patient_id",
  param("patient_id").trim().notEmpty().withMessage("Patient ID is required"),
  fieldHandler,
  DeletePatient
);
router.get(
  "/patient/:patient_id",
  param("patient_id").trim().notEmpty().withMessage("Patient ID is required"),
  fieldHandler,
  PatientInfo
);

export default router;
