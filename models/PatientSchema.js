import mongoose from "mongoose";
const { Schema, connection } = mongoose;

const PatientSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      match: [
        /^[a-zA-Z0-9 ]+$/,
        (props) => `${props.value} is not a valid name`,
      ],
      required: [true, "Please provide a name"],
    },
    age: {
      type: Number,
      match: [/^[0-9]+$/, (props) => `${props.value} is not a valid age`],
      required: [true, "Please provide the age"],
    },
    phone_number: {
      type: String,
      trim: true,
      match: [
        /^[0-9]{10}$/,
        (props) => `${props.value} is not a valid phone number`,
      ],
      unique: true,
      required: [true, "Please add a phone number"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "others"],
      match: [/^[a-zA-Z]+$/, (props) => `${props.value} is not a valid ende`],
      lowercase: true,
      required: [true, "Please add the gender"],
    },
    habits: {
      type: String,
      default: "no",
      enum: ["yes", "no"],
      match: [/^[a-zA-Z]+$/, (props) => `${props.value} is not a valid habits`],
      lowercase: true,
      required: [true, "Please add the habits"],
    },
    lifestyle: {
      type: String,
      enum: ["rural", "urban", "active", "urban-rural"],
      required: [true, "Please add the lifestyle"],
    },
  },
  { timestamps: true }
);

export default connection.useDb("MediSync").model("Patient", PatientSchema);
