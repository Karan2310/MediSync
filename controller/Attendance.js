import AttendanceSchema from "../models/AttendanceSchema.js";
import DoctorSchema from "../models/DoctorSchema.js";
import LogSchema from "../models/LogSchema.js";
import ErrorResponse from "../utils/errorResponse.js";

const Register = async (req, res, next) => {
  try {
    const { rfid_tag } = req.params;
    const doctor = await DoctorSchema.findOne({ rfid_tag });
    if (!doctor) throw new ErrorResponse("Doctor not found", 400);
    const response = await AttendanceSchema.findOne({
      doctor_id: doctor._id,
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59)),
      },
    });
    if (!response) {
      const attendance = await AttendanceSchema.create({
        doctor_id: doctor._id,
        date: new Date(),
        checkIn: new Date(),
      });
      await LogSchema.create({
        doctor_id: doctor._id,
        type: "RFID",
        status: "Check In",
      });
      return res.status(200).send(attendance._id);
    }
    if (!response.checkOut) {
      response.checkOut = new Date();
      await response.save();
      await LogSchema.create({
        doctor_id: doctor._id,
        type: "RFID",
        status: "Check Out",
      });
      return res.status(200).send(response._id);
    }

    res.status(200).send("Doctor already checked in and out");
  } catch (err) {
    next(err);
  }
};

const DeleteAttendance = async (req, res, next) => {
  try {
    const { attendance_id } = req.params;
    await AttendanceSchema.findByIdAndDelete(attendance_id);
    res.status(200).send("Attendance successfully deleted");
  } catch (err) {
    next(err);
  }
};

const AttendanceInfo = async (req, res, next) => {
  try {
    const { attendance_id } = req.params;
    const attendance = await AttendanceSchema.findById(attendance_id).lean();
    res.status(200).json(attendance);
  } catch (err) {
    next(err);
  }
};

export { Register, DeleteAttendance, AttendanceInfo };
