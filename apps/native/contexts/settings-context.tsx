import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as Haptics from "expo-haptics";

interface SettingsContextType {
  hapticsEnabled: boolean;
  autoConnectEnabled: boolean;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  setAutoConnectEnabled: (enabled: boolean) => Promise<void>;
  triggerHaptic: () => void;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

const HAPTICS_KEY = "pc_remote_haptics";
const AUTO_CONNECT_KEY = "pc_remote_auto_connect";

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [hapticsEnabled, setHapticsState] = useState(true);
  const [autoConnectEnabled, setAutoConnectState] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedHaptics = await SecureStore.getItemAsync(HAPTICS_KEY);
      if (storedHaptics !== null) {
        setHapticsState(storedHaptics === "true");
      }

      const storedAutoConnect = await SecureStore.getItemAsync(
        AUTO_CONNECT_KEY
      );
      if (storedAutoConnect !== null) {
        setAutoConnectState(storedAutoConnect === "true");
      }
    } catch (error) {
      console.error("Failed to load settings", error);
    }
  };

  const setHapticsEnabled = async (enabled: boolean) => {
    setHapticsState(enabled);
    await SecureStore.setItemAsync(HAPTICS_KEY, String(enabled));
  };

  const setAutoConnectEnabled = async (enabled: boolean) => {
    setAutoConnectState(enabled);
    await SecureStore.setItemAsync(AUTO_CONNECT_KEY, String(enabled));
  };

  const triggerHaptic = () => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const resetSettings = async () => {
    setHapticsState(true);
    setAutoConnectState(false);
    await SecureStore.deleteItemAsync(HAPTICS_KEY);
    await SecureStore.deleteItemAsync(AUTO_CONNECT_KEY);
  };

  return (
    <SettingsContext.Provider
      value={{
        hapticsEnabled,
        autoConnectEnabled,
        setHapticsEnabled,
        setAutoConnectEnabled,
        triggerHaptic,
        resetSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
