// app/index.tsx
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, TextInput, View } from 'react-native';
import { supabase } from '../src/config/supabase';
import { loginUser, registerUser } from '../src/services/authService';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/library');
      setLoading(false);
    });
  }, []);

  const handleAuth = async (isSignUp) => {
    const { error } = isSignUp 
      ? await registerUser(email, password)
      : await loginUser(email, password);
      
    if (error) Alert.alert("Error", error);
    else router.replace('/library'); // Go to library on success
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View
    style={{
      flex: 1,
      justifyContent: "center",
      padding: 24,
      backgroundColor: "#0F0F0F",
    }}
  >
    <Text
      style={{
        fontSize: 42,
        fontWeight: "800",
        color: "white",
        marginBottom: 8,
      }}
    >
      Aud2Go
    </Text>

    

    <View
      style={{
        backgroundColor: "#18181B",
        padding: 24,
        borderRadius: 24,
      }}
    >
      <TextInput
        placeholder="Email"
        placeholderTextColor="#777"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          backgroundColor: "#27272A",
          color: "white",
          padding: 16,
          borderRadius: 14,
          marginBottom: 16,
          fontSize: 16,
        }}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#777"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{
          backgroundColor: "#27272A",
          color: "white",
          padding: 16,
          borderRadius: 14,
          marginBottom: 24,
          fontSize: 16,
        }}
      />

      <View
        style={{
          backgroundColor: "#8B5CF6",
          borderRadius: 14,
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <Button title="Log In" onPress={() => handleAuth(false)} />
      </View>

      <View
        style={{
          backgroundColor: "#27272A",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <Button title="Sign Up" onPress={() => handleAuth(true)} />
      </View>
    </View>
  </View>
  );
}