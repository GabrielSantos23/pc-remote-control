import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { Button, useThemeColor } from "heroui-native";
import { useState, useEffect } from "react";
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

// --- Reusable Form Row Component (Same as Add Page) ---
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
  const dividerColor = useThemeColor("divider");

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

        {/* Clear Button */}
        {value.length > 0 && (
          <Pressable onPress={() => onChangeText("")} className="p-1">
            <Ionicons name="close-circle" size={18} color="#e5e7eb" />
          </Pressable>
        )}
      </View>
      {!isLast && (
        <View
          className="h-[1px] ml-16"
          style={{ backgroundColor: dividerColor }}
        />
      )}
    </View>
  );
}

export default function EditPCScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pcs, updatePC, removePC } = usePC();

  // Find the PC to edit
  const pcToEdit = pcs.find((pc) => pc.id === id);

  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [mac, setMac] = useState("");
  const [port, setPort] = useState("");
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const foregroundColor = useThemeColor("foreground");
  const backgroundColor = useThemeColor("background");
  const surfaceColor = useThemeColor("surface");

  // Populate form on mount
  useEffect(() => {
    if (pcToEdit) {
      setName(pcToEdit.name);
      setIp(pcToEdit.ip);
      setMac(pcToEdit.mac);
      setPort(pcToEdit.port || "3000");
    } else {
      // Handle case where ID is invalid
      Alert.alert("Error", "Device not found");
      router.back();
    }
  }, [pcToEdit]);

  const handleSave = async () => {
    if (!name || !ip || !mac) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      await updatePC(id!, {
        name,
        ip,
        mac,
        port,
      });
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to update PC");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Remove Device",
      "Are you sure you want to remove this computer? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await removePC(id!);
            router.back();
          },
        },
      ]
    );
  };

  if (!pcToEdit) return null;

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <Stack.Screen options={{ headerShown: false, gestureEnabled: true }} />

      {/* --- Floating Glass Back Button --- */}
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
                ? "shadow-sm border border-foreground/10"
                : ""
            }`}
            style={
              Platform.OS !== "ios" ? { backgroundColor: surfaceColor } : {}
            }
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
            paddingTop: Math.max(insets.top, 20) + 60,
            paddingBottom: 120,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-row justify-between items-end mb-4">
            <Text
              className="text-[34px] font-bold tracking-tight"
              style={{ color: foregroundColor }}
            >
              Edit Device
            </Text>
          </View>

          <Text className="text-muted text-[15px] mb-8 leading-6">
            Update connection details for{" "}
            <Text className="font-bold text-foreground">{pcToEdit.name}</Text>.
          </Text>

          {/* SECTION 1: IDENTITY */}
          <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-2 px-1">
            Device Identity
          </Text>
          <View
            className="rounded-[20px] overflow-hidden mb-8 shadow-sm"
            style={{ backgroundColor: surfaceColor }}
          >
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
          <View
            className="rounded-[20px] overflow-hidden mb-8 shadow-sm"
            style={{ backgroundColor: surfaceColor }}
          >
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

          {/* SECTION 3: DANGER ZONE */}
          <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-2 px-1">
            Danger Zone
          </Text>
          <View
            className="rounded-[20px] overflow-hidden shadow-sm"
            style={{ backgroundColor: surfaceColor }}
          >
            <Pressable
              onPress={handleDelete}
              className="px-4 py-3.5 flex-row items-center justify-between active:opacity-60"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg items-center justify-center bg-red-100">
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </View>
                <Text className="text-[17px] font-medium text-red-500">
                  Remove This Device
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                className="opacity-30"
                color="#EF4444"
              />
            </Pressable>
          </View>
        </ScrollView>

        {/* SAVE BUTTON */}
        <View className="absolute bottom-8 left-5 right-5">
          <Button
            size="lg"
            variant="primary"
            onPress={handleSave}
            isLoading={loading}
            className="w-full shadow-lg shadow-blue-500/30 rounded-2xl"
          >
            Save Changes
          </Button>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
