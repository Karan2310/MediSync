import ShortUniqueId from "short-unique-id";
import HospitalSchema from "../models/HospitalSchema.js";
import DoctorSchema from "../models/DoctorSchema.js";
import ImageSchema from "../models/ImageSchema.js";
import { calculateTotalMinutes } from "../utils/Function.js";
import ErrorResponse from "../utils/errorResponse.js";
import {
  AllocateAppointmentSlot,
  AllocateTodayAppointmentSlot,
} from "./Appointment.js";

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

const HospitalSpecialization = async (req, res, next) => {
  const { hospital_id } = req.params;
  try {
    const specialization = await DoctorSchema.find({
      hospital_id,
    })
      .distinct("specialization")
      .lean();
    res.status(200).json(specialization);
  } catch (err) {
    next(err);
  }
};

const HospitalSpecializedDoctors = async (req, res, next) => {
  const { hospital_id, specialization } = req.params;
  try {
    const doctors = await DoctorSchema.find({
      hospital_id,
      specialization,
    }).lean();
    for (let doctor of doctors) {
      const today = new Date();
      const sorted_availability = doctor.availability.sort(
        (dateA, dateB) => Number(dateA.date) - Number(dateB.date)
      );
      doctor.availability = sorted_availability;
      const filter_availability = doctor.availability.filter((item) => {
        const itemDate = new Date(item.date);
        return itemDate >= today;
      });
      doctor.availability = filter_availability;
    }
    res.status(200).json(doctors);
  } catch (err) {
    next(err);
  }
};

const SpecializedHospitals = async (req, res, next) => {
  try {
    const { specialization } = req.params;
    const hospital_ids = await DoctorSchema.find({
      specialization,
    }).distinct("hospital_id");
    const hospitals = await HospitalSchema.find({
      _id: {
        $in: hospital_ids,
      },
    }).lean();
    res.status(200).json(hospitals);
  } catch (err) {
    next(err);
  }
};

const AllocateDoctorSlot = async () => {
  const hospitals = await HospitalSchema.find().lean();
  for (let hospital of hospitals) {
    const doctors = await DoctorSchema.find({
      hospital_id: hospital._id,
    }).lean();
    for (let doctor of doctors) {
      await AllocateAppointmentSlot(doctor._id);
    }
  }
};

const AllocateTodayDoctorSlot = async () => {
  const hospitals = await HospitalSchema.find().lean();
  for (let hospital of hospitals) {
    const doctors = await DoctorSchema.find({
      hospital_id: hospital._id,
    }).lean();
    for (let doctor of doctors) {
      await AllocateTodayAppointmentSlot(doctor._id);
    }
  }
};

const SuggestDoctor = async (req, res, next) => {
  try {
    const { symptoms } = req.body;
    const { data } = await axios.post(
      `${FLASK_URL}/api/max_no_of_specialization`,
      {
        symptoms,
      }
    );
    const specialization = data;
    const doctors = await DoctorSchema.aggregate([
      {
        $match: {
          specialization,
        },
      },
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
        $lookup: {
          from: "appointments",
          localField: "_id",
          foreignField: "doctor_id",
          as: "appointments",
        },
      },
    ])
      .project({
        _id: 1,
        name: 1,
        specialization: 1,
        hospital_id: 1,
        "hospital.name": 1,
        rating: {
          $avg: "$appointments.rating",
        },
      })
      .sort({
        rating: -1,
      })
      .limit(5);
    res.status(200).json(doctors);
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
};

export {
  Register,
  DeleteDoctor,
  DoctorInfo,
  HospitalDoctorsList,
  AllDoctors,
  HospitalSpecialization,
  HospitalSpecializedDoctors,
  SpecializedHospitals,
  AllocateDoctorSlot,
  AllocateTodayDoctorSlot,
  SuggestDoctor,
};
