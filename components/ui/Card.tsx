import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'surface' | 'primary' | 'large';
  style?: ViewStyle;
  borderColor?: string;
  backgroundColor?: string;
}

export default function Card({
  children,
  variant = 'default',
  style,
  borderColor,
  backgroundColor
}: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getCardStyle = () => {
    switch (variant) {
      case 'large':
        return [
          styles.cardLarge,
          {
            backgroundColor: backgroundColor || colors.surface,
            borderColor: borderColor || colors.border,
          }
        ];
      case 'surface':
        return [
          styles.card,
          {
            backgroundColor: backgroundColor || colors.surface,
            borderColor: borderColor || colors.border,
          }
        ];
      case 'primary':
        return [
          styles.card,
          {
            backgroundColor: backgroundColor || colors.tint,
            borderColor: borderColor || colors.tint,
          }
        ];
      default:
        return [
          styles.card,
          {
            backgroundColor: backgroundColor || colors.surface,
            borderColor: borderColor || colors.border,
          }
        ];
    }
  };

  return (
    <View style={[...getCardStyle(), style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardLarge: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    marginBottom: 24,
  },
});