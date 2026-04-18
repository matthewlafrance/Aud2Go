import { Audio } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Platform, ScrollView, Text, TextInput, View } from 'react-native';

// Supabase & Services
import { supabase } from '../src/config/supabase';
import { loginUser, logoutUser, registerUser } from '../src/services/authService';
import { deleteAudioFile, getUserAudioFiles, uploadAudioFile } from '../src/services/storageService'; // <-- Added delete import

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // File & Playback State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [sound, setSound] = useState();

  // Library State
  const [library, setLibrary] = useState([]);

  // 1. Supabase Auth Listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fetch Library when User changes
  useEffect(() => {
    if (currentUser) {
      loadLibrary();
    } else {
      setLibrary([]);
    }
  }, [currentUser]);

  // 3. Cleanup audio when leaving screen
  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

  // --- Handlers ---
  const loadLibrary = async () => {
    const { success, files, error } = await getUserAudioFiles(currentUser.id);
    if (success) {
      setLibrary(files);
    } else {
      Alert.alert("Error loading library", error);
    }
  };

  const handleSignUp = async () => {
    const { error } = await registerUser(email, password);
    if (error) Alert.alert("Sign Up Error", error);
    else Alert.alert("Success", "Account created! You can now log in.");
  };

  const handleLogin = async () => {
    const { error } = await loginUser(email, password);
    if (error) Alert.alert("Login Error", error);
  };

  const handleLogout = async () => {
    await logoutUser();
    setSelectedFile(null);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
      if (!result.canceled) setSelectedFile(result.assets[0]);
    } catch (err) {
      Alert.alert("Error", err.message);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    
    const { success, error } = await uploadAudioFile(currentUser.id, selectedFile.uri, selectedFile.name);
    
    setIsUploading(false);

    if (success) {
      setSelectedFile(null);
      loadLibrary(); 
    } else {
      Alert.alert("Upload Failed", error);
    }
  };

  const playAudio = async (uri) => {
    try {
      if (sound) await sound.unloadAsync(); 
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      Alert.alert("Error", "Could not play audio.");
    }
  };

const handleDelete = async (fileId, downloadUrl) => {
    
  // The actual deletion logic extracted into a helper function
  const executeDelete = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }

    const { success, error } = await deleteAudioFile(fileId, downloadUrl);
    if (success) {
      loadLibrary(); 
    } else {
      Alert.alert("Delete Failed", error);
    }
  };

  // 1. If testing on Web browser
  if (Platform.OS === 'web') {
    const confirmed = window.confirm("Are you sure you want to permanently delete this audio file?");
    if (confirmed) {
      executeDelete();
    }
  } 
  // 2. If testing on iOS/Android Simulator
  else {
    Alert.alert(
      "Delete Track",
      "Are you sure you want to permanently delete this audio file?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: executeDelete }
      ]
    );
  }
};

  // --- Renders ---
  if (loading) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;

  if (currentUser) {
    return (
      <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 20 }}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>Logged in as: {currentUser.email}</Text>
        
        {/* UPLOAD SECTION */}
        <View style={{ backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 20 }}>
          <Button title="1. Pick Audio File" onPress={pickDocument} />
          {selectedFile && <Text style={{ textAlign: 'center', marginVertical: 10 }}>{selectedFile.name}</Text>}
          <View style={{ marginVertical: 10 }}>
            <Button title={isUploading ? "Uploading..." : "2. Upload to Supabase"} onPress={handleUpload} disabled={!selectedFile || isUploading} />
          </View>
        </View>

        {/* LIBRARY SECTION */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Your Library</Text>
        <ScrollView style={{ flex: 1 }}>
          {library.length === 0 ? (
            <Text style={{ fontStyle: 'italic', color: 'gray' }}>No audio files yet.</Text>
          ) : (
            library.map((file) => (
              <View key={file.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderColor: '#eee' }}>
                <Text style={{ flex: 1, marginRight: 10 }} numberOfLines={1}>{file.file_name}</Text>
                
                {/* Updated Row Buttons */}
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <Button title="Play" color="green" onPress={() => playAudio(file.download_url)} />
                  <Button title="X" color="red" onPress={() => handleDelete(file.id, file.download_url)} />
                </View>

              </View>
            ))
          )}
        </ScrollView>

        <View style={{ marginVertical: 20 }}>
          <Button title="Log Out" color="red" onPress={handleLogout} />
        </View>
      </View>
    );
  }

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
