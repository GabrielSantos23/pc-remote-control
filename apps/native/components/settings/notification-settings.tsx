import {
  View,
  Text,
  ScrollView,
  Switch,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemeColor } from "heroui-native";
import { GlassView } from "expo-glass-effect";
import { SettingItem } from "./setting-item";
import { useNotifications } from "@/contexts/notifications-context";

export function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const foregroundColor = useThemeColor("foreground");
  const primaryColor = useThemeColor("primary" as any);

  const { settings, updateSetting, hasPermission, requestPermissions } =
    useNotifications();

  useEffect(() => {
    // Check permissions when screen loads
    if (settings.masterEnabled && !hasPermission) {
      requestPermissions();
    }
  }, []);

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- Custom Floating Glass Back Button --- */}
      <View
        className="absolute left-6 z-50"
        style={{ top: Math.max(insets.top, 20) }}
      >
        <View className="relative">
          {Platform.OS === "ios" && (
            <GlassView
              style={{ position: "absolute", inset: 0, borderRadius: 25 }}
              glassEffectStyle="regular"
            />
          )}
          <Pressable
            className={`w-12 h-12 rounded-full items-center justify-center ${
              Platform.OS !== "ios"
                ? "bg-card shadow-sm border border-foreground/10"
                : ""
            }`}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={26} color={foregroundColor} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 20,
          paddingTop: Math.max(insets.top, 20) + 60,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[34px] font-bold text-foreground tracking-tight mb-8">
          Notifications
        </Text>

        {/* Master Switch */}
        <View className="bg-card rounded-[20px] overflow-hidden mb-8 shadow-sm border border-foreground/10">
          <SettingItem
            label="Allow Notifications"
            subtitle="Enable or disable all app notifications."
            icon={
              <Ionicons name="notifications" size={22} color={primaryColor} />
            }
            iconBg="bg-blue-200"
            rightElement={
              <Switch
                value={settings.masterEnabled}
                onValueChange={(value) => updateSetting("masterEnabled", value)}
                trackColor={{ true: "#3b82f6", false: "#e5e7eb" }}
              />
            }
          />
        </View>

        <View
          className={
            !settings.masterEnabled ? "opacity-50 pointer-events-none" : ""
          }
        >
          {/* Status & Availability Section */}
          <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-2 px-1">
            Status & Availability
          </Text>
          <View className="bg-card rounded-[20px] overflow-hidden mb-8 shadow-sm border border-foreground/10">
            <SettingItem
              label="Device Online (WOL)"
              subtitle="Get notified when a PC successfully wakes up and connects."
              icon={<Ionicons name="flash" size={20} color="#EAB308" />}
              iconBg="bg-yellow-500/10"
              rightElement={
                <Switch
                  value={settings.onlineAlert}
                  onValueChange={(value) => updateSetting("onlineAlert", value)}
                  trackColor={{ true: "#3b82f6", false: "#e5e7eb" }}
                />
              }
            />
            <View className="h-[1px] ml-16 bg-foreground/10" />

            <SettingItem
              label="Unexpected Disconnect"
              subtitle="Alerts if a monitored device goes offline."
              icon={
                <MaterialCommunityIcons
                  name="power-plug-off"
                  size={20}
                  color="#EF4444"
                />
              }
              iconBg="bg-red-500/10"
              rightElement={
                <Switch
                  value={settings.disconnectAlert}
                  onValueChange={(value) =>
                    updateSetting("disconnectAlert", value)
                  }
                  trackColor={{ true: "#3b82f6", false: "#e5e7eb" }}
                />
              }
            />
            <View className="h-[1px] ml-16 bg-foreground/10" />

            <SettingItem
              label="SSH Connection Ready"
              subtitle="Notifies when port 22 is open for secure commands."
              icon={<Ionicons name="terminal" size={18} color="#6366F1" />}
              iconBg="bg-indigo-500/10"
              rightElement={
                <Switch
                  value={settings.sshReady}
                  onValueChange={(value) => updateSetting("sshReady", value)}
                  trackColor={{ true: "#3b82f6", false: "#e5e7eb" }}
                />
              }
            />
          </View>

          {/* Automation & Geofencing Section */}
          <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-2 px-1">
            Automation & Geofencing
          </Text>
          <View className="bg-card rounded-[20px] overflow-hidden mb-8 shadow-sm border border-foreground/10">
            <SettingItem
              label="Arrival Suggestions"
              subtitle="Prompt to wake devices when you arrive home."
              icon={<Ionicons name="location" size={20} color="#10B981" />}
              iconBg="bg-emerald-500/10"
              value={settings.arrivalPrompt ? "On" : "Off"}
              rightElement={
                <Switch
                  value={settings.arrivalPrompt}
                  onValueChange={(value) =>
                    updateSetting("arrivalPrompt", value)
                  }
                  trackColor={{ true: "#3b82f6", false: "#e5e7eb" }}
                />
              }
            />

            <View className="h-[1px] ml-16 bg-foreground/10" />

            <SettingItem
              label="Departure Warnings"
              subtitle="Remind you to shut down PCs when you leave."
              icon={<Ionicons name="walk" size={20} color="#F97316" />}
              iconBg="bg-orange-500/10"
              rightElement={
                <Switch
                  value={settings.departureWarn}
                  onValueChange={(value) =>
                    updateSetting("departureWarn", value)
                  }
                  trackColor={{ true: "#3b82f6", false: "#e5e7eb" }}
                />
              }
            />
          </View>

          <Text className="text-muted text-xs px-2 text-center">
            Geofencing features require "Always Allow" location permissions to
            function correctly in the background.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
