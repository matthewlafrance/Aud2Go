// app/player.tsx
import { Audio } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Text, View } from 'react-native';

export default function PlayerScreen() {
  // Grab the params passed from the library screen
  const { url, name } = useLocalSearchParams();
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    loadAndPlayAudio();
    // Cleanup: Stop audio when the user leaves this screen
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const loadAndPlayAudio = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true } // Auto-play on load
      );
      setSound(newSound);
      setIsPlaying(true);
    } catch (err) {
      Alert.alert("Playback Error", "Could not load the audio track.");
    }
  };

  const togglePlayback = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, color: 'gray', marginBottom: 10 }}>Now Playing</Text>
      <Text style={{ fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 }}>
        {name}
      </Text>

      <View style={{ flexDirection: 'row', gap: 20 }}>
        <Button title={isPlaying ? "Pause" : "Play"} onPress={togglePlayback} />
        <Button title="Close Player" color="gray" onPress={() => router.back()} />
      </View>
    </View>
  );
}