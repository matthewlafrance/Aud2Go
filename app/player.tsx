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
  <View
    style={{
      flex: 1,
      backgroundColor: "#0F0F0F",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    }}
  >
    <View
      style={{
        width: 280,
        height: 280,
        borderRadius: 32,
        backgroundColor: "#8B5CF6",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 40,
      }}
    >
      <Text
        style={{
          fontSize: 90,
          color: "white",
          fontWeight: "800",
        }}
      >
        ♪
      </Text>
    </View>

    <Text
      style={{
        color: "#71717A",
        fontSize: 12,
        letterSpacing: 2,
        marginBottom: 10,
      }}
    >
      NOW PLAYING
    </Text>

    <Text
      style={{
        fontSize: 28,
        fontWeight: "800",
        color: "white",
        textAlign: "center",
        marginBottom: 10,
      }}
    >
      {name}
    </Text>

    <Text
      style={{
        color: "#A1A1AA",
        marginBottom: 40,
      }}
    >
      Uploaded Audio
    </Text>

    <View
      style={{
        flexDirection: "row",
        gap: 24,
      }}
    >
      <Button
        title={isPlaying ? "Pause" : "Play"}
        color="#8B5CF6"
        onPress={togglePlayback}
      />

      <Button
        title="Close"
        color="#3F3F46"
        onPress={() => router.back()}
      />
    </View>
  </View>
);
}
