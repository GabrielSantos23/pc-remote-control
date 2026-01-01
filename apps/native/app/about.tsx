import {
  View,
  Text,
  ScrollView,
  Platform,
  Pressable,
  Linking,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "expo-glass-effect";
import { useThemeColor } from "heroui-native";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const foregroundColor = useThemeColor("foreground");
  const backgroundColor = useThemeColor("background");
  const surfaceColor = useThemeColor("surface");

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <Stack.Screen options={{ headerShown: false, presentation: "modal" }} />

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
            <Ionicons name="close" size={26} color={foregroundColor} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingTop: Math.max(insets.top, 20) + 80,
          paddingBottom: 60,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="items-center mb-10">
          <View className="w-24 h-24 bg-primary/10 rounded-[32px] items-center justify-center mb-6">
            <MaterialCommunityIcons
              name="remote-desktop"
              size={48}
              color="#3B82F6"
            />
          </View>
          <Text
            className="text-[32px] font-bold tracking-tight mb-2"
            style={{ color: foregroundColor }}
          >
            PC Remote
          </Text>
          <Text className="text-muted text-base">
            Version 2.4.1 (Build 890)
          </Text>
        </View>

        <View className="mb-10">
          <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-4 px-1">
            About the App
          </Text>
          <View
            className="rounded-[24px] p-6 shadow-sm border border-foreground/5"
            style={{ backgroundColor: surfaceColor }}
          >
            <Text
              className="text-[16px] leading-7 opacity-80"
              style={{ color: foregroundColor }}
            >
              PC Remote Control allows you to manage your desktop computer
              directly from your mobile device.
              {"\n\n"}
              Whether you need to shut down your PC from across the room, wake
              it up using Wake-on-LAN before you arrive home, or securely lock
              it when you step away, our app provides a seamless and secure
              experience.
            </Text>
          </View>
        </View>

        <View className="mb-10">
          <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-4 px-1">
            Features
          </Text>
          <View
            className="rounded-[24px] overflow-hidden shadow-sm border border-foreground/5"
            style={{ backgroundColor: surfaceColor }}
          >
            <FeatureItem
              icon={<Ionicons name="power" size={20} color="#10B981" />}
              title="Remote Control"
              desc="Full power management: Shutdown, Sleep, Restart, and Lock."
            />
            <Divider />
            <FeatureItem
              icon={<Ionicons name="wifi" size={20} color="#3B82F6" />}
              title="Wake-on-LAN"
              desc="Power on your computer from standby or off state."
            />
            <Divider />
            <FeatureItem
              icon={
                <Ionicons name="shield-checkmark" size={20} color="#8B5CF6" />
              }
              title="Secure Setup"
              desc="Encrypted connection protocols ensuring your privacy."
            />
          </View>
        </View>

        <View className="mb-10">
          <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-4 px-1">
            Credits & Links
          </Text>
          <Pressable
            className="rounded-[20px] p-4 flex-row items-center justify-between mb-3"
            style={{ backgroundColor: surfaceColor }}
            onPress={() => Linking.openURL("https://github.com")}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons name="logo-github" size={20} color={foregroundColor} />
              <Text
                className="font-medium text-[16px]"
                style={{ color: foregroundColor }}
              >
                GitHub Repository
              </Text>
            </View>
            <Ionicons name="open-outline" size={18} color="gray" />
          </Pressable>

          <Pressable
            className="rounded-[20px] p-4 flex-row items-center justify-between"
            style={{ backgroundColor: surfaceColor }}
            onPress={() => Linking.openURL("https://pcremote.app")}
          >
            <View className="flex-row items-center gap-3">
              <Ionicons
                name="globe-outline"
                size={20}
                color={foregroundColor}
              />
              <Text
                className="font-medium text-[16px]"
                style={{ color: foregroundColor }}
              >
                Official Website
              </Text>
            </View>
            <Ionicons name="open-outline" size={18} color="gray" />
          </Pressable>
        </View>

        <View className="items-center opacity-40">
          <Text className="text-[12px] text-foreground text-center mb-1">
            Made with ❤️
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function FeatureItem({
  icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  const foregroundColor = useThemeColor("foreground");
  return (
    <View className="p-5 flex-row gap-4">
      <View className="w-10 h-10 rounded-xl bg-foreground/5 items-center justify-center">
        {icon}
      </View>
      <View className="flex-1">
        <Text
          className="font-bold text-[16px] mb-1"
          style={{ color: foregroundColor }}
        >
          {title}
        </Text>
        <Text className="text-muted text-[13px] leading-5">{desc}</Text>
      </View>
    </View>
  );
}

function Divider() {
  const dividerColor = useThemeColor("divider");
  return (
    <View className="h-px ml-16" style={{ backgroundColor: dividerColor }} />
  );
}
