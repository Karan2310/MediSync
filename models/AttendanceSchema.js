import mongoose from "mongoose";
const { Schema, connection } = mongoose;

const AttendanceSchema = new Schema(
  {
    doctor_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Please provide a doctor id"],
    },
    isAvailable: {
      type: Boolean,
      default: true,
      required: [true, "Please provide a availability"],
    },
    date: {
      type: Date,
      required: [true, "Please provide a date"],
    },
    checkIn: {
      type: Date,
      required: [true, "Please provide a check-in"],
    },
    checkOut: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default connection
  .useDb("MediSync")
  .model("Attendance", AttendanceSchema);
