import express from "express";
import {
  Register as RegisterHospital,
  AllHospitals,
} from "../controller/Hospital.js";
import { RegistrationMail } from "../middleware/Email.js";

const router = express.Router();

router.post("/hospital/register", RegisterHospital, RegistrationMail);
router.get("/hospitals", AllHospitals);

export default router;
