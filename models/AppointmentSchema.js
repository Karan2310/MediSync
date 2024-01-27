import mongoose from "mongoose";
const { Schema, connection } = mongoose;

const AppointmentSchema = new Schema(
  {
    hospital_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Please provide a hospital id"],
    },
    doctor_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Please provide a doctor id"],
    },
    patient_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Please provide a patient id"],
    },
    type: {
      type: String,
      trim: true,
      enum: ["online", "walk_in"],
      match: [
        /^[a-zA-Z]+$/,
        (props) => `${props.value} is not a valid appointment type`,
      ],
      lowercase: true,
      required: [true, "Please provide the appointment type"],
    },
    severity_index: {
      type: Number,
      default: 0,
      required: [true, "Please provide a severity index"],
    },
    severity_count: {
      type: Number,
      default: 0,
      required: [true, "Please provide a severity count"],
    },
    treated: {
      type: Boolean,
      default: false,
      required: [true, "Please provide a treated"],
    },
    symptoms: {
      type: Array,
    },
    date: {
      type: Date,
      required: [true, "Please provide a date"],
    },
    time_slot: {
      type: String,
      required: [true, "Please provide a time slot"],
    },
    alloted_time: {
      type: String,
    },
    e_prescription: {
      type: String,
      trim: true,
    },
    shift: {
      type: Number,
      default: 0,
      required: [true, "Please provide a shift"],
    },
    rating: {
      type: Number,
      default: 0,
      enum: [-1, 0, 1],
      required: [true, "Please provide a rating"],
    },
    diagnosis_result: {
      type: String,
      trim: true,
    },
    coordinates: {
      latitude: {
        type: Number,
      },
      longitude: {
        type: Number,
      },
    },
    isRerouting: {
      type: Boolean,
      default: false,
    },
    dispensary_id: {
      type: Schema.Types.ObjectId,
    },
    auto_booked: {
      type: Boolean,
      default: false,
      required: [true, "Please provide a auto booked"],
    },
  },
  { timestamps: true }
);

export default connection
  .useDb("MediSync")
  .model("Appointment", AppointmentSchema);
