import DoctorSchema from "../models/DoctorSchema.js";
import AppointmentSchema from "../models/AppointmentSchema.js";
import AttendanceSchema from "../models/AttendanceSchema.js";
import LogSchema from "../models/LogSchema.js";
import PatientSchema from "../models/PatientSchema.js";
import HospitalSchema from "../models/HospitalSchema.js";
import ErrorResponse from "../utils/errorResponse.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const Hospital = async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  try {
    const { hospital_id } = req.params;
    const hospital = await HospitalSchema.findById(hospital_id).lean();
    if (!hospital) throw new ErrorResponse("Hospital not found", 404);
    const doctor_ids = await DoctorSchema.find({
      hospital_id: new ObjectId(hospital_id),
    })
      .distinct("_id")
      .lean();
    const today_doctor_attendance_ids = await AttendanceSchema.find({
      doctor_id: {
        $in: doctor_ids,
      },
      createdAt: {
        $gte: today,
        $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .sort({ createdAt: -1 })
      .distinct("doctor_id")
      .lean();
    const today_doctor_available = await DoctorSchema.find({
      hospital_id: new ObjectId(hospital_id),
      _id: {
        $in: today_doctor_attendance_ids,
      },
    }).lean();
    hospital.doctor_available = today_doctor_available;
    hospital.doctor_available_count = today_doctor_available.length;
    const treated_patient_ids = await AppointmentSchema.find({
      hospital_id: new ObjectId(hospital_id),
      treated: true,
    })
      .distinct("patient_id")
      .lean();
    const treated_patient = await PatientSchema.find({
      _id: {
        $in: treated_patient_ids,
      },
    }).lean();
    hospital.treated_patient = treated_patient;
    hospital.treated_patient_count = treated_patient.length;
    const today_non_treated_patient = await AppointmentSchema.aggregate([
      {
        $match: {
          hospital_id: new ObjectId(hospital_id),
          date: {
            $gte: today,
            $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
          treated: false,
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: "$doctor",
      },
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: "$patient",
      },
    ]);
    hospital.today_non_treated_patient = today_non_treated_patient;
    hospital.today_non_treated_patient_count = today_non_treated_patient.length;
    const today_treated_patient = await AppointmentSchema.find({
      hospital_id: new ObjectId(hospital_id),
      date: {
        $gte: today,
        $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
      treated: true,
    }).lean();
    hospital.today_treated_patient_count = today_treated_patient.length;
    hospital.today_patient_count =
      today_treated_patient.length + today_non_treated_patient.length;
    res.status(200).json(hospital);
  } catch (err) {
    next(err);
  }
};

const Doctor = async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  try {
    const { doctor_id } = req.params;
    const doctor = await DoctorSchema.findById(doctor_id).lean();
    if (!doctor) throw new ErrorResponse("Doctor not found", 404);
    const sorted_availability = doctor.availability.sort(
      (dateA, dateB) => Number(dateA.date) - Number(dateB.date)
    );
    const filter_availability = sorted_availability.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= today;
    });
    doctor.availability = filter_availability;
    const hospital = await HospitalSchema.findById(doctor.hospital_id).lean();
    doctor.hospital = hospital;
    const attendance = await AttendanceSchema.find({
      doctor_id: doctor_id,
    })
      .sort({ date: -1 })
      .lean();
    doctor.attendance = attendance;
    const log = await LogSchema.find({
      doctor_id: doctor_id,
      createdAt: {
        $gte: today,
        $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    })
      .sort({ date: -1 })
      .lean();
    doctor.log = log;
    const today_online_appointment = await AppointmentSchema.aggregate([
      {
        $match: {
          doctor_id: new ObjectId(doctor_id),
          date: {
            $gte: today,
            $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
          type: "online",
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: "$patient",
      },
    ]).sort({ severity_index: -1, severity_count: -1 });
    const today_walk_in_appointment = await AppointmentSchema.aggregate([
      {
        $match: {
          doctor_id: new ObjectId(doctor_id),
          date: {
            $gte: today,
            $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
          type: "walk_in",
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: "$patient",
      },
    ]).sort({ createdAt: 1 });
    doctor.today_appointment = [
      ...today_online_appointment,
      ...today_walk_in_appointment,
    ];
    doctor.next_date =
      doctor.availability[0].date.toISOString().split("T")[0] ===
      new Date().toISOString().split("T")[0]
        ? doctor.availability[1].date
        : doctor.availability[0].date;
    const next_date = new Date(doctor.next_date);
    next_date.setHours(0, 0, 0, 0);
    const next_date_appointment = await AppointmentSchema.aggregate([
      {
        $match: {
          doctor_id: new ObjectId(doctor_id),
          date: {
            $gte: next_date,
            $lte: new Date(next_date.getTime() + 24 * 60 * 60 * 1000),
          },
        },
      },
      {
        $lookup: {
          from: "patients",
          localField: "patient_id",
          foreignField: "_id",
          as: "patient",
        },
      },
      {
        $unwind: "$patient",
      },
    ]).sort({ date: 1 });
    doctor.next_date_appointment = next_date_appointment;
    const treated_patient_ids = await AppointmentSchema.find({
      doctor_id: doctor_id,
      treated: true,
    })
      .distinct("patient_id")
      .lean();
    const treated_patient = await PatientSchema.find({
      _id: {
        $in: treated_patient_ids,
      },
    })
      .sort({ updatedAt: -1 })
      .lean();
    doctor.treated_patient = treated_patient;
    doctor.today_online_appointment_count = today_online_appointment.length;
    doctor.today_walk_in_appointment_count = today_walk_in_appointment.length;
    doctor.next_date_appointment_count = next_date_appointment.length;
    doctor.treated_patient_count = treated_patient.length;
    res.status(200).json(doctor);
  } catch (err) {
    next(err);
  }
};

const Patient = async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  try {
    const { patient_id } = req.params;
    const patient = await PatientSchema.findById(patient_id).lean();
    if (!patient) throw new ErrorResponse("Patient not found", 404);
    const upcoming_appointment = await AppointmentSchema.aggregate([
      {
        $match: {
          patient_id: new ObjectId(patient_id),
          date: {
            $gte: today,
          },
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: "$doctor",
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
          localField: "doctor_id",
          foreignField: "doctor_id",
          pipeline: [
            {
              $match: {
                date: {
                  $gte: today,
                  $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
                treated: false,
              },
            },
          ],
          as: "today_non_treated_appointment",
        },
      },
      {
        $lookup: {
          from: "appointments",
          localField: "doctor_id",
          foreignField: "doctor_id",
          pipeline: [
            {
              $match: {
                date: {
                  $gte: today,
                  $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000),
                },
                treated: true,
              },
            },
          ],
          as: "today_treated_appointment",
        },
      },
    ]).project({
      "doctor.availability": 0,
    });
    const sorted_upcoming_appointment = upcoming_appointment.sort(
      (dateA, dateB) => Number(dateA.date) - Number(dateB.date)
    );
    const sorted_upcoming_appointment_reverse =
      sorted_upcoming_appointment.reverse();
    patient.upcoming_appointment = sorted_upcoming_appointment_reverse;
    const past_visit = await AppointmentSchema.aggregate([
      {
        $match: {
          patient_id: new ObjectId(patient_id),
          treated: true,
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "doctor_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      {
        $unwind: "$doctor",
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
    ])
      .project({
        "doctor.availability": 0,
      })
      .sort({ date: 1 });
    const sorted_past_visit = past_visit.sort(
      (dateA, dateB) => Number(dateA.date) - Number(dateB.date)
    );
    const sorted_past_visit_reverse = sorted_past_visit.reverse();
    patient.past_visit = sorted_past_visit_reverse;
    const reports = await ReportSchema.find({
      patient_id: patient_id,
    }).lean();
    patient.disease = reports.flatMap((report) => report.disease);
    patient.reports = reports;
    patient.upcoming_appointment_count = upcoming_appointment.length;
    patient.past_visit_count = past_visit.length;
    res.status(200).json(patient);
  } catch (err) {
    next(err);
  }
};

export { Hospital, Doctor, Patient };
