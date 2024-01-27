import PatientSchema from "../models/PatientSchema.js";
import ErrorResponse from "../utils/errorResponse.js";

const VerifyPatient = async (req, res, next) => {
  try {
    const { phone_number } = req.params;
    const response = await PatientSchema.findOne({
      phone_number,
    })
      .select(["_id"])
      .lean();
    if (!response) throw new ErrorResponse("Patient not found", 404);
    res
      .cookie("_id", response._id, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .status(200)
      .send(response._id);
  } catch (err) {
    next(err);
  }
};

const DeletePatient = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    await PatientSchema.findByIdAndDelete(patient_id);
    res.status(200).send("Patient successfully deleted");
  } catch (err) {
    next(err);
  }
};

const PatientInfo = async (req, res, next) => {
  try {
    const { patient_id } = req.params;
    const patient = await PatientSchema.findById(patient_id).lean();
    res.status(200).json(patient);
  } catch (err) {
    next(err);
  }
};

export { VerifyPatient, DeletePatient, PatientInfo };
