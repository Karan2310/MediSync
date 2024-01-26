import React from "react";
import { Box, Button, Grid, Col, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import "./Register.css";
import axios from "axios";

function Register({ setLoading }) {
  const form = useForm({
    validateInputOnChange: true,
    initialValues: {
      hospital_name: "",
      coordinates: {
        latitude: "",
        longitude: "",
      },
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      contact_details: {
        phone_number: "",
        email_address: "",
      },
    },
    validate: {},
  });

  const handleSubmit = async ({
    hospital_name,
    coordinates,
    address,
    contact_details,
  }) => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/hospital/register", {
        hospital_name,
        coordinates: {
          latitude: parseFloat(coordinates.latitude),
          longitude: parseFloat(coordinates.longitude),
        },
        address,
        contact_details,
      });
      console.log(data);
      alert("Hospital registered successfully!");
      form.reset();
    } catch (err) {
      console.log(err);
      alert(err.response.data.error || err.message);
    }
    setLoading(false);
  };

  return (
    <Box
      maxwidth={600}
      mx="auto"
      style={{
        padding: 30,
        background: "#fff",
        borderRadius: 16,
        paddingTop: 25,
        paddingBottom: 25,
      }}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Col span={12}>
            <TextInput
              required
              label="Hospital Name"
              placeholder="Enter hospital name"
              {...form.getInputProps("hospital_name")}
            />
          </Col>
          <Col sm={12} md={6}>
            <TextInput
              required
              label="Latitude"
              placeholder="Latitude"
              {...form.getInputProps("coordinates.latitude")}
            />
          </Col>
          <Col sm={12} md={6}>
            <TextInput
              required
              label="Longitude"
              placeholder="Longitude"
              {...form.getInputProps("coordinates.longitude")}
            />
          </Col>
          <Col sm={12} md={6}>
            <TextInput
              required
              label="Hospital Phone Number"
              placeholder="Enter hospital phone number"
              {...form.getInputProps("contact_details.phone_number")}
            />
          </Col>
          <Col sm={12} md={6}>
            <TextInput
              required
              label="Hospital Email Address"
              placeholder="Enter hospital email address"
              {...form.getInputProps("contact_details.email_address")}
            />
          </Col>
          <Col sm={12} md={8}>
            <TextInput
              required
              label="Street"
              placeholder="Street"
              {...form.getInputProps("address.street")}
            />
          </Col>
          <Col sm={12} md={4}>
            <TextInput
              required
              label="City (Hospital)"
              placeholder="City (Hospital)"
              {...form.getInputProps("address.city")}
            />
          </Col>
          <Col span={12} md={4}>
            <TextInput
              required
              label="State (Hospital)"
              placeholder="State (Hospital)"
              {...form.getInputProps("address.state")}
            />
          </Col>
          <Col sm={12} md={4}>
            <TextInput
              required
              label="Zip Code"
              placeholder="Zip Code"
              {...form.getInputProps("address.zipCode")}
            />
          </Col>
          <Col sm={12} md={4}>
            <TextInput
              required
              label="Country"
              placeholder="Country"
              {...form.getInputProps("address.country")}
            />
          </Col>
        </Grid>
        <Button
          type="submit"
          mt="xl"
          className="register-button"
          disabled={form.loading}
        >
          Submit
        </Button>
      </form>
    </Box>
  );
}

export default Register;
