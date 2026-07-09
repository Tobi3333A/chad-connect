import { StyleSheet, View, type ViewProps } from 'react-native';
import { Palette, Radius, Shadow, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  padded?: boolean;
  elevated?: boolean;
}

export function Card({ children, style, padded = true, elevated = true, ...props }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        padded && styles.padded,
        elevated && Shadow.sm,
        style,
      ]}
      {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.borderLight,
  },
  padded: {
    padding: Spacing.md,
  },
});
