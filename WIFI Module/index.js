import express from "express";
import cors from "cors";
import { VerifyConnectedDevices } from "./TpLink.js";

const app = express();

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  cors({
    origin: "*",
    methods: ["POST", "GET", "DELETE", "PATCH", "PUT"],
    credentials: true,
  })
);

const interval = 1 * 60 * 1000;
let result = [];

app.listen(5000, async () => {
  console.log("Server listening on port 5000");

  setInterval(async () => {
    const { mac_address_list } = await VerifyConnectedDevices(result);
    result = mac_address_list;
  }, interval);
});
