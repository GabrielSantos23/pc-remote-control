import { Ionicons } from "@expo/vector-icons";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native";
import React from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Layout() {
  const themeColorForeground = useThemeColor("foreground");

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        <Icon sf={{ default: "house", selected: "house.fill" }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
