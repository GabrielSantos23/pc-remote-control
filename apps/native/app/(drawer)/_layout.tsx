import { Ionicons } from "@expo/vector-icons";
import {
  NativeTabs,
  Icon,
  Label,
  VectorIcon,
} from "expo-router/unstable-native-tabs";
import { useThemeColor } from "heroui-native";
import { Platform } from "react-native";
import React from "react";

export default function Layout() {
  const themeColorForeground = useThemeColor("foreground");

  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Label>Home</Label>
        {Platform.select({
          ios: <Icon sf={{ default: "house", selected: "house.fill" }} />,
          android: <Icon src={<VectorIcon family={Ionicons} name="home" />} />,
        })}
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Label>Settings</Label>
        {Platform.select({
          ios: <Icon sf={{ default: "gear", selected: "gear" }} />,
          android: (
            <Icon src={<VectorIcon family={Ionicons} name="settings" />} />
          ),
        })}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
