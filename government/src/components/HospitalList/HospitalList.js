import React, { useState, useEffect } from "react";
import {
  Grid,
  Card,
  Group,
  Badge,
  Text,
  TextInput,
  Button,
} from "@mantine/core";
import { IconBuildingHospital } from "@tabler/icons-react";
import axios from "axios";
import "./HospitalList.css";

function HospitalList({ setLoading }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [filteredHospitals, setFilteredHospitals] = useState([
    {
      _id: "60f9d1c9e6b3a5b4b4a7e7b1",
      name: "Hospital 1",
      address: {
        street: "Street 1",
        city: "City 1",
        state: "State 1",
        country: "Country 1",
        zipCode: "Zip Code 1",
      },
      contact_details: {
        email_address: "Email 1",
        phone_number: "Phone 1",
      },
      createdAt: "2021-07-23T12:00:57.000Z",
      updatedAt: "2021-07-23T12:00:57.000Z",
      __v: 0,
    },
  ]);
  const [reFetch, setReFetch] = useState(false);

  // useEffect(() => {
  //   (async () => {
  //     setLoading(true);
  //     try {
  //       const { data } = await axios.get("/api/hospitals");
  //       setHospitals(data);
  //       setFilteredHospitals(data);
  //     } catch (err) {
  //       console.error(err);
  //     }
  //     setLoading(false);
  //   })();
  // }, [reFetch]);

  // useEffect(() => {
  //   (() => {
  //     const filteredData = hospitals.filter((item) =>
  //       Object.values(item).some(
  //         (value) =>
  //           typeof value === "string" &&
  //           value.toLowerCase().includes(searchQuery.toLowerCase())
  //       )
  //     );
  //     setFilteredHospitals(filteredData);
  //   })();
  // }, [searchQuery, hospitals]);

  const deleteHospital = async (hospital_id) => {
    setLoading(true);
    try {
      await axios.delete(`/api/hospital/delete/${hospital_id}`);
      setReFetch(!reFetch);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <TextInput
        placeholder="Search Hospital Name, City, Email...."
        value={searchQuery}
        onChange={(event) => setSearchQuery(event.target.value)}
        style={{ marginBottom: "20px" }}
      />

      <Grid gutterXl={30}>
        {filteredHospitals.map((item, index) => {
          return (
            <Grid.Col md={4} sm={12} key={index}>
              <Card
                withBorder
                padding="lg"
                radius="lg"
                style={{ height: "100%" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    height: "100%",
                  }}
                >
                  <div>
                    <Group position="apart">
                      <div className="avatar">
                        <IconBuildingHospital
                          style={{ width: "30px", height: "30px" }}
                        />
                      </div>
                      <Badge color="#000" p={12}>
                        <Text
                          fw={600}
                          fz={12}
                          style={{
                            color: "white",
                            textTransform: "capitalize",
                          }}
                        >
                          {item.name}
                        </Text>
                      </Badge>
                    </Group>
                    <Text color="black" fz="md" mt="lg">
                      Email: {item.contact_details.email_address}
                    </Text>
                    <Text color="black" fz="md" mt={2}>
                      Phone: {item.contact_details.phone_number}
                    </Text>
                    <Text
                      color="black"
                      fz="md"
                      mt={2}
                      style={{ textTransform: "capitalize" }}
                    >
                      Location: {item.address.street}, {item.address.city},{" "}
                      {item.address.state},{item.address.country},
                      {item.address.zipCode}
                    </Text>
                  </div>

                  <div>
                    <Button
                      variant="filled"
                      style={{ backgroundColor: "#000" }}
                      onClick={() => deleteHospital(item._id)}
                      mt={15}
                      radius={8}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>
    </div>
  );
}

export default HospitalList;
