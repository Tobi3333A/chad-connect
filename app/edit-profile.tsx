import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/layout/screen-header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { useAuth } from '@/contexts/auth-context';
import { updateProfile } from '@/services/auth';
import type { NeedType } from '@/types';
import { NEED_LABELS, Palette, Spacing } from '@/constants/theme';

const NEED_OPTIONS: NeedType[] = ['housing', 'rides', 'study', 'networking', 'general'];

export default function EditProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, refreshProfile } = useAuth();
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [needs, setNeeds] = useState<NeedType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    setBio(user.bio ?? '');
    setCity(user.location?.city ?? '');
    setNeeds(user.needs);
  }, [user]);

  const toggleNeed = (need: NeedType) => {
    setNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need],
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setLoading(true);
    try {
      await updateProfile({
        name,
        bio,
        city,
        needs,
      });
      await refreshProfile();
      router.back();
    } catch (e) {
      Alert.alert('Could not save', e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader showBack title="Edit Profile" />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <Input label="Full Name" value={name} onChangeText={setName} />
        <Input
          label="Bio"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />
        <Input label="City" value={city} onChangeText={setCity} />
        <Input
          label="University"
          value={user?.university ?? ''}
          editable={false}
          hint="Contact support to change university"
        />
        <Input label="Email" value={user?.email ?? ''} editable={false} />

        <View style={styles.chips}>
          {NEED_OPTIONS.map((need) => (
            <Chip
              key={need}
              label={NEED_LABELS[need]}
              selected={needs.includes(need)}
              onPress={() => toggleNeed(need)}
            />
          ))}
        </View>

        <Button
          title={loading ? 'Saving...' : 'Save Changes'}
          fullWidth
          onPress={handleSave}
          disabled={loading}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Palette.background },
  content: { padding: Spacing.md, gap: Spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
});
