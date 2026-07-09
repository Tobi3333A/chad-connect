import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { FeedItem } from '@/types';
import { Palette, Spacing, Typography } from '@/constants/theme';

const TYPE_CONFIG: Record<FeedItem['type'], { icon: keyof typeof Ionicons.glyphMap; color: string; variant: 'housing' | 'rides' | 'events' | 'default' }> = {
  housing: { icon: 'home', color: Palette.housing, variant: 'housing' },
  ride: { icon: 'car', color: Palette.rides, variant: 'rides' },
  event: { icon: 'calendar', color: Palette.events, variant: 'events' },
  connection: { icon: 'people', color: Palette.primary, variant: 'default' },
};

interface FeedCardProps {
  item: FeedItem;
}

export function FeedCard({ item }: FeedCardProps) {
  const router = useRouter();
  const config = TYPE_CONFIG[item.type];

  const handlePress = () => {
    if (item.type === 'housing') router.push('/(tabs)/housing');
    else if (item.type === 'ride') router.push('/(tabs)/rides');
    else if (item.type === 'event') router.push('/(tabs)/explore');
  };

  return (
    <Pressable onPress={handlePress}>
      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconWrap, { backgroundColor: config.color + '18' }]}>
            <Ionicons name={config.icon} size={20} color={config.color} />
          </View>
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{item.subtitle}</Text>
            {item.author && (
              <View style={styles.authorRow}>
                <Avatar uri={item.author.avatarUrl} name={item.author.name} size={24} />
                <Text style={styles.authorName}>{item.author.name}</Text>
                <Badge label={item.type} variant={config.variant} />
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={18} color={Palette.textTertiary} />
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Palette.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Palette.textSecondary,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  authorName: {
    ...Typography.caption,
    color: Palette.textSecondary,
    flex: 1,
  },
});
