import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useSafeAreaContainer = () => {
  const insets = useSafeAreaInsets();

  const tabBarHeight =
    Platform.OS === "android" ? 85 + insets.bottom : 80 + insets.bottom;

  return {
    // For containers that need top padding (like main content areas)
    containerStyle: {
      paddingTop: insets.top + 20,
    },

    // For ScrollView contentContainerStyle
    contentContainerStyle: {
      paddingBottom: tabBarHeight + 20,
      paddingTop: insets.top + 20,
    },

    // For components that need top margin (like tab containers)
    tabContainerStyle: {
      marginTop: insets.top + 20,
    },

    // For modal content that needs safe area handling
    modalContentStyle: {
      paddingTop: insets.top + 16,
    },

    // Raw values for custom calculations
    insets,
    tabBarHeight,
  };
};
