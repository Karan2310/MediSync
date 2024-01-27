import AppointmentSchema from "../models/AppointmentSchema.js";
import DoctorSchema from "../models/DoctorSchema.js";
import ReportSchema from "../models/ReportSchema.js";
import PatientSchema from "../models/PatientSchema.js";
import AlertSchema from "../models/AlertSchema.js";
import { addMinutes } from "../utils/Function.js";
import ErrorResponse from "../utils/errorResponse.js";
import { severity, highSeverity } from "../utils/Severity.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;

const OnlineRegister = async (req, res, next) => {
  try {
    const {
      hospital_id,
      doctor_id,
      patient_id,
      date,
      time_slot,
      symptoms,
      coordinates,
      auto_booked,
    } = req.body;
    const patient = await PatientSchema.findById(patient_id).lean();
    const reports = await ReportSchema.find({ patient_id })
      .select("disease")
      .lean();
    const disease_list = reports.flatMap((report) => report.disease);
    const severity_index = severity(
      patient.age,
      symptoms,
      disease_list,
      patient.lifestyle,
      patient.habits
    );
    const severity_count = highSeverity(symptoms);
    const appointment = await AppointmentSchema.create({
      hospital_id,
      doctor_id,
      patient_id,
      type: "online",
      symptoms,
      severity_index,
      severity_count,
      date: date,
      time_slot,
      coordinates,
      auto_booked,
    });
    if (severity_index < 1.0) {
      await AlertSchema.create({
        doctor_id,
        patient_id,
        type: "redirecting",
        appointment_id: appointment._id,
      });
    }
    res.status(200).send(appointment._id);
  } catch (err) {
    next(err);
  }
};

const WalkInRegister = async (req, res, next) => {
  try {
    const {
      hospital_id,
      doctor_id,
      phone_number,
      name,
      age,
      gender,
      habits,
      lifestyle,
      coordinates,
      date,
      time_slot,
      symptoms,
    } = req.body;
    let patient = await PatientSchema.findOne({
      phone_number,
    }).lean();
    if (!patient) {
      patient = await PatientSchema.create({
        phone_number,
        name,
        age,
        gender,
        habits,
        lifestyle,
      });
    }
    const reports = await ReportSchema.find({ patient_id: patient._id })
      .select("disease")
      .lean();
    const disease_list = reports.flatMap((report) => report.disease);
    const severity_index = severity(
      patient.age,
      symptoms,
      disease_list,
      patient.lifestyle,
      patient.habits
    );
    const severity_count = highSeverity(symptoms);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
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
    ]).sort({ date: 1 });
    const today_appointment = [
      ...today_online_appointment,
      ...today_walk_in_appointment,
    ];
    const last_appointment_allocated_time = today_appointment[-1]
      ? today_appointment[-1].alloted_time
      : "00:00";
    const doctor = await DoctorSchema.findById(doctor_id).lean();
    const appointment = await AppointmentSchema.create({
      hospital_id,
      doctor_id,
      patient_id: patient._id,
      type: "walk_in",
      symptoms,
      severity_index,
      severity_count,
      date: date,
      time_slot,
      coordinates,
      alloted_time: addMinutes(
        last_appointment_allocated_time,
        doctor.average_time
      ),
    });
    res.status(200).send(appointment._id);
  } catch (err) {
    next(err);
  }
};

const DeleteAppointment = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    await AppointmentSchema.findByIdAndDelete(appointment_id);
    res.status(200).send("Appointment successfully deleted");
  } catch (err) {
    next(err);
  }
};

const AppointmentInfo = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const patient = await AppointmentSchema.findById(appointment_id).lean();
    res.status(200).json(patient);
  } catch (err) {
    next(err);
  }
};

const DoctorAvailableSlots = async (req, res, next) => {
  try {
    const { doctor_id, type } = req.params;
    const { date } = req.body;
    const appointment_date = new Date(date);
    appointment_date.setHours(0, 0, 0, 0);
    const response = await DoctorSchema.aggregate([
      {
        $match: {
          _id: new ObjectId(doctor_id),
        },
      },
      {
        $lookup: {
          from: "appointments",
          pipeline: [
            {
              $match: {
                doctor_id: new ObjectId(doctor_id),
                type,
                date: {
                  $gte: appointment_date,
                  $lte: new Date(
                    appointment_date.getTime() + 24 * 60 * 60 * 1000
                  ),
                },
              },
            },
          ],
          as: "appointment",
        },
      },
      {
        $project: {
          _id: 0,
          slot_booked: {
            $size: "$appointment",
          },
          slot_count: `$slot_count.${type}`,
        },
      },
    ]);
    if (response.length === 0) return res.status(400).send("Doctor not found");
    res.status(200).json(response[0]);
  } catch (err) {
    next(err);
  }
};

const MarkAsDone = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const { diagnosis_result } = req.body;
    const appointment = await AppointmentSchema.findById(appointment_id);
    if (!appointment) throw new ErrorResponse("Appointment not found", 400);
    appointment.treated = !appointment.treated;
    if (diagnosis_result) appointment.diagnosis_result = diagnosis_result;
    await appointment.save();
    res.status(200).send("Patient treated successfully marked");
  } catch (err) {
    next(err);
  }
};

const UpdateRating = async (req, res, next) => {
  try {
    const { appointment_id } = req.params;
    const { rating } = req.body;
    await AppointmentSchema.findByIdAndUpdate(appointment_id, {
      rating,
    });
    res.status(200).send("Appointment details updated successfully");
  } catch (err) {
    next(err);
  }
};

export {
  OnlineRegister,
  WalkInRegister,
  DeleteAppointment,
  AppointmentInfo,
  DoctorAvailableSlots,
  MarkAsDone,
  UpdateRating,
};
