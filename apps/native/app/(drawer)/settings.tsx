import { View, Text, ScrollView, Platform } from "react-native";
import { Stack } from "expo-router";
import { useThemeColor } from "heroui-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "expo-glass-effect";
import {
  DevicesSection,
  PreferencesSection,
  NetworkSection,
  AboutSection,
} from "../../components/settings";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = Math.max(insets.top, 12) + 64;
  const backgroundColor = useThemeColor("background");
  const foregroundColor = useThemeColor("foreground");
  const surfaceColor = useThemeColor("surface");

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Fixed Header with Glass Effect */}
      <View
        className="absolute top-0 left-0 right-0 z-10"
        style={{
          height: headerHeight,
        }}
      >
        <View
          className="absolute bottom-0 left-4"
          style={{
            height: 64,
            alignSelf: "flex-start",
          }}
        >
          {Platform.OS === "ios" && (
            <GlassView
              style={{ position: "absolute", inset: 0, borderRadius: 20 }}
              glassEffectStyle="regular"
            />
          )}
          <View
            className={`flex-row items-center justify-between h-full px-6 rounded-2xl ${
              Platform.OS !== "ios"
                ? "shadow-sm border border-foreground/20"
                : ""
            }`}
            style={
              Platform.OS !== "ios" ? { backgroundColor: surfaceColor } : {}
            }
          >
            <View>
              <Text
                className="text-3xl font-bold tracking-tight"
                style={{ color: foregroundColor }}
              >
                Settings
              </Text>
              <Text className="text-xs dark:text-accent-foreground/50 text-muted-foreground mt-0.5 ">
                Manage your preferences
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + 16,
          paddingHorizontal: 16,
          paddingBottom: 60 + insets.bottom,
        }}
      >
        <DevicesSection />

        <PreferencesSection />

        {/* Network Section */}
        <Text className="text-muted uppercase text-xs font-bold mb-3 ml-2 tracking-wider opacity-60">
          Network
        </Text>
        <NetworkSection />

        {/* About Section */}
        <Text className="text-muted uppercase text-xs font-bold mb-3 ml-2 tracking-wider opacity-60">
          About
        </Text>
        <AboutSection />

        <Text className="text-center text-muted text-xs opacity-40 mb-8 leading-5">
          Designed for PC Remote Control{"\n"}© 2023 All Rights Reserved
        </Text>
      </ScrollView>
    </View>
  );
}
