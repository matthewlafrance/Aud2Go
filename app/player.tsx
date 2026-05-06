// app/player.tsx
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Audio } from "expo-av";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { useAudio } from "../context/AudioContext";

export default function PlayerScreen() {
  const { currentTrack, index, next, prev } = useAudio();
  const track = currentTrack;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!track) return;

    let currentSound;

    const load = async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: track.download_url },
          { shouldPlay: true },
          onPlaybackStatusUpdate,
        );

        currentSound = sound;
        setSound(sound);
        setIsPlaying(true);
      } catch (err) {
        Alert.alert("Playback Error", "Could not load the audio track.");
      }
    };

    load();

    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
  }, [track]);

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

  const nextTrack = () => {
    next();
  };

  const prevTrack = () => {
    prev();
  };

  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(1);

  const onPlaybackStatusUpdate = (status) => {
    if (!status.isLoaded) return;

    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 1);
    setIsPlaying(status.isPlaying);

    if (status.didJustFinish) {
      next();
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
      <Pressable
        onPress={() => router.back()}
        style={{
          position: "absolute",
          top: 60,
          left: 20,
          padding: 10,
        }}
      >
        <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
      </Pressable>
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
        {track.file_name}
      </Text>

      <Text
        style={{
          color: "#A1A1AA",
          marginBottom: 20,
        }}
      >
        Uploaded Audio
      </Text>

      <View
        style={{
          flexDirection: "row",
          gap: 24,
        }}
      ></View>
      <Slider
        style={{ width: 300, height: 40, marginBottom: 20 }}
        minimumValue={0}
        maximumValue={duration}
        value={position}
        minimumTrackTintColor="#8B5CF6"
        maximumTrackTintColor="#A1A1AA"
        thumbTintColor="#fefefe"
        onSlidingComplete={async (value) => {
          if (sound) {
            await sound.setPositionAsync(value);
          }
        }}
      />
      <View style={{ flexDirection: "row", gap: 40, marginTop: 20 }}>
        <Pressable onPress={prevTrack}>
          <Ionicons name="play-back" size={40} color="#FFFFFF" />
        </Pressable>

        <Pressable onPress={togglePlayback}>
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={40}
            color="#FFFFFF"
          />
        </Pressable>

        <Pressable onPress={nextTrack}>
          <Ionicons name="play-forward" size={40} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}
