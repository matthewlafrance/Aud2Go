import React, { createContext, useContext, useState } from "react";

const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [tracks, setTracks] = useState([]);
  const [index, setIndex] = useState(0);

  const currentTrack = tracks[index];

  const setQueue = (newTracks, startIndex = 0) => {
    setTracks(newTracks);
    setIndex(startIndex);
  };

  const next = () => {
    setIndex((prev) => (prev + 1) % tracks.length);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  return (
    <AudioContext.Provider
      value={{
        tracks,
        index,
        currentTrack,
        setQueue,
        next,
        prev,
        setIndex,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => useContext(AudioContext);
