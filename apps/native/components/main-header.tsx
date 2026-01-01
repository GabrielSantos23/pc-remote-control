import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useThemeColor } from "heroui-native";
import { View, Text, Pressable, Platform } from "react-native";
import { Computer } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlassView } from "expo-glass-effect";
import { usePC } from "@/contexts/pc-context";

export function MainHeader() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedPC } = usePC();
  const foregroundColor = useThemeColor("foreground");

  const headerHeight = Math.max(insets.top, 12) + 80;

  return (
    <View
      className="absolute top-0 left-0 right-0 flex-row justify-start items-center px-6 "
      pointerEvents="box-none"
      style={{
        paddingTop: Math.max(insets.top, 12),
        height: headerHeight,
      }}
    >
      {/* PC Status Area with Glass Effect */}
      <View className="relative ">
        {Platform.OS === "ios" && (
          <GlassView
            style={{ position: "absolute", inset: 0, borderRadius: 20 }}
            glassEffectStyle="regular"
          />
        )}
        <Pressable
          className={`flex-row items-center gap-3 p-3 rounded-2xl flex-shrink mr-4 ${
            Platform.OS !== "ios"
              ? "bg-card shadow-sm border border-foreground/20"
              : ""
          }`}
          onPress={() => {
            if (!selectedPC) {
              router.push("/add-pc");
            }
          }}
        >
          <View
            className={`w-10 h-10 rounded-xl items-center justify-center ${
              Platform.OS === "ios" ? "bg-white/10" : "bg-background shadow-sm"
            }`}
          >
            <Computer size={20} color={foregroundColor} />
          </View>
          <View className="flex-shrink">
            <Text
              className="text-foreground text-lg font-bold leading-tight"
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {selectedPC?.name || "No PC Selected"}
            </Text>
            <View className="flex-row items-center">
              <View
                className={`w-2 h-2 rounded-full mr-1.5 ${
                  selectedPC?.status === "online"
                    ? "bg-success"
                    : "bg-muted-foreground"
                }`}
              />
              <Text
                className={`text-[10px] font-bold tracking-widest uppercase opacity-70 ${
                  selectedPC?.status === "online"
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {selectedPC?.status === "online" ? "Connected" : "Disconnected"}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}
