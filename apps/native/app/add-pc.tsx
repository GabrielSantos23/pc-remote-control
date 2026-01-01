import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, Stack } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { usePC } from "@/contexts/pc-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "expo-glass-effect";

// --- Reusable Form Row Component ---
interface FormRowProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon: React.ReactNode;
  iconBg: string;
  keyboardType?: "default" | "numeric" | "url" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  isLast?: boolean;
}

function FormRow({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  iconBg,
  keyboardType = "default",
  autoCapitalize = "none",
  isLast = false,
}: FormRowProps) {
  return (
    <View>
      <View className="flex-row items-center px-4 py-3 min-h-[56px]">
        {/* Icon */}
        <View
          className={`w-8 h-8 rounded-lg items-center justify-center mr-4 ${iconBg}`}
        >
          {icon}
        </View>

        {/* Input Container */}
        <View className="flex-1 flex-col justify-center">
          <Text className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-0.5">
            {label}
          </Text>
          <TextInput
            className="text-[17px] text-foreground font-medium p-0 leading-5"
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            value={value}
            onChangeText={onChangeText}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
          />
        </View>

        {/* Clear Button (only shows if there is text) */}
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")} className="p-1">
            <Ionicons name="close-circle" size={18} color="#e5e7eb" />
          </Pressable>
        )}
      </View>
      {!isLast && <View className="h-[1px] ml-16 bg-default-100" />}
    </View>
  );
}

export default function AddPCScreen() {
  const { addPC } = usePC();
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [mac, setMac] = useState("");
  const [port, setPort] = useState("3000");
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const foregroundColor = useThemeColor("foreground");

  const handleSave = async () => {
    if (!name || !ip || !mac) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await addPC({
        name,
        ip,
        mac,
        port,
        status: "unknown",
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to save PC");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-background!">
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />

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

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            paddingTop: Math.max(insets.top, 20) + 60, // Push content down to clear button
            paddingBottom: 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-[34px] font-bold text-foreground tracking-tight mb-4">
            Connect Device
          </Text>

          <Text className="text-muted text-[15px] mb-8 leading-6">
            Enter your PC details below to enable remote control. Ensure
            Wake-on-LAN is enabled in your BIOS.
          </Text>

          {/* SECTION 1: IDENTITY */}
          <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-2 px-1">
            Device Identity
          </Text>
          <View className="bg-card rounded-[20px] overflow-hidden mb-8 shadow-sm">
            <FormRow
              label="PC Name"
              placeholder="e.g. Living Room Gaming Rig"
              value={name}
              onChangeText={setName}
              icon={
                <MaterialCommunityIcons
                  name="monitor"
                  size={20}
                  color="#3B82F6"
                />
              }
              iconBg="bg-blue-500/10"
              autoCapitalize="sentences"
              isLast
            />
          </View>

          {/* SECTION 2: NETWORK CONFIG */}
          <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-2 px-1">
            Network Configuration
          </Text>
          <View className="bg-card rounded-[20px] overflow-hidden mb-6 shadow-sm">
            <FormRow
              label="IP Address"
              placeholder="192.168.1.X"
              value={ip}
              onChangeText={setIp}
              icon={
                <MaterialCommunityIcons
                  name="server-network"
                  size={20}
                  color="#10B981"
                />
              }
              iconBg="bg-emerald-500/10"
              keyboardType="numeric"
            />

            <FormRow
              label="Port"
              placeholder="3000"
              value={port}
              onChangeText={setPort}
              icon={
                <MaterialCommunityIcons
                  name="ethernet-cable"
                  size={20}
                  color="#F59E0B"
                />
              }
              iconBg="bg-amber-500/10"
              keyboardType="numeric"
            />

            <FormRow
              label="MAC Address"
              placeholder="XX:XX:XX:XX:XX:XX"
              value={mac}
              onChangeText={setMac}
              icon={<Ionicons name="finger-print" size={20} color="#8B5CF6" />}
              iconBg="bg-violet-500/10"
              autoCapitalize="characters"
              isLast
            />
          </View>

          {/* SCAN BUTTON */}
          <Pressable
            className="flex-row items-center justify-center p-4 rounded-xl bg-blue-500/10 active:bg-blue-500/20 mb-8"
            onPress={() => Alert.alert("Scan", "Scanning feature coming soon!")}
          >
            <Ionicons name="scan" size={20} color="#3b82f6" className="mr-2" />
            <Text className="text-primary font-semibold text-[16px]">
              Scan network for devices
            </Text>
          </Pressable>
        </ScrollView>

        {/* SAVE BUTTON - Fixed at bottom */}
        <View className="absolute bottom-8 left-5 right-5">
          <Button
            size="lg"
            variant="primary"
            onPress={handleSave}
            isLoading={loading}
            className="w-full shadow-lg shadow-blue-500/30 rounded-2xl"
          >
            Save Connection
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
