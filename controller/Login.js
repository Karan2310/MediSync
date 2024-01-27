import HospitalSchema from "../models/HospitalSchema.js";
import DoctorSchema from "../models/DoctorSchema.js";
import ErrorResponse from "../utils/errorResponse.js";

const HospitalLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const response = await HospitalSchema.findOne({
      username,
      password,
    })
      .select("_id")
      .lean();
    if (response === null) {
      throw new ErrorResponse("Invalid Credential", 400);
    }
    res
      .cookie("_id", response._id, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .status(200)
      .send("Login Successful");
  } catch (err) {
    next(err);
  }
};

const DoctorLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const response = await DoctorSchema.findOne({
      username,
      password,
    })
      .select(["_id"])
      .lean();
    if (response === null) {
      throw new ErrorResponse("Invalid Credential", 400);
    }
    res.status(200).send(response._id);
  } catch (err) {
    next(err);
  }
};

const PatientLogin = async (req, res) => {
  try {
    const { name, age, phone_number, gender, habits, lifestyle } = req.body;
    let response = await PatientSchema.findOne({
      phone_number,
    })
      .select(["_id"])
      .lean();
    if (response === null) {
      response = await PatientSchema.create({
        name,
        age,
        phone_number,
        gender,
        habits,
        lifestyle,
      });
    }
    res
      .cookie("_id", response._id, {
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .status(200)
      .end();
  } catch (err) {
    next(err);
  }
};

export { HospitalLogin, DoctorLogin, PatientLogin };
