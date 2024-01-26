import ShortUniqueId from "short-unique-id";
import DoctorSchema from "../models/DoctorSchema.js";
import ImageSchema from "../models/ImageSchema.js";
import { calculateTotalMinutes } from "../utils/Function.js";
import ErrorResponse from "../utils/errorResponse.js";

const { randomUUID } = new ShortUniqueId({ length: 8 });

const Register = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;
    const { image } = req.files;
    const {
      rfid_tag,
      doctor_name,
      specialization,
      experience,
      age,
      license_number,
      availability,
      average_time,
      gender,
      fees,
      phone_number,
      start_time,
      end_time,
    } = req.body;
    if (!image) throw new ErrorResponse("No file is uploaded", 400);

    const username = randomUUID();
    const password = randomUUID();

    const totalMinutes = calculateTotalMinutes(start_time, end_time);
    const totalCount = totalMinutes / parseInt(average_time);
    const online = Math.round(totalCount * 0.5);
    const walk_in = Math.round(totalCount * 0.5);

    const doctor = await DoctorSchema({
      hospital_id,
      rfid_tag,
      name: doctor_name,
      mac_address: "AFKS" + randomUUID(),
      specialization,
      experience,
      age,
      license_number,
      availability: JSON.parse(availability),
      slot_count: {
        online,
        walk_in,
      },
      average_time,
      gender,
      fees,
      phone_number,
      username,
      password,
    });

    const response = await ImageSchema.create({
      data: image.data,
      contentType: image.mimetype,
    });

    doctor.photo_id = response._id;
    await doctor.save();

    return res.status(200).json({
      _id: doctor._id,
      username,
      password,
    });
  } catch (err) {
    next(err);
  }
};

const DeleteDoctor = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;
    await DoctorSchema.findByIdAndDelete(doctor_id);
    res.status(200).send("Doctor successfully deleted");
  } catch (err) {
    next(err);
  }
};

const DoctorInfo = async (req, res, next) => {
  try {
    const { doctor_id } = req.params;
    const doctor = await DoctorSchema.findById(doctor_id).lean();
    res.status(200).json(doctor);
  } catch (err) {
    next(err);
  }
};

const HospitalDoctorsList = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;
    const doctors = await DoctorSchema.find({
      hospital_id: hospital_id,
    })
      .sort({
        createdAt: -1,
      })
      .lean();
    res.status(200).json(doctors);
  } catch (err) {
    next(err);
  }
};

const AllDoctors = async (req, res, next) => {
  try {
    const doctors = await DoctorSchema.aggregate([
      {
        $lookup: {
          from: "hospitals",
          localField: "hospital_id",
          foreignField: "_id",
          as: "hospital",
        },
      },
      {
        $unwind: "$hospital",
      },
      {
        $sort: {
          "hospital.createdAt": -1,
          createdAt: -1,
        },
      },
    ]);
    res.status(200).json(doctors);
  } catch (err) {
    next(err);
  }
};

export { Register, DeleteDoctor, DoctorInfo, HospitalDoctorsList, AllDoctors };
