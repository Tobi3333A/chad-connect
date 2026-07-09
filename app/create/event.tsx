import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { createEvent } from '@/services/events';
import type { EventType } from '@/types';
import { EVENT_TYPE_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

const EVENT_TYPES: EventType[] = ['internship', 'hackathon', 'conference', 'meetup', 'other'];

export default function CreateEventScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('internship');
  const [organization, setOrganization] = useState('');
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !organization || !city) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await createEvent({
        title,
        type,
        organization,
        city,
        country: 'USA',
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date().toISOString(),
        description,
        tags: [],
      });
      Alert.alert('Created!', 'Your event has been posted.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="Create Event" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Text style={styles.label}>Event Type</Text>
        <View style={styles.chips}>
          {EVENT_TYPES.map((t) => (
            <Chip
              key={t}
              label={EVENT_TYPE_LABELS[t]}
              selected={type === t}
              onPress={() => setType(t)}
            />
          ))}
        </View>

        <Input label="Title *" placeholder="Google SWE Internship Summer 2026" value={title} onChangeText={setTitle} />
        <Input label="Organization *" placeholder="Google" value={organization} onChangeText={setOrganization} />
        <Input label="City *" placeholder="Mountain View" value={city} onChangeText={setCity} />
        <Input label="Start Date" placeholder="2026-06-01" value={startDate} onChangeText={setStartDate} />
        <Input label="End Date" placeholder="2026-08-15" value={endDate} onChangeText={setEndDate} />
        <Input
          label="Description"
          placeholder="Tell students what this event is about..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <Button title={loading ? 'Creating...' : 'Post Event'} onPress={handleSubmit} fullWidth disabled={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { padding: Spacing.md, gap: Spacing.md },
  label: { ...Typography.label, color: Palette.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
