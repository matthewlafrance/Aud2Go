import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator, Alert } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

// Services
import { auth } from '../src/config/firebase';
import { registerUser, loginUser, logoutUser } from '../src/services/authService';
import { uploadAudioFile } from '../src/services/storageService';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // File Upload & Playback State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sound, setSound] = useState();
  const [uploadedUrl, setUploadedUrl] = useState(null);

  // Listen for Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  // --- Auth Handlers ---
  const handleSignUp = async () => {
    const { error } = await registerUser(email, password);
    if (error) Alert.alert("Error", error);
  };

  const handleLogin = async () => {
    const { error } = await loginUser(email, password);
    if (error) Alert.alert("Error", error);
  };

  const handleLogout = async () => {
    await logoutUser();
    setSelectedFile(null);
    setUploadedUrl(null);
  };

  // --- Audio Handlers ---
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*', // Only allow audio files
        copyToCacheDirectory: true,
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert("Error picking file", err.message);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    
    const { success, downloadUrl, error } = await uploadAudioFile(
      currentUser.uid,
      selectedFile.uri,
      selectedFile.name
    );

    setIsUploading(false);

    if (success) {
      Alert.alert("Success", "File uploaded to Firebase!");
      setUploadedUrl(downloadUrl); // Save URL for playback
      setSelectedFile(null); // Clear selection
    } else {
      Alert.alert("Upload Failed", error);
    }
  };

  const playAudio = async (uri) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri });
      setSound(sound);
      await sound.playAsync();
    } catch (err) {
      Alert.alert("Playback Error", "Could not play the audio file.");
    }
  };

  // --- UI Renders ---
  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  // LOGGED IN VIEW
  if (currentUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>Welcome, {currentUser.email}!</Text>
        
        {/* Upload Section */}
        <View style={{ padding: 20, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 20 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Upload Audio</Text>
          <Button title="1. Pick Audio File" onPress={pickDocument} />
          
          {selectedFile && (
            <View style={{ marginTop: 10 }}>
              <Text>Selected: {selectedFile.name}</Text>
              <Button 
                title={isUploading ? "Uploading..." : "2. Upload to Firebase"} 
                onPress={handleUpload} 
                disabled={isUploading} 
              />
            </View>
          )}
        </View>

        {/* Playback Section */}
        {uploadedUrl && (
          <View style={{ padding: 20, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, marginBottom: 20 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Stream Uploaded Audio</Text>
            <Button title="Play from Cloud" color="green" onPress={() => playAudio(uploadedUrl)} />
          </View>
        )}

        <View style={{ marginTop: 20 }}>
          <Button title="Log Out" color="red" onPress={handleLogout} />
        </View>
      </View>
    );
  }

  // LOGGED OUT VIEW
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, marginBottom: 10, padding: 8 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, marginBottom: 20, padding: 8 }} />
      <Button title="Log In" onPress={handleLogin} />
      <View style={{ height: 10 }} />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}
