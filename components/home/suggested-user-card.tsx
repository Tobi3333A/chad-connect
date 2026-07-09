import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { User } from '@/types';
import { NEED_LABELS, Palette, Radius, Spacing, Typography } from '@/constants/theme';

interface SuggestedUserCardProps {
  user: User;
}

export function SuggestedUserCard({ user }: SuggestedUserCardProps) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/user/${user._id}`)}>
      <Avatar uri={user.avatarUrl} name={user.name} size={48} showBadge={user.isVerified} />
      <Text style={styles.name} numberOfLines={1}>{user.name}</Text>
      <Text style={styles.university} numberOfLines={1}>{user.university}</Text>
      <View style={styles.needs}>
        {user.needs.slice(0, 2).map((need) => (
          <Badge key={need} label={NEED_LABELS[need]} variant="outline" />
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 140,
    backgroundColor: Palette.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Palette.borderLight,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 6,
    marginRight: Spacing.sm,
  },
  name: {
    ...Typography.bodySmall,
    fontWeight: '600',
    color: Palette.text,
    textAlign: 'center',
  },
  university: {
    ...Typography.caption,
    color: Palette.textTertiary,
    textAlign: 'center',
  },
  needs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
});

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={sectionStyles.row}>
      <Text style={sectionStyles.title}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction}>
          <Text style={sectionStyles.action}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    color: Palette.text,
  },
  action: {
    ...Typography.bodySmall,
    color: Palette.primary,
    fontWeight: '600',
  },
});
