import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "heroui-native";

interface SettingItemProps {
  icon?: React.ReactNode;
  iconBg?: string; // e.g., "bg-orange-100"
  label: string;
  value?: string;
  hasArrow?: boolean;
  rightElement?: React.ReactNode;
  hasEdit?: boolean;
  hasExternalLink?: boolean;
  valueStyle?: string;
  isDestructive?: boolean; // New prop for red text
  onPress?: () => void;
}

export function SettingItem({
  icon,
  iconBg,
  label,
  value,
  hasArrow,
  rightElement,
  hasEdit,
  hasExternalLink,
  valueStyle,
  isDestructive,
  onPress,
}: SettingItemProps) {
  const foregroundColor = useThemeColor("foreground");

  return (
    <Pressable
      onPress={onPress}
      className="px-4 py-3.5 flex-row items-center justify-between active:bg-default-100 min-h-[56px]"
    >
      <View className="flex-row items-center gap-3">
        {icon && (
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center ${
              iconBg || "bg-default-200"
            }`}
          >
            {icon}
          </View>
        )}
        <Text
          className={`text-[17px] font-medium`}
          style={{ color: isDestructive ? "#ef4444" : foregroundColor }}
        >
          {label}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {value && (
          <Text className={`text-[17px] ${valueStyle || "text-muted"}`}>
            {value}
          </Text>
        )}
        {rightElement}
        {(hasArrow || hasExternalLink) && (
          <Ionicons
            name="chevron-forward"
            size={18}
            className="text-muted/50"
            color="#9ca3af"
          />
        )}
        {hasEdit && (
          <Ionicons
            name="pencil"
            size={16}
            className="text-muted/50"
            color="#9ca3af"
          />
        )}
      </View>
    </Pressable>
  );
}
