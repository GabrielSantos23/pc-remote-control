import React, { createContext, useContext, useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

export interface NotificationSettings {
  masterEnabled: boolean;
  onlineAlert: boolean;
  disconnectAlert: boolean;
  sshReady: boolean;
  arrivalPrompt: boolean;
  departureWarn: boolean;
}

interface NotificationsContextType {
  settings: NotificationSettings;
  updateSetting: <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
  hasPermission: boolean;
  sendNotification: (title: string, body: string, data?: any) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const NotificationsContext = createContext<
  NotificationsContextType | undefined
>(undefined);

const SETTINGS_KEY = "pc_remote_notifications";

const DEFAULT_SETTINGS: NotificationSettings = {
  masterEnabled: true,
  onlineAlert: true,
  disconnectAlert: true,
  sshReady: false,
  arrivalPrompt: false,
  departureWarn: true,
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function NotificationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await SecureStore.getItemAsync(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load notification settings", error);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save notification settings", error);
    }
  };

  const checkPermissions = async () => {
    const { status: existingStatus } =
      (await Notifications.getPermissionsAsync()) as any;
    setHasPermission(existingStatus === "granted");
  };

  const requestPermissions = async (): Promise<boolean> => {
    const { status: existingStatus } =
      (await Notifications.getPermissionsAsync()) as any;

    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = (await Notifications.requestPermissionsAsync()) as any;
      finalStatus = status;
    }

    const granted = finalStatus === "granted";
    setHasPermission(granted);

    if (!granted) {
      console.warn("Notification permissions not granted");
    }

    return granted;
  };

  const updateSetting = async <K extends keyof NotificationSettings>(
    key: K,
    value: NotificationSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };

    // If enabling master switch, request permissions
    if (key === "masterEnabled" && value === true) {
      const granted = await requestPermissions();
      if (!granted) {
        // Don't enable if permissions not granted
        return;
      }
    }

    await saveSettings(newSettings);
  };

  const sendNotification = async (title: string, body: string, data?: any) => {
    // Check if notifications are enabled
    if (!settings.masterEnabled || !hasPermission) {
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error("Failed to send notification", error);
    }
  };

  const resetSettings = async () => {
    await saveSettings(DEFAULT_SETTINGS);
  };

  return (
    <NotificationsContext.Provider
      value={{
        settings,
        updateSetting,
        requestPermissions,
        hasPermission,
        sendNotification,
        resetSettings,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
};
