import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { createHousingPost } from '@/services/housing';
import type { HousingType } from '@/types';
import { HOUSING_TYPE_LABELS, Palette, Spacing, Typography } from '@/constants/theme';

const HOUSING_TYPES: HousingType[] = ['seeking-roommate', 'offering-spot', 'looking-for-place'];

export default function CreateHousingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState('');
  const [type, setType] = useState<HousingType>('seeking-roommate');
  const [city, setCity] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [moveInDate, setMoveInDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !city) {
      Alert.alert('Missing fields', 'Please fill in title and city.');
      return;
    }
    setLoading(true);
    try {
      await createHousingPost({
        title,
        type,
        city,
        country: 'USA',
        budgetMin: budgetMin ? parseInt(budgetMin, 10) : undefined,
        budgetMax: budgetMax ? parseInt(budgetMax, 10) : undefined,
        moveInDate: moveInDate || new Date().toISOString(),
        description,
        preferences: [],
      });
      Alert.alert('Posted!', 'Your housing listing is live.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="Post Housing" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Text style={styles.label}>Listing Type</Text>
        <View style={styles.chips}>
          {HOUSING_TYPES.map((t) => (
            <Chip
              key={t}
              label={HOUSING_TYPE_LABELS[t]}
              selected={type === t}
              onPress={() => setType(t)}
              color={Palette.housing}
            />
          ))}
        </View>

        <Input label="Title *" placeholder="Looking for roommate near Google HQ" value={title} onChangeText={setTitle} />
        <Input label="City *" placeholder="Mountain View" value={city} onChangeText={setCity} />
        <Input label="Min Budget ($/mo)" placeholder="1200" value={budgetMin} onChangeText={setBudgetMin} keyboardType="number-pad" />
        <Input label="Max Budget ($/mo)" placeholder="1800" value={budgetMax} onChangeText={setBudgetMax} keyboardType="number-pad" />
        <Input label="Move-in Date" placeholder="2026-05-25" value={moveInDate} onChangeText={setMoveInDate} />
        <Input
          label="Description"
          placeholder="Describe what you're looking for..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />

        <Button title={loading ? 'Posting...' : 'Post Listing'} onPress={handleSubmit} fullWidth disabled={loading} />
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
