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
      match: [/^[a-zA-Z]+$/, (props) => `${props.value} is not a valid type`],
      lowercase: true,
      required: [true, "Please provide a type"],
    },
    status: {
      type: String,
      match: [/^[a-zA-Z]+$/, (props) => `${props.value} is not a valid status`],
      required: [true, "Please provide a status"],
    },
  },
  { timestamps: true }
);

export default connection.useDb("MediSync").model("Log", LogSchema);
