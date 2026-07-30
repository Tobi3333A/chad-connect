import type { OnboardingInput, User } from '@/types';
import { profileRowToUser } from '@/lib/mappers';
import { supabase } from '@/lib/supabase';

/**
 * Onboarding still updates local return value only.
 * Persisting to `profiles` is Feature 3.
 */
let onboardingDraft: User | null = null;

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

  onboardingDraft = null;

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
  // Feature 3 will persist this to Supabase profiles.
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) throw new Error('Not authenticated');

  const existing = await getCurrentUser();
  const user: User = {
    _id: authData.user.id,
    email: existing?.email ?? authData.user.email ?? '',
    name: input.name,
    university: input.university,
    major: input.major,
    graduationYear: input.graduationYear,
    bio: input.bio,
    needs: input.needs,
    location: input.city
      ? { city: input.city, country: input.country ?? 'USA' }
      : undefined,
    isVerified: true,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  onboardingDraft = user;
  return user;
}

export async function getCurrentUser(): Promise<User | null> {
  if (onboardingDraft) return onboardingDraft;

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

export async function signOut(): Promise<void> {
  onboardingDraft = null;
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}
