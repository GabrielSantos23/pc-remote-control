import { View, Text, Alert } from "react-native";
import { Surface, useThemeColor } from "heroui-native";
import { SettingItem } from "./setting-item";
import { router } from "expo-router";
import { usePC } from "@/contexts/pc-context";
import { useSettings } from "@/contexts/settings-context";

export function AboutSection() {
  const { clearAllPCs } = usePC();
  const { resetSettings } = useSettings();
  const surfaceColor = useThemeColor("surface");

  const handleReset = () => {
    Alert.alert(
      "Reset All Settings",
      "This will remove all connected PCs and restore app preferences to default. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset Everything",
          style: "destructive",
          onPress: async () => {
            await clearAllPCs();
            await resetSettings();
            Alert.alert("Success", "All settings have been reset.");
          },
        },
      ]
    );
  };

  return (
    <View className="mb-8">
      <Surface
        className="rounded-[20px] overflow-hidden"
        style={{ backgroundColor: surfaceColor }}
      >
        <SettingItem
          label="About"
          hasArrow
          onPress={() => router.push("/about")}
        />

        <View className="h-[1px] ml-4 bg-foreground/10" />

        <SettingItem
          label="Reset All Settings"
          isDestructive
          onPress={handleReset}
        />
      </Surface>

      <View className="items-center mt-6 mb-10">
        <Text className="text-muted/60 text-[13px]">
          Version 2.4.1 (Build 890)
        </Text>
      </View>
    </View>
  );
}
