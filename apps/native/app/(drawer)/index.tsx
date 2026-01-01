import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Surface, useThemeColor } from "heroui-native";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import { usePC } from "@/contexts/pc-context";
import { wakeOnLan } from "@/utils/wol";
import { useSettings } from "@/contexts/settings-context";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MainHeader } from "@/components/main-header";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { selectedPC } = usePC();
  const { autoConnectEnabled, triggerHaptic } = useSettings();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (autoConnectEnabled && selectedPC?.ip) {
      console.log("Auto-connecting to", selectedPC.name);
    }
  }, [autoConnectEnabled, selectedPC]);

  const sendCommand = async (endpoint: string) => {
    if (!selectedPC) {
      Alert.alert("No PC Selected", "Please select a PC in settings.");
      return;
    }
    const { ip, port } = selectedPC;
    if (!ip) {
      Alert.alert("Error", "Selected PC has no IP address");
      return;
    }

    if (selectedPC?.status === "offline") {
      Alert.alert("Offline", "PC is offline and cannot receive commands.");
      return;
    }

    setIsLoading(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`http://${ip}:${port || 3000}/${endpoint}`, {
        method: "POST",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        Alert.alert("Success", `Command sent: ${endpoint}`);
      } else {
        Alert.alert("Error", `Server error: ${response.status}`);
      }
    } catch (err: any) {
      Alert.alert("Connection Failed", "Could not connect to PC Agent.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWake = async () => {
    if (!selectedPC?.mac) {
      Alert.alert("Error", "Selected PC has no MAC address");
      return;
    }

    if (selectedPC?.status === "online") {
      Alert.alert("Already On", "This PC is already online.");
      return;
    }

    try {
      await wakeOnLan(selectedPC.mac);
      Alert.alert("Sent", "Wake-on-LAN packet sent.");
    } catch (err: any) {
      Alert.alert("Error", `Failed to send WoL: ${err.message}`);
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingTop: Math.max(insets.top, 12) + 100,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Action Buttons */}
        <View className="flex-1 gap-4">
          {/* Turn On Button - Large */}
          <Pressable
            onPress={() => {
              triggerHaptic();
              handleWake();
            }}
            className="active:opacity-80"
          >
            <Surface className="bg-blue-500 rounded-3xl h-28 flex-row items-center px-6 overflow-hidden shadow-lg relative">
              {/* Gradiente sutil para o botão principal também */}
              <LinearGradient
                colors={["rgba(255,255,255,0.1)", "transparent"]}
                start={{ x: 1, y: 1 }}
                end={{ x: 0.5, y: 0.5 }}
                style={StyleSheet.absoluteFill}
              />

              <View className="w-16 h-16 bg-white/20 rounded-2xl items-center justify-center mr-4">
                <Ionicons name="power" size={32} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="text-white text-2xl font-bold tracking-wide">
                  TURN ON
                </Text>
                <Text className="text-white/70 text-sm font-medium mt-0.5">
                  Wake-on-LAN
                </Text>
              </View>
              <View className="absolute right-4 opacity-10">
                <Ionicons name="power" size={100} color="#fff" />
              </View>
            </Surface>
          </Pressable>

          {/* 2x2 Grid of Actions */}
          <View className="flex-row gap-4 flex-1">
            {/* Lock PC */}
            <Pressable
              onPress={() => {
                triggerHaptic();
                Alert.alert(
                  "Lock PC",
                  "This feature will be implemented soon."
                );
              }}
              className="flex-1 active:opacity-80"
            >
              {/* Borda Zinc bem sutil */}
              <Surface className="bg-card rounded-3xl h-full items-start justify-between p-5 border border-zinc-500/20 overflow-hidden relative">
                {/* Glow Cinza/Azulado (Zinc) - Bem fraco (0.08) - Canto Inferior Direito */}
                <LinearGradient
                  colors={["rgba(113, 113, 122, 0.08)", "transparent"]}
                  start={{ x: 1, y: 1 }}
                  end={{ x: 0.2, y: 0.2 }}
                  style={StyleSheet.absoluteFill}
                />

                <View className="w-14 h-14 bg-zinc-500/10 rounded-2xl items-center justify-center">
                  <Ionicons name="lock-closed" size={24} color="#a1a1aa" />
                </View>
                <View>
                  <Text className="text-foreground text-xl font-bold mb-1">
                    Lock PC
                  </Text>
                  <Text className="text-zinc-500 text-xs font-medium tracking-widest uppercase opacity-80">
                    SECURE
                  </Text>
                </View>
              </Surface>
            </Pressable>

            {/* Sleep */}
            <Pressable
              onPress={() => {
                triggerHaptic();
                sendCommand("sleep");
              }}
              className="flex-1 active:opacity-80"
            >
              {/* Borda Indigo sutil */}
              <Surface className="bg-card rounded-3xl h-full items-start justify-between p-5 border border-indigo-500/20 overflow-hidden relative">
                {/* Glow Indigo/Roxo - Bem fraco (0.08) - Canto Inferior Direito */}
                <LinearGradient
                  colors={["rgba(99, 102, 241, 0.08)", "transparent"]}
                  start={{ x: 1, y: 1 }}
                  end={{ x: 0.2, y: 0.2 }}
                  style={StyleSheet.absoluteFill}
                />

                <View className="w-14 h-14 bg-indigo-500/10 rounded-2xl items-center justify-center">
                  <Ionicons name="moon" size={24} color="#818cf8" />
                </View>
                <View>
                  <Text className="text-foreground text-xl font-bold mb-1">
                    Sleep
                  </Text>
                  <Text className="text-indigo-400 text-xs font-medium tracking-widest uppercase opacity-80">
                    SUSPEND
                  </Text>
                </View>
              </Surface>
            </Pressable>
          </View>

          {/* Second Row */}
          <View className="flex-row gap-4 flex-1 mb-8">
            {/* Reboot */}
            <Pressable
              onPress={() => {
                triggerHaptic();
                sendCommand("restart");
              }}
              className="flex-1 active:opacity-80"
            >
              <Surface className="bg-card rounded-3xl h-full items-start justify-between p-5 border border-amber-500/20 overflow-hidden relative">
                {/* Glow Laranja - Canto Inferior Direito */}
                <LinearGradient
                  colors={["rgba(245, 158, 11, 0.15)", "transparent"]}
                  start={{ x: 1, y: 1 }}
                  end={{ x: 0.2, y: 0.2 }}
                  style={StyleSheet.absoluteFill}
                />

                <View className="w-14 h-14 bg-amber-500/10 rounded-2xl items-center justify-center">
                  <Ionicons name="reload" size={24} color="#fbbf24" />
                </View>
                <View>
                  <Text className="text-foreground text-xl font-bold mb-1">
                    Reboot
                  </Text>
                  <Text className="text-amber-500 text-xs font-medium tracking-widest uppercase opacity-90">
                    RESTART
                  </Text>
                </View>
              </Surface>
            </Pressable>

            {/* Shutdown */}
            <Pressable
              onPress={() => {
                triggerHaptic();
                sendCommand("shutdown");
              }}
              className="flex-1 active:opacity-80"
            >
              <Surface className="bg-card rounded-3xl h-full items-start justify-between p-5 border border-red-500/20 overflow-hidden relative">
                {/* Glow Vermelho - Canto Inferior Direito */}
                <LinearGradient
                  colors={["rgba(239, 68, 68, 0.15)", "transparent"]}
                  start={{ x: 1, y: 1 }}
                  end={{ x: 0.2, y: 0.2 }}
                  style={StyleSheet.absoluteFill}
                />

                <View className="w-14 h-14 bg-red-500/10 rounded-2xl items-center justify-center">
                  <Ionicons name="power" size={24} color="#ef4444" />
                </View>
                <View>
                  <Text className="text-foreground text-xl font-bold mb-1">
                    Shutdown
                  </Text>
                  <Text className="text-red-500 text-xs font-medium tracking-widest uppercase opacity-90">
                    POWER OFF
                  </Text>
                </View>
              </Surface>
            </Pressable>
          </View>
        </View>

        {/* Footer */}
        <View className="items-center flex-row justify-center pb-4 opacity-40">
          <MaterialCommunityIcons
            name="shield-check"
            size={16}
            color="#9ca3af"
            className="mr-2"
          />
          <Text className="text-muted text-xs font-mono tracking-widest">
            SECURE LAN CONNECTION
          </Text>
        </View>
      </ScrollView>

      <MainHeader />
    </View>
  );
}
