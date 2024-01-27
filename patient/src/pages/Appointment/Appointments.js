import React, { useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Group,
  Select,
  NumberInput,
  Checkbox,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import axios from "axios";
import symptomsData from "./symptoms.json";
import { useDispatch, useSelector } from "react-redux";
import {
  PillsInput,
  Pill,
  Combobox,
  CheckIcon,
  useCombobox,
  MultiSelect,
  Text,
} from "@mantine/core";
import ETA from "./ETA";
import { useCookies } from "react-cookie";
import doctorIcon from "../../assets/doctor.png";
import { Card, Grid, Badge } from "@mantine/core";

const DoctorCard = ({ doctor }) => {
  const dispatch = useDispatch();

  return (
    <Card m={20} withBorder padding="lg" radius="md">
      <div className="d-flex w-100 flex-row align-items-between justify-content-between">
        <div className="avatar">
          <img
            src={doctorIcon}
            style={{ width: "30px", height: "30px" }}
            alt="doctor"
          />
        </div>
        <Badge color="#EDEDED" p={12}>
          <Text
            fw={600}
            style={{ color: "black", textTransform: "capitalize" }}
          >
            {doctor.name}
          </Text>
        </Badge>
      </div>
      <Text style={{ color: "black" }} fz="md" mt="lg">
        Speciality: {doctor.specialization}
      </Text>
      <Text
        fz="md"
        style={{
          textTransform: "capitalize",
          color: "black",
        }}
      >
        Hospital: {doctor.hospital.name}
      </Text>
      <button
        style={{
          width: "100px",
          padding: "5px",
          backgroundColor: "#0a0059",
          color: "white",
          borderRadius: "10px",
          marginTop: "15px",
          fontWeight: "500",
          border: "none",
          outline: "none",
        }}
        // onClick={handleBookAppointment}
      >
        Book
      </button>
    </Card>
  );
};

const Appointments = () => {
  const [hospitals, setHospitals] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [fetchedSpecializations, setFetchedSpecializations] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [onlineSlotsAvailable, setOnlineSlotsAvailable] = useState(0);
  const [offlineSlotsAvailable, setOfflineSlotsAvailable] = useState(0);
  const [isOnlineSlotsAvailable, setIsOnlineSlotsAvailable] = useState(true);
  const [isDateSelected, setIsDateSelected] = useState(false);

  const [hospitalLocation, setHospitalLocation] = useState({});

  const [timeSlot, setTimeSlot] = useState([]);

  const [location, setLocation] = useState({});
  const [recommendedDoctors, setRecommendedDoctors] = useState([]);

  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);

  const [cookies] = useCookies(["token"]);

  useEffect(() => {
    (async () => {
      const { data } = await axios.get("/api/hospitals");
      setHospitals(data);
      console.log(data);
    })();
  }, []);

  const handleSpecialization = async (hospital) => {
    const foundHospital = hospitals.find((item) => item.name === hospital);
    const hospitalId = foundHospital._id;
    const hospitalLocation = foundHospital.coordinates;
    setHospitalLocation(hospitalLocation);

    form.setValues({
      ...form.values,
      hospital: hospital,
      hospital_id: hospitalId,

      specialization: "",
      doctor: "",
    });

    console.log("hospital location", hospitalLocation);

    const { data } = await axios.get(
      `/api/doctors/specialization/${hospitalId}`
    );

    setFetchedSpecializations(data);
  };

  const handleDoctor = async (value) => {
    const foundHospital = hospitals.find(
      (item) => item.name === form.values.hospital
    );

    const hospitalId = foundHospital._id;

    const { data } = await axios.get(
      `/api/doctors/specialization/${hospitalId}/${value}`
    );
    console.log(data);
    setDoctors(data);
  };

  const handleDate = async (doctor) => {
    const foundDoctor = doctors.find((item) => item.name === doctor);

    form.setValues({ doctor_id: foundDoctor._id });

    const date = foundDoctor.availability;
    setAvailability(date);
  };

  const handleTimeSlots = async (date) => {
    const foundDoctor = doctors.find(
      (item) => item.name === form.values.doctor
    );
    const foundDate = foundDoctor.availability.find(
      (item) => item.date === date
    );
    const slots = await handleAvailableSlot(foundDate.date);
    console.log(slots);
    const slotsBooked = slots.slot_booked;
    const slotsOnlineAvailable = slots.slot_count;
    const slotsOfflineAvailable = slots.slot_count.walk_in;
    console.log(slotsBooked, slotsOnlineAvailable, slotsOfflineAvailable);

    if (slotsBooked <= slotsOnlineAvailable) {
      const start_time = foundDate.start_time;
      const end_time = foundDate.end_time;
      const timeSlots = [`${start_time}-${end_time}`];
      console.log(timeSlots);
      setIsDateSelected(true);

      setTimeSlot(timeSlots);
    } else {
      alert("No slots available");
      setTimeSlot([]);
    }
    setIsOnlineSlotsAvailable(slotsOnlineAvailable > slotsBooked);

    setOnlineSlotsAvailable(slotsOnlineAvailable - slotsBooked);
    setOfflineSlotsAvailable(slotsOfflineAvailable);
  };

  const form = useForm({
    initialValues: {
      hospital: "",
      hospital_id: "",
      specialization: "",
      doctor: "",
      doctor_id: "",
      patient_id: "",
      date: "",
      time_slot: "",
      symptoms: [],
      coordinates: { latitude: "", longitude: "" },
      auto_booked: false,
    },
  });

  const handleAvailableSlot = async (date) => {
    const type = "online";
    const doctor_id = form.values.doctor_id;
    console.log(date);
    const { data } = await axios.post(
      `/api/appointment/doctor/slots/${type}/${doctor_id}`,
      { date: date }
    );

    console.log(data);
    return data;
  };

  const handleReccomendation = async () => {
    try {
      console.log(form.values.symptoms);
      const { data } = await axios.post("/api/suggest/doctors", {
        symptoms: form.values.symptoms,
      });

      setRecommendedDoctors(data);
      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async (values) => {
    values.patient_id = cookies._id;
    console.log(values);
    try {
      // console.log(values);
      const { data } = await axios.post(
        "/api/appointment/online/register",
        values
      );
      console.log(data);
      alert("Appointment booked successfully");
      window.location.reload();
    } catch (error) {
      alert(error.response.data);
      console.log(error);
    }
  };

  useEffect(() => {
    // Function to get the user's location
    const getLocation = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValues((values) => ({
            ...values,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
        },

        (error) => {
          console.error("Error getting location:", error.message);
        }
      );
      console.log(form.values.coordinates);
    };

    // Ask for location permission and get the location
    const askForLocationPermission = () => {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          setLocationPermissionGranted(true);

          getLocation();
        } else if (result.state === "prompt") {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("Latitude:", position.coords.latitude);
              console.log("Longitude:", position.coords.longitude);
            },
            (error) => {
              console.error("Error getting location:", error.message);
              setLocationPermissionGranted(false);
            }
          );
        }
      });
    };

    askForLocationPermission();
  }, []);

  const isHospitalSelected = form.values.hospital;
  const isSpecializationSelected = form.values.specialization;
  const isDoctorSelected = form.values.doctor;
  const isSlotAvailable = timeSlot;
  return (
    <div>
      <div className="container-fluid">
        <div className="c-card">
          <h4>Book an Appointment</h4>
          <form onSubmit={form.onSubmit((values) => handleSubmit(values))}>
            <div className="container-fluid p-0 mt-3">
              <div mt="md" className="row">
                <div mt="md" className="col-md-6">
                  <div className=" d-flex justify-content-between align-items-between g-4">
                    <MultiSelect
                      mt="md"
                      style={{ width: "75%" }}
                      label="Enter Symptoms"
                      placeholder="Pick Symptoms"
                      onChange={(value) => {
                        form.setValues({ symptoms: value });
                      }}
                      value={form.values.symptoms}
                      data={Object.entries(symptomsData).map(
                        ([label, value]) => ({
                          value: value,
                          label: label,
                        })
                      )}
                      // disabled={!isOnlineSlotsAvailable || !isDateSelected}
                      searchable
                      nothingFoundMessage="Nothing found..."
                    />
                    <Button
                      mt={40}
                      style={{ background: "#0a0059" }}
                      onClick={() => {
                        handleReccomendation();
                      }}
                      className="book-btn"
                    >
                      Recommend
                    </Button>
                  </div>
                </div>

                <div className="col-md-6">
                  <Select
                    mt="md"
                    label="Select Hospital"
                    placeholder="Select Hospital"
                    data={hospitals.map((hospital) => ({
                      value: hospital.name,
                      label: hospital.name,
                    }))}
                    onChange={(value) => {
                      handleSpecialization(value);
                    }}
                    value={form.values.hospital}
                  />
                </div>
                <div className="col-md-6">
                  <Select
                    mt="md"
                    label="Select Specialization"
                    placeholder="Select Specialization"
                    // mt="md"
                    {...form.getInputProps("specialization")}
                    data={fetchedSpecializations.map((specialization) => ({
                      value: specialization,
                      label: specialization,
                    }))}
                    onChange={(value) => {
                      form.setValues({
                        ...form.values,
                        specialization: value,
                      });
                      handleDoctor(value);
                    }}
                    nothingFoundMessage="No specializations found"
                    disabled={!isHospitalSelected}
                  />
                </div>
                <div className="col-md-6">
                  <Select
                    label="Select Doctor"
                    placeholder="Select Doctor"
                    data={doctors.map((doctor) => ({
                      value: doctor.name,
                      label: doctor.name,
                    }))}
                    {...form.getInputProps("doctor")}
                    onChange={(value) => {
                      form.setValues({
                        ...form.values,
                        doctor: value,
                      });
                      handleDate(value);
                    }}
                    mt="md"
                    nothingFoundMessage="No doctors found"
                    disabled={!isSpecializationSelected}
                  />
                </div>
                <div className="col-md-6">
                  <Select
                    mt="md"
                    label="Select Date"
                    placeholder="Select Date"
                    disabled={!isDoctorSelected}
                    data={availability
                      .map((slot) => ({
                        value: slot.date,
                        label: new Date(slot.date).toLocaleDateString("en-GB"), // Use 'en-GB' for dd/mm/yyyy format
                      }))
                      .sort((a, b) => new Date(a.value) - new Date(b.value))}
                    onChange={(value) => {
                      form.setValues({ ...form.values, date: value });
                      handleTimeSlots(value);
                    }}
                    nothingFoundMessage="No time slots available"
                    value={form.values.date}
                  />
                </div>
                <div className="col-md-6">
                  <Select
                    mt="md"
                    label="Select Time Slot"
                    placeholder="Select Time Slot"
                    disabled={!isOnlineSlotsAvailable || !isDateSelected} // Disable if no doctor selected, no online slots available, or no date selected
                    data={timeSlot.map((slot) => ({
                      value: slot,
                      label: slot,
                    }))}
                    onChange={(value) => {
                      form.setValues({ ...form.values, time_slot: value });
                    }}
                    nothingFoundMessage="No time slots available"
                    value={form.values.time_slot}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="col-md-6">
                  <Checkbox
                    mt={30}
                    label="Auto-Appointment"
                    checked={form.values.auto_booked}
                    onChange={(event) => {
                      form.setValues({
                        ...form.values,
                        auto_booked: event.currentTarget.checked,
                      });
                    }}
                  />
                </div>
              </div>
              <Group align="center" justify="space-between" mt="xl">
                <Group>
                  <Text style={{ color: "black" }}>
                    Online Slots Available: {onlineSlotsAvailable}
                  </Text>
                  {/* <Text style={{ color: "black" }}>
                    Offline Slots Available: {offlineSlotsAvailable}
                  </Text> */}
                </Group>

                <Button
                  className="book-btn"
                  type="submit"
                  disabled={!isDateSelected || !isSlotAvailable}
                  style={{ background: "#0a0059" }}
                >
                  Book
                </Button>
              </Group>
            </div>
          </form>
        </div>
        <div className="c-card mt-5">
          <div className="row">
            {form.values.hospital && (
              <div className="col-md-8">
                <ETA
                  location={form.values.coordinates}
                  hospitalLocation={hospitalLocation}
                />
              </div>
            )}
            <div className="col-md-4">
              <h4>Recommended Doctors</h4>
              {recommendedDoctors.map((doctor, index) => (
                <DoctorCard doctor={doctor} key={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
