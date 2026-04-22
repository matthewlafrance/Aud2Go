// app/library.tsx
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, Text, TextInput, View } from 'react-native';

import { supabase } from '../src/config/supabase';
import { logoutUser } from '../src/services/authService';
import { getUserAudioFiles, uploadAudioFile } from '../src/services/storageService';

export default function LibraryScreen() {
  const [library, setLibrary] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [userId, setUserId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
    <View style={{ flex: 1, paddingTop: 60, paddingHorizontal: 20 }}>
      {/* HEADER */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>All Files</Text>
        <Button title="Logout" color="red" onPress={handleLogout} />
      </View>

      {/* UPLOAD BAR */}
      <View style={{ backgroundColor: '#f0f0f0', padding: 15, borderRadius: 10, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontWeight: '600', color: '#333' }}>Add a new track:</Text>
        {isUploading ? (
          <ActivityIndicator size="small" color="#007BFF" />
        ) : (
          <Button title="Upload File" onPress={handleUpload} />
        )}
      </View>

      {/* SEARCH */}
      <TextInput
        placeholder="Search by name..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8, marginBottom: 20, backgroundColor: '#f9f9f9' }}
      />

      {/* FILE LIST */}
      <FlatList
        data={filteredFiles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 15, borderBottomWidth: 1, borderColor: '#eee', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ flex: 1, marginRight: 10 }} numberOfLines={1}>{item.file_name}</Text>
            <Button 
              title="Play" 
              color="green"
              // Pass data to the player screen
              onPress={() => router.push({ pathname: '/player', params: { url: item.download_url, name: item.file_name } })} 
            />
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: 'gray', marginTop: 20 }}>No files found.</Text>}
      />
    </View>
  );
}