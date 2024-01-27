import mongoose from "mongoose";
const { Schema, connection } = mongoose;

const DoctorSchema = new Schema(
  {
    hospital_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Please provide a hospital id"],
    },
    rfid_tag: {
      type: String,
      unique: true,
      trim: true,
      required: [true, "Please provide the rfid tag"],
    },
    name: {
      type: String,
      trim: true,
      required: [true, "Please add the doctor name"],
    },
    mac_address: {
      type: String,
      trim: true,
      unique: true,
      required: [true, "Please provide the mac address"],
    },
    photo_id: {
      type: Schema.Types.ObjectId,
      required: [true, "Please provide a photo id"],
    },
    specialization: {
      type: String,
      trim: true,
      enum: [
        "general",
        "ent",
        "gynecologist",
        "dental",
        "dermatologist",
        "orthologist",
        "ophthalmologist",
      ],
      match: [
        /^[a-zA-Z]+$/,
        (props) => `${props.value} is not a valid specialization`,
      ],
      lowercase: true,
      required: [true, "Please provide the specialization"],
    },
    experience: {
      type: Number,
      match: [
        /^[0-9]+$/,
        (props) => `${props.value} is not a valid experience`,
      ],
      required: [true, "Please provide the experience"],
    },
    age: {
      type: Number,
      match: [/^[0-9]+$/, (props) => `${props.value} is not a valid age`],
      required: [true, "Please provide the age"],
    },
    license_number: {
      type: String,
      trim: true,
      match: [
        /^[a-zA-Z0-9]+$/,
        (props) => `${props.value} is not a valid license number`,
      ],
      required: [true, "Please provide the license number"],
    },
    availability: [
      {
        date: {
          type: Date,
          required: [true, "Please provide the date"],
        },
        start_time: {
          type: String,
          required: [true, "Please provide the starting time"],
        },
        end_time: {
          type: String,
          required: [true, "Please provide the ending time"],
        },
      },
    ],
    slot_count: {
      online: {
        type: Number,
        match: [
          /^[0-9]+$/,
          (props) => `${props.value} is not a valid slot count`,
        ],
        required: [true, "Please provide the online slot count"],
      },
      walk_in: {
        type: Number,
        match: [
          /^[0-9]+$/,
          (props) => `${props.value} is not a valid slot count`,
        ],
        required: [true, "Please provide the walk-in slot count"],
      },
    },
    average_time: {
      type: Number,
      match: [
        /^[0-9]+$/,
        (props) => `${props.value} is not a valid average time`,
      ],
      required: [true, "Please provide the average time"],
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      match: [/^[a-zA-Z]+$/, (props) => `${props.value} is not a valid gender`],
      lowercase: true,
      required: [true, "Please provide the gender"],
    },
    fees: {
      type: Number,
      match: [/^[0-9]+$/, (props) => `${props.value} is not a valid fees`],
      required: [true, "Please provide the doctor fees"],
    },
    phone_number: {
      type: String,
      trim: true,
      match: [
        /^[0-9]{10}$/,
        (props) => `${props.value} is not a valid phone number`,
      ],
      required: [true, "Please add a phone number"],
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

export default connection.useDb("MediSync").model("Doctor", DoctorSchema);
