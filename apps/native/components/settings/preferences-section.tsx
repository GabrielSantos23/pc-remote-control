import { View, Text, Switch } from "react-native";
import { Surface, useThemeColor } from "heroui-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppTheme } from "../../contexts/app-theme-context";
import { useSettings } from "../../contexts/settings-context";
import { SettingItem } from "./setting-item";
import { Vibrate } from "lucide-react-native";

export function PreferencesSection() {
  const { hapticsEnabled, setHapticsEnabled } = useSettings();
  const { currentTheme, toggleTheme } = useAppTheme();
  const dividerColor = useThemeColor("divider");
  const surfaceColor = useThemeColor("surface");

  return (
    <View className="mb-8">
      <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-2 px-1">
        App Preferences
      </Text>
      <Surface
        className="rounded-[20px] overflow-hidden"
        style={{ backgroundColor: surfaceColor }}
      >
        {/* Notifications Item (Placeholder as per image) */}
        <SettingItem
          icon={<Ionicons name="notifications" size={20} color="#F97316" />}
          iconBg="bg-orange-100"
          label="Notifications"
          hasArrow
        />

        <View className="h-[1px] ml-16 bg-foreground/10" />

        {/* Appearance */}
        <SettingItem
          icon={<Ionicons name="moon" size={20} color="#A855F7" />}
          iconBg="bg-purple-100"
          label="Appearance"
          value={currentTheme === "dark" ? "Dark" : "Light"}
          valueStyle="text-muted text-[17px]"
          hasArrow
          onPress={toggleTheme}
        />

        <View className="h-[1px] ml-16 bg-foreground/10" />

        {/* Haptic Feedback */}
        <SettingItem
          icon={<Vibrate size={20} color="#3B82F6" fill="#3B82F6" />}
          iconBg="bg-blue-100"
          label="Haptic Feedback"
          rightElement={
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ true: "#3b82f6", false: "#e5e7eb" }}
            />
          }
        />
      </Surface>
    </View>
  );
}
