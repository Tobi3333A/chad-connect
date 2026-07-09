import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { HousingPost } from '@/types';
import { HOUSING_TYPE_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

interface HousingCardProps {
  post: HousingPost;
}

export function HousingCard({ post }: HousingCardProps) {
  const router = useRouter();

  const budget = post.budgetMin && post.budgetMax
    ? `$${post.budgetMin.toLocaleString()}–$${post.budgetMax.toLocaleString()}/mo`
    : post.budgetMax
      ? `$${post.budgetMax}/night`
      : 'Budget flexible';

  return (
    <Pressable onPress={() => router.push(`/housing/${post._id}`)}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <Badge label={HOUSING_TYPE_LABELS[post.type]} variant="housing" />
          <Text style={styles.date}>
            {new Date(post.moveInDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <Text style={styles.title}>{post.title}</Text>
        {post.eventTitle && (
          <Text style={styles.event}>{post.eventTitle}</Text>
        )}
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={Palette.textTertiary} />
          <Text style={styles.meta}>{post.location.city}, {post.location.state}</Text>
          <Text style={styles.budget}>{budget}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>{post.description}</Text>
        {post.author && (
          <View style={styles.authorRow}>
            <Avatar uri={post.author.avatarUrl} name={post.author.name} size={32} showBadge />
            <View>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <Text style={styles.university}>{post.author.university}</Text>
            </View>
          </View>
        )}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    ...Typography.caption,
    color: Palette.textTertiary,
  },
  title: {
    ...Typography.h3,
    color: Palette.text,
  },
  event: {
    ...Typography.caption,
    color: Palette.housing,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    ...Typography.caption,
    color: Palette.textTertiary,
    flex: 1,
  },
  budget: {
    ...Typography.caption,
    color: Palette.text,
    fontWeight: '600',
  },
  description: {
    ...Typography.bodySmall,
    color: Palette.textSecondary,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Palette.borderLight,
  },
  authorName: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Palette.text,
  },
  university: {
    ...Typography.caption,
    color: Palette.textTertiary,
  },
});
