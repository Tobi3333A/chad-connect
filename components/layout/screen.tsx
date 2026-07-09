import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, Spacing } from '@/constants/theme';

interface ScreenProps extends ViewProps {
  scroll?: boolean;
  padded?: boolean;
  children: React.ReactNode;
}

export function Screen({ children, scroll = true, padded = true, style, ...props }: ScreenProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <View style={[padded && styles.padded, style]} {...props}>
      {children}
    </View>
  );

  if (scroll) {
    return (
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.screen, { paddingBottom: insets.bottom }, padded && styles.padded, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: Spacing.md,
  },
});
