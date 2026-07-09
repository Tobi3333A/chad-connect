import { Pressable, StyleSheet, Text } from 'react-native';
import { Palette, Radius, Typography } from '@/constants/theme';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}

export function Chip({ label, selected = false, onPress, color }: ChipProps) {
  const accent = color ?? Palette.primary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected && { backgroundColor: accent, borderColor: accent },
      ]}>
      <Text style={[styles.text, selected && styles.textSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Palette.surface,
    borderWidth: 1.5,
    borderColor: Palette.border,
  },
  text: {
    ...Typography.bodySmall,
    fontWeight: '500',
    color: Palette.textSecondary,
  },
  textSelected: {
    color: Palette.white,
    fontWeight: '600',
  },
});
