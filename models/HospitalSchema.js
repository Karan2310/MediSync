import mongoose from "mongoose";
const { Schema, connection } = mongoose;

const HospitalSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      match: [
        /^[a-zA-Z0-9 ]+$/,
        (props) => `${props.value} is not a valid hospital name`,
      ],
      required: [true, "Please add the hospital name"],
    },
    coordinates: {
      type: Object,
      required: [true, "Please add a coordinates"],
    },
    address: {
      street: {
        type: String,
        trim: true,
        match: [
          /^[a-zA-Z ]+$/,
          (props) => `${props.value} is not a valid street address`,
        ],
        required: [true, "Please add the street address"],
      },
      city: {
        type: String,
        trim: true,
        match: [
          /^[a-zA-Z ]+$/,
          (props) => `${props.value} is not a valid city`,
        ],
        required: [true, "Please add the city"],
      },
      state: {
        type: String,
        trim: true,
        match: [
          /^[a-zA-Z ]+$/,
          (props) => `${props.value} is not a valid state`,
        ],
        required: [true, "Please add the state"],
      },
      zipCode: {
        type: String,
        trim: true,
        match: [
          /^[0-9]{6}$/,
          (props) => `${props.value} is not a valid zip code`,
        ],
        required: [true, "Please add the zip code"],
      },
      country: {
        type: String,
        trim: true,
        match: [
          /^[a-zA-Z ]+$/,
          (props) => `${props.value} is not a valid country`,
        ],
        required: [true, "Please add the country"],
      },
    },
    contact_details: {
      phone_number: {
        type: String,
        trim: true,
        match: [
          /^[0-9]{10}$/,
          (props) => `${props.value} is not a valid phone number`,
        ],
        required: [true, "Please add a phone number"],
      },
      email_address: {
        type: String,
        trim: true,
        lowercase: true,
        match: [
          /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/,
          (props) => `${props.value} is not a valid email address`,
        ],
        required: [true, "Please add an email address"],
      },
    },
    username: {
      type: String,
      unique: true,
      required: [true, "Please add the username"],
    },
    password: {
      type: String,
      required: [true, "Please add the password"],
    },
  },
  {
    timestamps: true,
  }
);

export default connection.useDb("MediSync").model("Hospital", HospitalSchema);
