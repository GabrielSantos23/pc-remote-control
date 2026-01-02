import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SettingItemProps {
  icon?: React.ReactNode;
  iconBg?: string;
  label: string;
  subtitle?: string;
  value?: string;
  hasArrow?: boolean;
  rightElement?: React.ReactNode;
  hasEdit?: boolean;
  hasExternalLink?: boolean;
  valueStyle?: string;
  isDestructive?: boolean;
  onPress?: () => void;
}

export function SettingItem({
  icon,
  iconBg,
  label,
  subtitle,
  value,
  hasArrow,
  rightElement,
  hasEdit,
  hasExternalLink,
  valueStyle,
  isDestructive,
  onPress,
}: SettingItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="px-4 py-3.5 flex-row items-center justify-between active:bg-default-100 min-h-[60px]"
    >
      <View className="flex-row items-center flex-1 mr-2">
        {icon && (
          <View
            className={`w-9 h-9 rounded-xl items-center justify-center mr-3 ${
              iconBg || "bg-default-200"
            }`}
          >
            {icon}
          </View>
        )}

        {/* Label & Subtitle Container */}
        <View className="flex-1 justify-center">
          <Text
            className={`text-[17px] font-medium ${
              isDestructive ? "text-red-500" : "text-foreground"
            }`}
            numberOfLines={1}
          >
            {label}
          </Text>
          {subtitle && (
            <Text className="text-muted text-[13px] leading-4 mt-0.5 pr-2">
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {/* Right Side Elements */}
      <View className="flex-row items-center gap-2 pl-2">
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
