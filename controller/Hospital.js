import ShortUniqueId from "short-unique-id";
import HospitalSchema from "../models/HospitalSchema.js";
import geolib from "geolib";

const { randomUUID } = new ShortUniqueId({ length: 8 });

const Register = async (req, res, next) => {
  try {
    const {
      hospital_name,
      coordinates: { latitude, longitude },
      address: { street, city, state, zipCode, country },
      contact_details: { phone_number, email_address },
    } = req.body;
    const username = randomUUID();
    const password = randomUUID();
    const hospital = await HospitalSchema.create({
      name: hospital_name,
      coordinates: {
        latitude,
        longitude,
      },
      address: {
        street,
        city,
        state,
        zipCode,
        country,
      },
      contact_details: {
        phone_number,
        email_address,
      },
      username,
      password,
    });

    req.data = {
      name: hospital_name,
      email_address,
      username,
      password,
    };
    res.status(200).json({
      _id: hospital._id,
      username,
      password,
    });
    next();
  } catch (err) {
    next(err);
  }
};

const DeleteHospital = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;
    await HospitalSchema.findByIdAndDelete(hospital_id);
    res.status(200).send("Hospital successfully deleted");
  } catch (err) {
    next(err);
  }
};

const HospitalInfo = async (req, res, next) => {
  try {
    const { hospital_id } = req.params;
    const hospital = await HospitalSchema.findById(hospital_id).lean();
    res.status(200).json(hospital);
  } catch (err) {
    next(err);
  }
};

const AllHospitals = async (req, res, next) => {
  try {
    const hospitals = await HospitalSchema.find()
      .sort({
        createdAt: -1,
      })
      .lean();
    res.status(200).json(hospitals);
  } catch (err) {
    next(err);
  }
};

const NearByHospitals = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const hospitals = await HospitalSchema.find().lean();
    const closest_hospital_ids = hospitals
      .map((hospital) => {
        const distance = geolib.getDistance(
          { latitude, longitude },
          hospital.coordinates
        );
        if (distance <= 25 * 1000) return hospital._id;
      })
      .sort((a, b) => a.distance - b.distance);
    const nearby_hospitals = await HospitalSchema.aggregate([
      {
        $match: {
          _id: {
            $in: closest_hospital_ids,
          },
        },
      },
      {
        $lookup: {
          from: "doctors",
          localField: "_id",
          foreignField: "hospital_id",
          as: "doctors",
        },
      },
    ]);
    res.status(200).json(nearby_hospitals);
  } catch (err) {
    console.error(err);
    res.status(400).send(err.message);
  }
};

export {
  Register,
  DeleteHospital,
  HospitalInfo,
  AllHospitals,
  NearByHospitals,
};
