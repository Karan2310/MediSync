import DoctorSchema from "../models/DoctorSchema.js";
import LogSchema from "../models/LogSchema.js";
import ErrorResponse from "../utils/errorResponse.js";

const CCTVRegister = async (req, res, next) => {
  try {
    const { photo_id, status } = req.body;
    const doctor = await DoctorSchema.findOne({ photo_id }).select("_id");
    if (!doctor) throw new ErrorResponse("Doctor not found", 404);
    const log = await LogSchema.create({
      doctor_id: doctor._id,
      type: "CCTV Camera",
      status: "Found in " + status,
    });
    res.status(200).send(log._id);
  } catch (err) {
    next(err);
  }
};

const AllDoctorsPhotoURL = async (req, res, next) => {
  try {
    const response = await DoctorSchema.find()
      .select(["name", "photo_id"])
      .lean();
    const BASE_URL = `${req.protocol}://${req.get("host")}`;
    const photos = [];

    response.map((doctor) => {
      if (doctor.photo_id) {
        photos.push(`${BASE_URL}/api/image/${doctor.photo_id}-${doctor.name}`);
      }
    });
    res.status(200).json(photos);
  } catch (err) {
    next(err);
  }
};

const DeleteLog = async (req, res, next) => {
  try {
    const { log_id } = req.params;
    await AttendanceSchema.findByIdAndDelete(log_id);
    res.status(200).send("Log successfully deleted");
  } catch (err) {
    next(err);
  }
};

const LogInfo = async (req, res) => {
  try {
    const { log_id } = req.params;
    const log = await AttendanceSchema.findById(log_id).lean();
    res.status(200).json(log);
  } catch (err) {
    next(err);
  }
};

export { CCTVRegister, DeleteLog, LogInfo, AllDoctorsPhotoURL };
