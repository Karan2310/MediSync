import ReportSchema from "../models/ReportSchema.js";
import ImageSchema from "../models/ImageSchema.js";
import ErrorResponse from "../utils/errorResponse.js";

const PatientRegister = async (req, res, next) => {
  try {
    const { patient_id, disease } = req.body;
    const { image } = req.files;
    if (!image) throw new ErrorResponse("No file is uploaded", 400);
    const report = await ReportSchema({
      patient_id,
      type: "patient",
      disease: JSON.parse(disease),
    });
    const response = await ImageSchema.create({
      data: image.data,
      contentType: image.mimetype,
    });
    report.report_id = response._id;
    await report.save();
    return res.status(200).send(report._id);
  } catch (err) {
    next(err);
  }
};

const DoctorRegister = async (req, res, next) => {
  try {
    const { patient_id, doctor_id } = req.body;
    const { image } = req.body;
    if (!image) throw new ErrorResponse("No file is uploaded", 400);
    const report = await ReportSchema({
      patient_id,
      doctor_id,
      type: "doctor",
    });
    const response = await ImageSchema.create({
      data: image,
      contentType: "image/png",
    });
    report.report_id = response._id;
    await report.save();
    return res.status(200).send(report._id);
  } catch (err) {
    next(err);
  }
};

const DeleteReport = async (req, res, next) => {
  try {
    const { report_id } = req.params;
    await ReportSchema.findByIdAndDelete(report_id);
    res.status(200).send("Report successfully deleted");
  } catch (err) {
    next(err);
  }
};

const ReportInfo = async (req, res, next) => {
  try {
    const { report_id } = req.params;
    const report = await ReportSchema.findById(report_id).lean();
    res.status(200).json(report);
  } catch (err) {
    next(err);
  }
};

export { PatientRegister, DoctorRegister, DeleteReport, ReportInfo };
