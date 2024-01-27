import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { SERVER_URL } from "../config.js";
import { Alert } from "react-native";

const StateContext = createContext();
export default StateContext;

export const StateProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [doctorData, setDoctorData] = useState();
  const [loading, setLoading] = useState(false);
  const [patientData, setpatientData] = useState();

  useEffect(() => {
    (async () => {
      const _id = await AsyncStorage.getItem("_id");

      if (_id == null) setIsLogin(false);
      else setIsLogin(true);
    })();
  }, []);

  const Login = async (username, password) => {
    try {
      setLoading(true);
      const { data } = await axios.post(`${SERVER_URL}/api/doctor/login`, {
        username,
        password,
      });
      console.log(data);
      await AsyncStorage.setItem("_id", data);
      setIsLogin(true);
    } catch (error) {
      console.log(error.response.data.error || error.message);
      Alert.alert(error.response.data.error || error.message);
    }
    setLoading(false);
  };

  const getProfile = async () => {
    setLoading(true);
    const id = await AsyncStorage.getItem("_id");
    console.log("Doctor ID:", id);
    try {
      const { data } = await axios.get(
        `${SERVER_URL}/api/dashboard/doctor/${id}`
      );
      const sortedAvailability = data.availability.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      });

      setDoctorData({
        ...data,
        availability: sortedAvailability,
      });
    } catch (error) {
      console.log(error.response.data.error || error.message);
      Alert.alert(error.response.data.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const markAttended = async (appointment_id, disease) => {
    const reqData = {
      diagnosis_result: disease,
    };
    try {
      const { data } = await axios.put(
        `${SERVER_URL}/api/appointment/mark_as_done/${appointment_id}`,
        reqData
      );
      console.log(data);
      getProfile();
    } catch (error) {
      console.log(error.response.data.error || error.message);
      Alert.alert(error.response.data.error || error.message);
    }
  };

  const getPatientInfo = async (id) => {
    setpatientData(null);
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${SERVER_URL}/api/dashboard/patient/${id}`
      );
      data.past_visit.sort((a, b) => new Date(b.date) - new Date(a.date));

      setpatientData(data);
      return data;
    } catch (error) {
      console.log(error.response.data.error || error.message);
      Alert.alert(error.response.data.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StateContext.Provider
      value={{
        isLogin,
        setIsLogin,
        Login,
        getProfile,
        doctorData,
        loading,
        setLoading,
        markAttended,
        getPatientInfo,
        patientData,
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

// Custom hook for using the context
export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used within a StateProvider");
  }
  return context;
};
