import { StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Palette, Radius, Typography } from '@/constants/theme';

type BadgeVariant = 'default' | 'housing' | 'rides' | 'events' | 'success' | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: Palette.borderLight, text: Palette.textSecondary },
  housing: { bg: '#EDE9FE', text: Palette.housing },
  rides: { bg: '#CFFAFE', text: Palette.rides },
  events: { bg: '#FEF3C7', text: Palette.events },
  success: { bg: '#D1FAE5', text: Palette.success },
  outline: { bg: 'transparent', text: Palette.textSecondary },
};

export function Badge({ label, variant = 'default', style }: BadgeProps) {
  const colors = VARIANT_COLORS[variant];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg },
        variant === 'outline' && styles.outline,
        style,
      ]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  outline: {
    borderWidth: 1,
    borderColor: Palette.border,
  },
  text: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
