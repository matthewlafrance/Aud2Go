// app/library.tsx
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Text, TextInput, View } from 'react-native';

import { supabase } from '../src/config/supabase';
import { logoutUser } from '../src/services/authService';
import { getUserAudioFiles, uploadAudioFile } from '../src/services/storageService';

import { useAudio } from '../context/AudioContext';

export default function LibraryScreen() {
  const [library, setLibrary] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const { setQueue } = useAudio();

  useEffect(() => {
    // Get user and load files
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchFiles(user.id);
      }
    });
  }, []);

  const fetchFiles = async (uid) => {
    const { success, files } = await getUserAudioFiles(uid);
    if (success) setLibrary(files);
  };

  const handleLogout = async () => {
    await logoutUser();
    router.replace('/'); // Send back to login
  };

  // Combined Upload Handler
  const handleUpload = async () => {
    try {
      // Pick the file
      const result = await DocumentPicker.getDocumentAsync({ type: 'audio/*', copyToCacheDirectory: true });
      if (result.canceled) return;

      setIsUploading(true);
      const file = result.assets[0];

      // Upload it
      const { success, error } = await uploadAudioFile(userId, file.uri, file.name);
      
      setIsUploading(false);

      // Refresh the UI
      if (success) {
        fetchFiles(userId); 
      } else {
        Alert.alert("Upload Failed", error);
      }
    } catch (err) {
      setIsUploading(false);
      Alert.alert("Error", err.message);
    }
  };

  // Basic Search Filter
  const filteredFiles = library.filter(file => 
    file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 20, backgroundColor: "#0F0F0F",}}>
      {/* HEADER */}
      <View
  style={{
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  }}
>
  <View>
    <Text
      style={{
        fontSize: 32,
        fontWeight: "800",
        color: "white",
      }}
    >
      Library
    </Text>

    <Text
      style={{
        color: "#A1A1AA",
        marginTop: 4,
      }}
    >
      Your uploaded tracks
    </Text>
  </View>

  <Button title="Logout" color="#EF4444" onPress={handleLogout} />
</View>

      {/* UPLOAD BAR */}
      <View
  style={{
    backgroundColor: "#18181B",
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  <View>
    <Text
      style={{
        fontWeight: "700",
        color: "white",
        fontSize: 18,
      }}
    >
      Upload Audio
    </Text>

    <Text
      style={{
        color: "#A1A1AA",
        marginTop: 4,
      }}
    >
      MP3s, podcasts, lectures
    </Text>
  </View>

  {isUploading ? (
    <ActivityIndicator size="small" color="#8B5CF6" />
  ) : (
    <Button title="Upload" onPress={handleUpload} />
  )}
</View>

      {/* SEARCH */}
      <TextInput
  placeholder="Search your library..."
  placeholderTextColor="#777"
  value={searchQuery}
  onChangeText={setSearchQuery}
  style={{
    backgroundColor: "#18181B",
    color: "white",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    fontSize: 16,
  }}
/>

      {/* FILE LIST */}
      <FlatList
        data={filteredFiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
  <View
    style={{
      padding: 18,
      backgroundColor: "#18181B",
      borderRadius: 20,
      marginBottom: 14,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    }}
  >
    <View style={{ flex: 1, marginRight: 14 }}>
      <Text
        style={{
          color: "white",
          fontSize: 16,
          fontWeight: "700",
        }}
        numberOfLines={1}
      >
        {item.file_name}
      </Text>

      <Text
        style={{
          color: "#A1A1AA",
          marginTop: 4,
        }}
      >
        Audio File
      </Text>
    </View>

    <Button
      title="Play"
      color="#8B5CF6"
      onPress={() => {
        setQueue(filteredFiles, index);
        router.push('/player');
      }}
    />
  </View>
)}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>No files found.</Text>}
      />
    </View>
  );
}