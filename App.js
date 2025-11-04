import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

export default function CameraGalleryApp() {
  //Crear states para controlar la app
  const [permission, requestPermission] = useCameraPermissions();
  const [hasGalleryPermission, setHasGalleryPermission] = useState(null);
  const [facing, setFacing] = useState("back");
  const [capturedImage, setCapturedImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef(null);

  useEffect(() => {
    requestGalleryPermission();
  }, []);

  const requestGalleryPermission = async () => {
    const galleryStatus =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    setHasGalleryPermission(galleryStatus === "granted");

    if (galleryStatus != "granted") {
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
        setCapturedImage(photo.url);
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
        "Permission Denied",
        "Permission to access gallery is required!"
      );
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
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
    setFacing((current) => (current === "back" ? "front" : "back"));
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
      <View style={styles.fullscreen}>
        <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
          <View style={styles.cameraButtonContainer}>
            <TouchableOpacity
              style={styles.camerButton}
              onPress={toggleCameraFacing}
            >
              <Text style={styles.cameraButtonText}>Voltear</Text>
            </TouchableOpacity>
            //Falta tomar foto y cerrar
            <TouchableOpacity
              styles={styles.captureButton}
              onPress={takePicture}
            >
              <View style={styles.captureButtonInner}></View>
            </TouchableOpacity>
            <TouchableOpacity
              styles={styles.closeButton}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cameraButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.tittle}>Cámara y Galería</Text>
      {capturedImage && (
        <Image source={{ uri: capturedImage }} style={styles.preview} />
      )}
      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowCamera(true)}
      ></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
