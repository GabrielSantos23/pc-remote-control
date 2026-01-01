import { View, Text, Pressable, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { usePC } from "../../contexts/pc-context";
import { router } from "expo-router";
import { useAppTheme } from "@/contexts/app-theme-context";
import { useThemeColor } from "heroui-native";

interface DeviceCardProps {
  icon: any;
  name: string;
  ip: string;
  status: "online" | "offline" | "unknown";
  isActive: boolean;
  onPress: () => void;
}

function DeviceCard({
  icon,
  name,
  ip,
  status,
  isActive,
  onPress,
}: DeviceCardProps) {
  const { currentTheme } = useAppTheme();
  const foregroundColor = useThemeColor("foreground");
  const surfaceColor = useThemeColor("surface");
  const backgroundColor = useThemeColor("background");

  return (
    <Pressable
      onPress={onPress}
      className={`p-4 rounded-[24px] w-[160px] h-[140px] justify-between mr-4 ${
        isActive ? "border-2 border-primary" : "border border-transparent"
      }`}
      style={{
        backgroundColor: isActive ? surfaceColor : backgroundColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      <View className="flex-row justify-between items-start">
        <Ionicons
          name={icon}
          size={32}
          color={isActive ? "#3b82f6" : "#64748b"}
        />
        <View
          className={`w-3 h-3 rounded-full ${
            status === "online" ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      </View>

      <View>
        <Text
          numberOfLines={1}
          className="text-[17px] font-bold mb-1"
          style={{ color: foregroundColor }}
        >
          {name}
        </Text>
        <Text className="text-muted text-[13px]">{ip}</Text>
      </View>
    </Pressable>
  );
}

export function DevicesSection() {
  const { pcs, selectedPCId, selectPC } = usePC();
  const backgroundColor = useThemeColor("background");

  const handleEditPress = () => {
    if (pcs.length === 0) {
      Alert.alert("No Devices", "Add a device first to edit it.");
      return;
    }

    Alert.alert(
      "Select Device to Edit",
      "Choose a computer to modify its settings.",
      [
        ...pcs.map((pc) => ({
          text: pc.name,
          onPress: () => router.push(`/edit-pc?id=${pc.id}`),
        })),
        {
          text: "Cancel",
          style: "cancel" as const,
        },
      ]
    );
  };

  const handleCardPress = (id: string) => {
    if (id === selectedPCId) {
      // If already selected, go to edit
      router.push(`/edit-pc?id=${id}`);
    } else {
      // Otherwise select it
      selectPC(id);
    }
  };

  return (
    <View className="mb-8">
      <View className="flex-row justify-between items-center px-1 mb-4">
        <Text className="text-muted font-semibold text-[13px] tracking-wider uppercase">
          Connected PCs
        </Text>
        <Pressable onPress={handleEditPress}>
          <Text className="text-primary text-[15px] font-medium">Edit</Text>
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="-mx-4 px-4" // Negative margin to allow scrolling edge-to-edge
        contentContainerStyle={{ paddingRight: 20 }}
      >
        {pcs.map((pc) => (
          <DeviceCard
            key={pc.id}
            icon={pc.type === "laptop" ? "laptop-outline" : "desktop-outline"}
            name={pc.name}
            ip={pc.ip}
            status={pc.status}
            isActive={pc.id === selectedPCId}
            onPress={() => handleCardPress(pc.id)}
          />
        ))}

        {/* Add Button Card */}
        <Pressable
          onPress={() => router.push("/add-pc")}
          className="p-4 rounded-[24px] w-[160px] h-[140px] justify-center items-center border border-foreground/10"
          style={{ backgroundColor: backgroundColor }}
        >
          <View className="w-10 h-10 rounded-full bg-default-200 items-center justify-center mb-2">
            <Ionicons name="add" size={24} color="#666" />
          </View>
          <Text className="text-muted font-medium">Add PC</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
