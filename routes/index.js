import express from "express";
import { param } from "express-validator";
import fieldHandler from "../middleware/fieldHandler.js";

const router = express.Router();

router.get(
  "/image/:image_id",
  param("doctor_id").trim().notEmpty().withMessage("Doctor ID is required"),
  fieldHandler,
  async (req, res, next) => {
    try {
      const { image_id } = req.params;

      const { contentType, data } = await ImageSchema.findById(image_id);
      res.contentType(contentType).send(data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
