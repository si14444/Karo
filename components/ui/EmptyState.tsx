import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
  variant?: 'default' | 'surface';
  style?: any;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  variant = 'surface',
  style
}: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[
      styles.emptyState,
      {
        backgroundColor: variant === 'surface' ? colors.surface : 'transparent'
      },
      style
    ]}>
      <FontAwesome name={icon as any} size={48} color={colors.tabIconDefault} />
      <Text style={[styles.emptyText, { color: colors.text }]}>
        {title}
      </Text>
      <Text style={[styles.emptySubtext, { color: colors.tabIconDefault }]}>
        {subtitle}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});