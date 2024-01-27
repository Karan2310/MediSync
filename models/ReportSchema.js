import mongoose from "mongoose";
const { Schema, connection } = mongoose;

const ReportSchema = new Schema(
  {
    patient_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Please provide a patient id"],
    },
    type: {
      type: String,
      trim: true,
      enum: ["patient", "doctor", "pathology"],
      match: [
        /^[a-zA-Z]+$/,
        (props) => `${props.value} is not a valid report type`,
      ],
      lowercase: true,
      required: [true, "Please provide the report type"],
    },
    disease: {
      type: Array,
      trim: true,
      required: [true, "Please provide the disease"],
    },
    report_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Please provide a report id"],
    },
  },
  { timestamps: true }
);

export default connection.useDb("MediSync").model("Report", ReportSchema);
