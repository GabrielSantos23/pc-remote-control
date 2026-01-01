import { View, Text, Switch } from "react-native";
import { Surface } from "heroui-native";
import { Ionicons } from "@expo/vector-icons";
import { SettingItem } from "./setting-item";
import { useState } from "react";

export function NetworkSection() {
  const [sshEnabled, setSshEnabled] = useState(true);

  return (
    <View className="mb-8">
      <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase mb-2 px-1">
        Network & Security
      </Text>
      <Surface className="bg-card! rounded-[20px] overflow-hidden">
        <SettingItem
          icon={<Ionicons name="shield-checkmark" size={18} color="#10B981" />}
          iconBg="bg-emerald-100"
          label="Secure Connection (SSH)"
          rightElement={
            <Switch
              value={sshEnabled}
              onValueChange={setSshEnabled}
              trackColor={{ true: "#3b82f6", false: "#e5e7eb" }}
            />
          }
        />
        <View className="h-[1px] ml-16 bg-foreground/10" />

        <SettingItem
          icon={<Ionicons name="globe-outline" size={20} color="#6B7280" />}
          iconBg="bg-card-foreground"
          label="Wake-on-LAN Port"
          value="9"
        />
      </Surface>
    </View>
  );
}
