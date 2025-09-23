import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface StatItemProps {
  label: string;
  value: string | number;
  icon?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'vertical';
  style?: ViewStyle;
}

export default function StatItem({
  label,
  value,
  icon,
  color,
  size = 'medium',
  layout = 'vertical',
  style
}: StatItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const textColor = color || colors.text;
  const iconColor = color || colors.tint;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          value: styles.valueSmall,
          label: styles.labelSmall,
          icon: 16,
        };
      case 'large':
        return {
          value: styles.valueLarge,
          label: styles.labelLarge,
          icon: 28,
        };
      default:
        return {
          value: styles.valueMedium,
          label: styles.labelMedium,
          icon: 20,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const containerStyle = layout === 'horizontal'
    ? styles.containerHorizontal
    : styles.containerVertical;

  return (
    <View style={[containerStyle, style]}>
      {icon && (
        <FontAwesome
          name={icon as any}
          size={sizeStyles.icon}
          color={iconColor}
          style={layout === 'horizontal' ? styles.iconHorizontal : styles.iconVertical}
        />
      )}
      <Text style={[sizeStyles.value, { color: textColor }]}>
        {value}
      </Text>
      <Text style={[sizeStyles.label, { color: colors.text }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  containerVertical: {
    alignItems: 'center',
  },
  containerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconVertical: {
    marginBottom: 8,
  },
  iconHorizontal: {
    marginRight: 8,
  },
  valueSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  valueMedium: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  valueLarge: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  labelSmall: {
    fontSize: 10,
    fontWeight: '600',
  },
  labelMedium: {
    fontSize: 12,
    fontWeight: '600',
  },
  labelLarge: {
    fontSize: 14,
    fontWeight: '600',
  },
});