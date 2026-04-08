import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { registerUser, loginUser, logoutUser } from '../src/services/authService';

export default function BasicAuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleSignUp = async () => {
    const { error } = await registerUser(email, password);
    if (error) alert(error);
    else setIsLoggedIn(true);
  };

  const handleLogin = async () => {
    const { error } = await loginUser(email, password);
    if (error) alert(error);
    else setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await logoutUser();
    setIsLoggedIn(false);
    setEmail('');
    setPassword('');
  };

  if (isLoggedIn) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Successfully created account / signed in!</Text>
        <Button title="Log Out" onPress={handleLogout} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 20, padding: 8 }}
      />
      <Button title="Log In" onPress={handleLogin} />
      <View style={{ height: 10 }} />
      <Button title="Sign Up" onPress={handleSignUp} />
    </View>
  );
}
