import express from "express";
import { body, param } from "express-validator";
import {
  CCTVRegister,
  DeleteLog,
  LogInfo,
  AllDoctorsPhotoURL,
} from "../controller/Log.js";
import fieldHandler from "../middleware/fieldHandler.js";

const router = express.Router();

router.post(
  "/log/cctv/register",
  body("photo_id").trim().notEmpty().withMessage("Photo ID is required"),
  body("status").trim().notEmpty().withMessage("Status is required"),

  fieldHandler,
  CCTVRegister
);

router.delete(
  "/log/delete/:log_id",
  param("log_id").trim().notEmpty().withMessage("Log ID is required"),
  fieldHandler,
  DeleteLog
);
router.get(
  "/log/:log_id",
  param("log_id").trim().notEmpty().withMessage("Log ID is required"),
  fieldHandler,
  LogInfo
);

router.get("/photos", AllDoctorsPhotoURL);

export default router;
