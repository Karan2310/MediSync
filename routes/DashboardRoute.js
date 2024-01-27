import express from "express";
import { Hospital, Doctor } from "../controller/Dashboard.js";

const router = express.Router();

router.get("/dashboard/hospital/:hospital_id", Hospital);
router.get("/dashboard/doctor/:doctor_id", Doctor);

export default router;
