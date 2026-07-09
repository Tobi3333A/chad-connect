import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { createRideRequest } from '@/services/rides';
import type { RideType } from '@/types';
import { Palette, Spacing, Typography } from '@/constants/theme';

export default function CreateRideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [type, setType] = useState<RideType>('offering');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [seats, setSeats] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!from || !to) {
      Alert.alert('Missing fields', 'Please fill in from and to locations.');
      return;
    }
    setLoading(true);
    try {
      await createRideRequest({
        type,
        from,
        to,
        departureTime: departureTime || new Date().toISOString(),
        seatsAvailable: seats ? parseInt(seats, 10) : undefined,
        costPerPerson: cost ? parseInt(cost, 10) : undefined,
        description,
      });
      Alert.alert('Posted!', 'Your ride is live.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="Post a Ride" />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Text style={styles.label}>Ride Type</Text>
        <View style={styles.chips}>
          <Chip label="Offering Ride" selected={type === 'offering'} onPress={() => setType('offering')} color={Palette.rides} />
          <Chip label="Requesting Ride" selected={type === 'requesting'} onPress={() => setType('requesting')} color={Palette.rides} />
        </View>

        <Input label="From *" placeholder="SFO Airport" value={from} onChangeText={setFrom} />
        <Input label="To *" placeholder="Mountain View, CA" value={to} onChangeText={setTo} />
        <Input label="Departure Time" placeholder="2026-06-01T11:00:00" value={departureTime} onChangeText={setDepartureTime} />
        {type === 'offering' && (
          <>
            <Input label="Seats Available" placeholder="2" value={seats} onChangeText={setSeats} keyboardType="number-pad" />
            <Input label="Cost per Person ($)" placeholder="20" value={cost} onChangeText={setCost} keyboardType="number-pad" />
          </>
        )}
        <Input
          label="Description"
          placeholder="Any details about the ride..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <Button title={loading ? 'Posting...' : 'Post Ride'} onPress={handleSubmit} fullWidth disabled={loading} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { padding: Spacing.md, gap: Spacing.md },
  label: { ...Typography.label, color: Palette.text },
  chips: { flexDirection: 'row', gap: Spacing.sm },
});
