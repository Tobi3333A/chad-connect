import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Screen } from '@/components/layout/screen';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { startConversation } from '@/services/chat';
import { getHousingById } from '@/services/housing';
import type { HousingPost } from '@/types';
import { HOUSING_TYPE_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

export default function HousingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<HousingPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [messaging, setMessaging] = useState(false);

  useEffect(() => {
    if (!id) return;
    getHousingById(id)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Palette.housing} size="large" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.loader}>
        <Text>Post not found</Text>
      </View>
    );
  }

  const budget = post.budgetMin && post.budgetMax
    ? `$${post.budgetMin.toLocaleString()} – $${post.budgetMax.toLocaleString()}/mo`
    : 'Flexible';

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="Housing" />
      <Screen>
        <Badge label={HOUSING_TYPE_LABELS[post.type]} variant="housing" />
        <Text style={styles.title}>{post.title}</Text>
        {post.eventTitle && <Text style={styles.event}>{post.eventTitle}</Text>}

        <Card style={styles.details}>
          <DetailItem
            label="Location"
            value={
              post.location.state
                ? `${post.location.city}, ${post.location.state}`
                : post.location.city
            }
          />
          <DetailItem label="Budget" value={budget} />
          <DetailItem
            label="Move-in"
            value={new Date(post.moveInDate).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          />
          {post.moveOutDate && (
            <DetailItem
              label="Move-out"
              value={new Date(post.moveOutDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            />
          )}
        </Card>

        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{post.description}</Text>

        {post.preferences.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Preferences</Text>
            <View style={styles.tags}>
              {post.preferences.map((p) => (
                <Badge key={p} label={p} variant="outline" />
              ))}
            </View>
          </>
        )}

        {post.author && (
          <Card style={styles.authorCard}>
            <Avatar uri={post.author.avatarUrl} name={post.author.name} size={48} showBadge />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.author.name}</Text>
              <Text style={styles.authorUni}>{post.author.university}</Text>
            </View>
          </Card>
        )}

        {post.author && post.authorId !== user?._id && (
          <Button
            title={messaging ? 'Opening...' : 'Message About Housing'}
            fullWidth
            disabled={messaging}
            style={styles.cta}
            onPress={async () => {
              setMessaging(true);
              try {
                const conversationId = await startConversation(post.authorId, {
                  type: 'housing',
                  id: post._id,
                  label: post.title,
                });
                router.push(`/chat/${conversationId}`);
              } catch (e) {
                Alert.alert(
                  'Could not start chat',
                  e instanceof Error ? e.message : 'Something went wrong',
                );
              } finally {
                setMessaging(false);
              }
            }}
          />
        )}
      </Screen>
    </View>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { ...Typography.h1, color: Palette.text, marginTop: Spacing.sm },
  event: { ...Typography.bodySmall, color: Palette.housing, fontWeight: '500' },
  details: { marginVertical: Spacing.md, gap: Spacing.md },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { ...Typography.bodySmall, color: Palette.textSecondary },
  detailValue: { ...Typography.bodySmall, fontWeight: '600', color: Palette.text },
  sectionTitle: { ...Typography.h3, color: Palette.text, marginTop: Spacing.md },
  description: { ...Typography.body, color: Palette.textSecondary, lineHeight: 24 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  authorCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: Spacing.lg },
  authorInfo: { flex: 1 },
  authorName: { ...Typography.body, fontWeight: '600', color: Palette.text },
  authorUni: { ...Typography.caption, color: Palette.textTertiary },
  cta: { marginTop: Spacing.lg },
});
