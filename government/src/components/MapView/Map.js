import React, { useEffect, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Circle from "ol/geom/Circle";
import { fromLonLat } from "ol/proj";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Fill } from "ol/style";
import axios from "axios";
import { Select } from "@mantine/core";

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [hospitalVectorLayer, setHospitalVectorLayer] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [disease, setDisease] = useState("");

  const DEFAULT_COORDINATES = [72.868506, 19.0460631];

  const createHospitalHotspot = (coordinates) => {
    const center = fromLonLat(coordinates);
    const circle = new Circle(center, 2000); // 20 meters radius
    return new Feature({
      geometry: circle,
    });
  };

  const setMapView = (coordinates, zoom = 12) => {
    if (map) {
      map.getView().setCenter(fromLonLat(coordinates));
      map.getView().setZoom(zoom);
    }
  };

  useEffect(() => {
    if (!map) {
      const newMap = new Map({
        target: "map",
        layers: [new TileLayer({ source: new OSM() })],
      });
      setMap(newMap);

      const hospitalVectorLayer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          fill: new Fill({
            color: "rgba(255, 0, 0, 0.1)", // Red fill with opacity
          }),
        }),
      });

      newMap.addLayer(hospitalVectorLayer);
      setHospitalVectorLayer(hospitalVectorLayer);

      // Get user's current location using Geolocation API
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapView([longitude, latitude], 15); // Zoom level set to 15 (adjust as needed)
        },
        (error) => {
          console.error("Error getting current location:", error);
          setMapView(DEFAULT_COORDINATES);
        }
      );
    }
  }, [map, setMapView]);

  useEffect(() => {
    if (hospitalVectorLayer) {
      hospitalVectorLayer.getSource().clear();

      if (hospitals.length > 0) {
        const hospitalHotspotFeatures = hospitals.map((hospital) => {
          const coords = [hospital.longitude, hospital.latitude];
          return createHospitalHotspot(coords);
        });

        hospitalVectorLayer.getSource().addFeatures(hospitalHotspotFeatures);

        const avgLat =
          hospitals.reduce((acc, curr) => acc + curr.latitude, 0) /
          hospitals.length;
        const avgLon =
          hospitals.reduce((acc, curr) => acc + curr.longitude, 0) /
          hospitals.length;

        setMapView([avgLon, avgLat]);
      } else {
        setMapView(DEFAULT_COORDINATES);
      }
    }
  }, [hospitals, hospitalVectorLayer, map]);

  const handleDiseaseCoordinates = async (selectedDisease) => {
    try {
      const { data } = await axios.get(
        `/api/appointment/disease/${selectedDisease}`
      );
      const hospitalCoords = data.map((hospital) => ({
        latitude: hospital.coordinates.latitude,
        longitude: hospital.coordinates.longitude,
      }));
      setHospitals(hospitalCoords);
    } catch (error) {
      console.error(error);
    }
  };

  const getHospitals = async () => {
    try {
      const { data } = await axios.get("/api/appointment/hospitals");
      const hospitalCoords = data.map((hospital) => ({
        latitude: hospital.coordinates.latitude,
        longitude: hospital.coordinates.longitude,
      }));
      console.log(hospitalCoords);
      setHospitals(hospitalCoords);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getHospitals();
  }, []);

  return (
    <>
      <Select
        my="lg"
        label="Select Disease"
        placeholder="Select Disease"
        data={[
          { label: "Influenza (Flu)", value: "flu" },
          { label: "Common Cold", value: "Common Cold" },
          { label: "COVID-19", value: "COVID-19" },
          { label: "Measles", value: "Measles" },
          { label: "Chickenpox", value: "Chickenpox" },
        ]}
        value={disease}
        onChange={(value) => {
          setDisease(value);
          handleDiseaseCoordinates(value);
        }}
      />
      <div
        className="map-container"
        style={{ width: "1300px", height: "600px" }}
      >
        <div
          id="map"
          className="map"
          style={{ width: "1300px", height: "600px" }}
        ></div>
      </div>
    </>
  );
};

export default MapComponent;
