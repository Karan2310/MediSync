import React, { useEffect, useState } from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import OSM from "ol/source/OSM";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import { fromLonLat } from "ol/proj";
import { Vector as VectorLayer } from "ol/layer";
import { Vector as VectorSource } from "ol/source";
import { Style, Icon, Circle, Fill, Stroke } from "ol/style";
import axios from "axios";
import { Select } from "@mantine/core";
import pin from "./pin.png";

const MapComponent = () => {
  const [map, setMap] = useState(null);
  const [hospitalVectorLayer, setHospitalVectorLayer] = useState(null);
  const [diseaseVectorLayer, setDiseaseVectorLayer] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [disease, setDisease] = useState("");
  const [diseaseHotspots, setDiseaseHotspots] = useState([]);

  const DEFAULT_COORDINATES = [72.8465408, 19.1987712];

  const createHospitalHotspot = (coordinates) => {
    const center = fromLonLat(coordinates);
    return new Feature({
      geometry: new Point(center),
    });
  };

  const createDiseaseHotspot = (coordinates) => {
    const center = fromLonLat(coordinates);
    return new Feature({
      geometry: new Point(center),
    });
  };

  const setMapView = (coordinates, zoom = 15) => {
    if (map) {
      map.getView().setCenter(fromLonLat(coordinates));
      map.getView().setZoom(zoom);
    }
  };

  useEffect(() => {
    if (!map) {
      const newMap = new Map({
        target: "map",
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat(DEFAULT_COORDINATES),
          zoom: 12, // Initial zoom level before user location is obtained
        }),
      });
      setMap(newMap);

      const hospitalVectorLayer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: pin,
            scale: 0.1,
          }),
        }),
      });

      const diseaseVectorLayer = new VectorLayer({
        source: new VectorSource(),
        style: new Style({
          image: new Circle({
            radius: 30,
            fill: new Fill({ color: "rgba(255, 0, 0, 0.1)" }),
          }),
        }),
      });

      newMap.addLayer(hospitalVectorLayer);
      newMap.addLayer(diseaseVectorLayer);

      setHospitalVectorLayer(hospitalVectorLayer);
      setDiseaseVectorLayer(diseaseVectorLayer);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapView([longitude, latitude]);
        },
        (error) => {
          console.error("Error getting current location:", error);
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

        setMapView(DEFAULT_COORDINATES);
      }
    }
  }, [hospitals, hospitalVectorLayer, map]);

  useEffect(() => {
    if (diseaseVectorLayer) {
      diseaseVectorLayer.getSource().clear();

      if (diseaseHotspots.length > 0) {
        const diseaseHotspotFeatures = diseaseHotspots.map((diseaseSpot) => {
          const coords = [diseaseSpot.longitude, diseaseSpot.latitude];
          return createDiseaseHotspot(coords);
        });

        diseaseVectorLayer.getSource().addFeatures(diseaseHotspotFeatures);
      }
    }
  }, [diseaseHotspots, diseaseVectorLayer]);

  const handleDiseaseCoordinates = async (selectedDisease) => {
    try {
      const { data } = await axios.get(
        `/api/appointment/disease/${selectedDisease}`
      );

      // Filter out entries with null coordinates
      const validData = data.filter(
        (diseaseSpot) =>
          diseaseSpot.coordinates &&
          diseaseSpot.coordinates.latitude !== null &&
          diseaseSpot.coordinates.longitude !== null
      );

      const diseaseHotspots = validData.map((diseaseSpot) => ({
        latitude: diseaseSpot.coordinates.latitude,
        longitude: diseaseSpot.coordinates.longitude,
      }));

      setDiseaseHotspots(diseaseHotspots);
    } catch (error) {
      console.error(error);
    }
  };

  const getHospitals = async () => {
    try {
      const { data } = await axios.get("/api/hospitals");
      const hospitalCoords = data.map((hospital) => ({
        latitude: hospital.coordinates.latitude,
        longitude: hospital.coordinates.longitude,
      }));
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
          style={{ width: "100%", height: "100%" }}
        ></div>
      </div>
    </>
  );
};

export default MapComponent;
