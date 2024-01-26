import mongoose from "mongoose";
const { Schema, connection } = mongoose;

const ImageSchema = new Schema({
  data: {
    type: Buffer,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
});

export default connection.useDb("MediSync").model("Image", ImageSchema);
