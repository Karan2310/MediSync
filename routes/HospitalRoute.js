import express from "express";
import { body, param } from "express-validator";
import {
  Register as RegisterHospital,
  DeleteHospital,
  HospitalInfo,
  AllHospitals,
} from "../controller/Hospital.js";
import { HospitalLogin } from "../controller/Login.js";
import { RegistrationMail } from "../middleware/Email.js";
import fieldHandler from "../middleware/fieldHandler.js";

const router = express.Router();

router.post(
  "/hospital/login",
  body("username").trim().notEmpty().withMessage("Username is required"),
  body("password").trim().notEmpty().withMessage("Password is required"),
  fieldHandler,
  HospitalLogin
);

router.post(
  "/hospital/register",
  body("hospital_name")
    .trim()
    .notEmpty()
    .withMessage("Hospital Name is required"),
  body("coordinates.latitude")
    .trim()
    .notEmpty()
    .withMessage("Latitude is required"),
  body("coordinates.longitude")
    .trim()
    .notEmpty()
    .withMessage("Longitude is required"),
  body("address.street").trim().notEmpty().withMessage("Street is required"),
  body("address.city").trim().notEmpty().withMessage("City is required"),
  body("address.state").trim().notEmpty().withMessage("Sate is required"),
  body("address.zipCode")
    .trim()
    .notEmpty()
    .withMessage("Zip Code is required")
    .isLength(6)
    .withMessage("Zip Code length should be 6")
    .isNumeric()
    .withMessage("Zip Code should be numeric"),
  body("address.country").trim().notEmpty().withMessage("Country is required"),
  body("contact_details.phone_number")
    .trim()
    .notEmpty()
    .withMessage("Phone Number is required")
    .isMobilePhone()
    .withMessage("Phone Number is invalid"),
  body("contact_details.email_address")
    .trim()
    .notEmpty()
    .withMessage("Email Address is required")
    .isEmail()
    .withMessage("Email Address is invalid"),
  fieldHandler,
  RegisterHospital,
  RegistrationMail
);

router.delete(
  "/hospital/delete/:hospital_id",
  param("hospital_id").trim().notEmpty().withMessage("Hospital ID is required"),
  fieldHandler,
  DeleteHospital
);

router.get(
  "/hospital/:hospital_id",
  param("hospital_id").trim().notEmpty().withMessage("Hospital ID is required"),
  fieldHandler,
  HospitalInfo
);

router.get("/hospitals", AllHospitals);

export default router;
