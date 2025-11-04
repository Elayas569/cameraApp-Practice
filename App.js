import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { Camera, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

export default function CameraGalleryApp() {
  //Crear states para controlar la app
  const [permission, requestPermission] = useCameraPermissions();
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  // Use Camera.Constants.Type when available; fall back to plain strings to
  // support different expo-camera versions that may export CameraType or not.
  const BACK =
    (Camera &&
      Camera.Constants &&
      Camera.Constants.Type &&
      Camera.Constants.Type.back) ||
    "back";
  const FRONT =
    (Camera &&
      Camera.Constants &&
      Camera.Constants.Type &&
      Camera.Constants.Type.front) ||
    "front";

  const [facing, setFacing] = useState(BACK);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    requestGalleryPermission();
  }, []);

  const requestGalleryPermission = async () => {
    // requestMediaLibraryPermissionsAsync returns an object with status/granted
    const result = await ImagePicker.requestMediaLibraryPermissionsAsync();
    const granted = result.granted ?? result.status === "granted";
    setHasGalleryPermission(granted);

    if (!granted) {
      Alert.alert(
        "Permiso denegado",
        "Se necesita acceso a la galería del teléfono"
      );
    }
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });
        // takePictureAsync returns { uri, width, height, exif, base64? }
        setCapturedImage(photo.uri);
        setShowCamera(false);
      } catch (error) {
        Alert.alert("Error", "No se pudo tomar la foto");
        console.log(error);
      }
    }
  };

  const pickImageFromGallery = async () => {
    if (!hasGalleryPermission) {
      Alert.alert(
        "Permiso denegado",
        "Se necesitan permisos para acceder a la galería"
      );
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setCapturedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image: " + error.message);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === BACK ? FRONT : BACK));
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Solicitando permisos...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No se ha consedido acceso a la cámara</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Solicitar acceso a la camara</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.fullScreen}>
        <Camera style={styles.camera} type={facing} ref={cameraRef}>
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.cameraButtonText}>Voltear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner}></View>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cameraButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cámara y Gallery</Text>

      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.preview} />
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowCamera(true)}
      >
        <Text style={styles.buttonText}>Abrir cámara</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={pickImageFromGallery}>
        <Text style={styles.buttonText}>Abrir galería</Text>
      </TouchableOpacity>

      {capturedImage && (
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={() => setCapturedImage(null)}
        >
          <Text style={styles.buttonText}>Limpiar imagen</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "green",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#222",
  },
  text: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginVertical: 8,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  clearButton: {
    backgroundColor: "#ff4d4d",
  },

  fullScreen: {
    flex: 1,
    backgroundColor: "#000",
  },
  camera: {
    flex: 1,
    justifyContent: "flex-end",
  },
  cameraButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 15,
  },
  cameraButton: {
    padding: 10,
  },
  cameraButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderWidth: 4,
    borderColor: "white",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 50,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
  },
  closeButton: {
    padding: 10,
  },

  preview: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#ccc",
  },
});
