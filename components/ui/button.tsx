import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, Radius } from '@/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const sizeStyles = SIZE_STYLES[size];

  if (variant === 'primary') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [
          styles.base,
          sizeStyles.container,
          fullWidth && styles.fullWidth,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}>
        <LinearGradient
          colors={[Palette.gradientStart, Palette.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.gradient, sizeStyles.container]}>
          {icon}
          <Text style={[styles.primaryText, sizeStyles.text]}>{title}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  const variantStyle = VARIANT_STYLES[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        sizeStyles.container,
        variantStyle.container,
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}>
      {icon}
      <Text style={[variantStyle.text, sizeStyles.text]}>{title}</Text>
    </Pressable>
  );
}

const SIZE_STYLES: Record<ButtonSize, { container: ViewStyle; text: TextStyle }> = {
  sm: { container: { paddingVertical: 8, paddingHorizontal: 16 }, text: { fontSize: 14 } },
  md: { container: { paddingVertical: 14, paddingHorizontal: 24 }, text: { fontSize: 16 } },
  lg: { container: { paddingVertical: 18, paddingHorizontal: 32 }, text: { fontSize: 17 } },
};

const VARIANT_STYLES: Record<Exclude<ButtonVariant, 'primary'>, { container: ViewStyle; text: TextStyle }> = {
  secondary: {
    container: { backgroundColor: Palette.borderLight },
    text: { color: Palette.text, fontWeight: '600' },
  },
  ghost: {
    container: { backgroundColor: 'transparent' },
    text: { color: Palette.primary, fontWeight: '600' },
  },
  outline: {
    container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Palette.border },
    text: { color: Palette.text, fontWeight: '600' },
  },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    color: Palette.textInverse,
    fontWeight: '600',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
