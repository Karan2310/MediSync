import mongoose from "mongoose";
const { Schema, connection } = mongoose;

const LogSchema = new Schema(
  {
    doctor_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Please provide a doctor id"],
    },
    type: {
      type: String,
      enum: ["CCTV Camera", "Wifi Network", "RFID"],
      required: [true, "Please provide a type"],
    },
    status: {
      type: String,
      required: [true, "Please provide a status"],
    },
  },
  { timestamps: true }
);

export default connection.useDb("MediSync").model("Log", LogSchema);
