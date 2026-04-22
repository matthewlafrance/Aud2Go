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
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>Aud2Go</Text>
      <TextInput 
        placeholder="Email" 
        value={email} 
        onChangeText={setEmail} 
        autoCapitalize="none" 
        style={{ borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 }} 
      />
      <TextInput 
        placeholder="Password" 
        value={password} 
        onChangeText={setPassword} 
        secureTextEntry 
        style={{ borderWidth: 1, marginBottom: 20, padding: 10, borderRadius: 5 }} 
      />
      <Button title="Log In" onPress={() => handleAuth(false)} />
      <View style={{ height: 10 }} />
      <Button title="Sign Up" onPress={() => handleAuth(true)} color="gray" />
    </View>
  );
}