import express from "express";
import { body, param } from "express-validator";
import {
  Register as RegisterDoctor,
  DeleteDoctor,
  DoctorInfo,
  HospitalDoctorsList,
  AllDoctors,
  HospitalSpecialization,
  HospitalSpecializedDoctors,
  SpecializedHospitals,
} from "../controller/Doctor.js";
import { DoctorLogin } from "../controller/Login.js";
import fieldHandler from "../middleware/fieldHandler.js";

const router = express.Router();

router.post(
  "/doctor/login",
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
  fieldHandler,
  DoctorLogin
);

router.post(
  "/doctor/register/:hospital_id",
  param("hospital_id").trim().notEmpty().withMessage("Hospital ID is required"),
  body("doctor_name").trim().notEmpty().withMessage("Doctor Name is required"),
  body("rfid_tag").trim().notEmpty().withMessage("RFID Tag is required"),
  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),
  body("experience").trim().notEmpty().withMessage("Experience is required"),
  body("age").trim().notEmpty().withMessage("Age is required"),
  body("license_number")
    .trim()
    .notEmpty()
    .withMessage("License Number is required"),
  body("average_time")
    .trim()
    .notEmpty()
    .withMessage("Average Time is required"),
  body("gender").trim().notEmpty().withMessage("Gender is required"),
  body("fees").trim().notEmpty().withMessage("Fees is required"),
  body("phone_number")
    .trim()
    .notEmpty()
    .withMessage("Phone Number is required"),
  body("start_time").trim().notEmpty().withMessage("Start Time is required"),
  body("end_time").trim().notEmpty().withMessage("End Time is required"),
  fieldHandler,
  RegisterDoctor
);

router.delete(
  "/doctor/delete/:doctor_id",
  param("doctor_id").trim().notEmpty().withMessage("Doctor ID is required"),
  fieldHandler,
  DeleteDoctor
);

router.get(
  "/doctor/:doctor_id",
  param("doctor_id").trim().notEmpty().withMessage("Doctor ID is required"),
  fieldHandler,
  DoctorInfo
);

router.get(
  "/doctor/hospital/:hospital_id",
  param("hospital_id").trim().notEmpty().withMessage("Hospital ID is required"),
  fieldHandler,
  HospitalDoctorsList
);

router.get("/doctors", AllDoctors);

router.get(
  "/doctors/specialization/:hospital_id",
  param("hospital_id").trim().notEmpty().withMessage("Hospital ID is required"),
  fieldHandler,
  HospitalSpecialization
);

router.get(
  "/doctors/specialization/:hospital_id/:specialization",
  param("hospital_id").trim().notEmpty().withMessage("Hospital ID is required"),
  param("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),
  fieldHandler,
  HospitalSpecializedDoctors
);

router.get(
  "/hospitals/specialization/:specialization",
  param("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required"),
  fieldHandler,
  SpecializedHospitals
);

export default router;
