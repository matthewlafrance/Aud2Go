import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Audio } from 'expo-av';

// Supabase & Services
import { supabase } from '../src/config/supabase';
import { registerUser, loginUser, logoutUser } from '../src/services/authService';
import { uploadAudioFile, getUserAudioFiles } from '../src/services/storageService'; // <-- Imported the new function

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
      setLibrary([]); // Clear library on logout
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
      loadLibrary(); // Refresh the list so the new track appears instantly!
    } else {
      Alert.alert("Upload Failed", error);
    }
  };

  const playAudio = async (uri) => {
    try {
      if (sound) await sound.unloadAsync(); // Stop current track if one is playing
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      Alert.alert("Error", "Could not play audio.");
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
                <Button title="Play" color="green" onPress={() => playAudio(file.download_url)} />
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
