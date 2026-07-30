import type { OnboardingInput, User } from '@/types';
import { profileRowToUser } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';

async function requireAuthUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  if (!data.user) throw new Error('Not authenticated');
  return data.user.id;
}

export async function sendVerificationCode(email: string): Promise<{ success: boolean }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized.endsWith('.edu')) {
    throw new Error('Please use a valid .edu email address');
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: normalized,
    options: { shouldCreateUser: true },
  });

  if (error) throw new Error(error.message);
  return { success: true };
}

export async function verifyCode(email: string, code: string): Promise<User> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await supabase.auth.verifyOtp({
    email: normalized,
    token: code.trim(),
    type: 'email',
  });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Verification failed');

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) throw new Error(profileError.message);
  if (!profile) {
    throw new Error('Profile not found. Try signing in again in a moment.');
  }

  return profileRowToUser(profile);
}

export async function completeOnboarding(input: OnboardingInput): Promise<User> {
  const userId = await requireAuthUserId();

  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: input.name.trim(),
      university: input.university.trim(),
      major: input.major.trim(),
      graduation_year: input.graduationYear,
      bio: input.bio?.trim() || null,
      needs: input.needs,
      city: input.city?.trim() || null,
      country: input.country?.trim() || null,
      is_verified: true,
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return profileRowToUser(data);
}

export async function updateProfile(input: {
  name: string;
  bio?: string;
  city?: string;
  needs: User['needs'];
}): Promise<User> {
  const userId = await requireAuthUserId();

  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: input.name.trim(),
      bio: input.bio?.trim() || null,
      city: input.city?.trim() || null,
      needs: input.needs,
    })
    .eq('id', userId)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return profileRowToUser(data);
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authData.user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return profileRowToUser(data);
}

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;
  return profileRowToUser(data);
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
