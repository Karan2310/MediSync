import HospitalSchema from "../models/HospitalSchema.js";
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

export { HospitalLogin };
