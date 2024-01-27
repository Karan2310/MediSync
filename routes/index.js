import express from "express";
import { param } from "express-validator";
import fieldHandler from "../middleware/fieldHandler.js";

const router = express.Router();

router.get("/logout", async (req, res) => {
  res.clearCookie("_id").status(200).end();
});

router.get(
  "/image/:image_name",
  param("image_name").trim().notEmpty().withMessage("Image Name is required"),
  fieldHandler,
  async (req, res, next) => {
    try {
      const { image_name } = req.params;

      const { contentType, data } = await ImageSchema.findById(
        image_name.split("-")[0]
      );
      res.contentType(contentType).send(data);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
