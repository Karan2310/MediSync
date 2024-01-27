import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import StateContext from "../../context/StateContext";

const LoginScreen = ({ navigation }) => {
  const { Login, isLogin, setIsLogin, loading, setLoading } =
    useContext(StateContext);
  const [login, setLogin] = useState({
    username: "",
    password: "",
  });

  useEffect(() => {
    const checkLoginStatus = async () => {
      if (isLogin) {
        navigation.navigate("MainScreen");
      }
    };

    checkLoginStatus();
  }, [isLogin, navigation]);

  const handleLoginPress = async () => {
    await Login(login.username, login.password);
    navigation.navigate("MainScreen");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.outerContainer}
    >
      <View style={styles.innerContainer}>
        <View style={styles.container}>
          <Text style={styles.title}>Login</Text>
          <TextInput
            style={styles.input}
            placeholder="Username or Email"
            value={login.username}
            onChangeText={(text) =>
              setLogin({ ...login, username: text.toLowerCase() })
            }
            required
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={login.password}
            onChangeText={(text) => setLogin({ ...login, password: text })}
            required
            secureTextEntry={true}
          />
          <TouchableOpacity style={styles.button} onPress={handleLoginPress}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.btnText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#fff",
    padding: Platform.OS === "android" ? 20 : 40,
    marginBottom: 80,
    borderRadius: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: "bold",
  },
  input: {
    height: 50,
    borderColor: "gray",
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 16,
    padding: 12,
    width: 300,
    marginTop: 20,
  },
  button: {
    backgroundColor: "#18C37D",
    height: 50,
    color: "#fff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginTop: 30,
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  registerLink: {
    color: "#18C37D",
    marginTop: 10,
    textAlign: "center",
  },
});

export default LoginScreen;
