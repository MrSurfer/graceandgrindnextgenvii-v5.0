"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import useSound from "use-sound";

type SoundType = "click" | "success" | "error";

interface SoundContextType {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: SoundType) => void;
}

const SoundContext = createContext<SoundContextType>({
  soundEnabled: false,
  toggleSound: () => {},
  playSound: () => {},
});

export const usePlatformSound = () => useContext(SoundContext);

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Load preference on mount
  useEffect(() => {
    const saved = localStorage.getItem("preferred_sound");
    if (saved === "true") {
      setSoundEnabled(true);
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("preferred_sound", String(next));
  };

  // We use reliable, subtle CDN placeholders for the prototype
  // In production, these should be replaced with local assets like "/sounds/click.mp3"
  const [playClick] = useSound("https://cdn.freesound.org/previews/256/256113_3263906-lq.mp3", { volume: 0.25 });
  const [playSuccess] = useSound("https://cdn.freesound.org/previews/270/270404_5123851-lq.mp3", { volume: 0.3 });
  const [playError] = useSound("https://cdn.freesound.org/previews/415/415209_5121236-lq.mp3", { volume: 0.3 });

  const playSound = (type: SoundType) => {
    if (!soundEnabled) return;
    
    try {
      if (type === "click") playClick();
      else if (type === "success") playSuccess();
      else if (type === "error") playError();
    } catch (err) {
      console.warn("Sound playback prevented:", err);
    }
  };

  return (
    <SoundContext.Provider value={{ soundEnabled, toggleSound, playSound }}>
      {children}
    </SoundContext.Provider>
  );
}
