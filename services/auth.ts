import type { OnboardingInput, User } from '@/types';
import { CURRENT_USER_ID, mockUsers } from '@/data/mock';
import { simulateDelay } from './api';

let sessionUser: User | null = null;

export async function sendVerificationCode(email: string): Promise<{ success: boolean }> {
  const isEdu = email.endsWith('.edu');
  if (!isEdu) {
    throw new Error('Please use a valid .edu email address');
  }
  // TODO: POST /api/auth/send-code { email }
  return simulateDelay({ success: true });
}

export async function verifyCode(email: string, _code: string): Promise<User> {
  // TODO: POST /api/auth/verify { email, code }
  const existing = mockUsers.find((u) => u.email === email);
  sessionUser = existing ?? {
    _id: 'user-new',
    email,
    name: '',
    university: '',
    major: '',
    graduationYear: new Date().getFullYear() + 1,
    needs: [],
    isVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return simulateDelay(sessionUser);
}

export async function completeOnboarding(input: OnboardingInput): Promise<User> {
  // TODO: PUT /api/users/me { ...input }
  const user: User = {
    _id: sessionUser?._id ?? CURRENT_USER_ID,
    email: sessionUser?.email ?? 'user@university.edu',
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  sessionUser = user;
  return simulateDelay(user);
}

export async function getCurrentUser(): Promise<User | null> {
  // TODO: GET /api/users/me
  return simulateDelay(sessionUser ?? mockUsers.find((u) => u._id === CURRENT_USER_ID) ?? null);
}

export function getSessionUser(): User | null {
  return sessionUser;
}

export function setSessionUser(user: User | null): void {
  sessionUser = user;
}
