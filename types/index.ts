/**
 * ChadConnect — TypeScript types mirroring future MongoDB collections.
 * Each interface maps 1:1 to a document shape you'll store in Atlas.
 */

export type NeedType = 'housing' | 'rides' | 'study' | 'networking' | 'general';

export type EventType = 'internship' | 'hackathon' | 'conference' | 'meetup' | 'other';

export type HousingType = 'seeking-roommate' | 'offering-spot' | 'looking-for-place';

export type RideType = 'offering' | 'requesting';

export type NotificationType =
  | 'message'
  | 'connection'
  | 'housing'
  | 'ride'
  | 'event'
  | 'system';

export type ConnectionStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface GeoLocation {
  city: string;
  state?: string;
  country: string;
  coordinates?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
}

export interface User {
  _id: string;
  email: string;
  name: string;
  university: string;
  major: string;
  graduationYear: number;
  avatarUrl?: string;
  bio?: string;
  needs: NeedType[];
  location?: GeoLocation;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  type: EventType;
  organization: string;
  location: GeoLocation;
  startDate: string;
  endDate: string;
  description: string;
  attendeeCount: number;
  imageUrl?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
}

export interface HousingPost {
  _id: string;
  title: string;
  type: HousingType;
  eventId?: string;
  eventTitle?: string;
  location: GeoLocation;
  budgetMin?: number;
  budgetMax?: number;
  moveInDate: string;
  moveOutDate?: string;
  description: string;
  preferences: string[];
  authorId: string;
  author?: User;
  createdAt: string;
}

export interface RideRequest {
  _id: string;
  type: RideType;
  eventId?: string;
  eventTitle?: string;
  from: string;
  to: string;
  departureTime: string;
  seatsAvailable?: number;
  costPerPerson?: number;
  description: string;
  authorId: string;
  author?: User;
  createdAt: string;
}

export interface FeedItem {
  _id: string;
  type: 'housing' | 'ride' | 'event' | 'connection';
  title: string;
  subtitle: string;
  authorId: string;
  author?: User;
  metadata?: Record<string, string | number>;
  createdAt: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  _id: string;
  participantIds: string[];
  participants?: User[];
  lastMessage?: Message;
  unreadCount: number;
  contextType?: 'housing' | 'ride' | 'event' | 'general';
  contextId?: string;
  contextLabel?: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface Connection {
  _id: string;
  requesterId: string;
  addresseeId: string;
  status: ConnectionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  title: string;
  type: EventType;
  organization: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  description: string;
  tags: string[];
}

export interface CreateHousingInput {
  title: string;
  type: HousingType;
  eventId?: string;
  city: string;
  country: string;
  budgetMin?: number;
  budgetMax?: number;
  moveInDate: string;
  moveOutDate?: string;
  description: string;
  preferences: string[];
}

export interface CreateRideInput {
  type: RideType;
  eventId?: string;
  from: string;
  to: string;
  departureTime: string;
  seatsAvailable?: number;
  costPerPerson?: number;
  description: string;
}

export interface OnboardingInput {
  name: string;
  university: string;
  major: string;
  graduationYear: number;
  bio?: string;
  needs: NeedType[];
  city?: string;
  country?: string;
}
