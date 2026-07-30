import type {
  Conversation,
  Event,
  FeedItem,
  HousingPost,
  Message,
  NeedType,
  RideRequest,
  User,
} from '@/types';
import type { Database } from '@/supabase/types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type EventRow = Database['public']['Tables']['events']['Row'];
type HousingRow = Database['public']['Tables']['housing_posts']['Row'];
type RideRow = Database['public']['Tables']['ride_requests']['Row'];
type FeedRow = Database['public']['Tables']['feed_items']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];
type ConversationRow = Database['public']['Tables']['conversations']['Row'];

export function profileRowToUser(row: ProfileRow): User {
  return {
    _id: row.id,
    email: row.email,
    name: row.name,
    university: row.university,
    major: row.major,
    graduationYear: row.graduation_year ?? new Date().getFullYear() + 1,
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    needs: (row.needs ?? []) as NeedType[],
    location:
      row.city || row.country
        ? {
            city: row.city ?? '',
            state: row.state ?? undefined,
            country: row.country ?? '',
          }
        : undefined,
    isVerified: row.is_verified,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function eventRowToEvent(row: EventRow): Event {
  return {
    _id: row.id,
    title: row.title,
    type: row.type,
    organization: row.organization,
    location: {
      city: row.city,
      state: row.state ?? undefined,
      country: row.country,
    },
    startDate: row.start_date,
    endDate: row.end_date,
    description: row.description,
    attendeeCount: row.attendee_count,
    imageUrl: row.image_url ?? undefined,
    tags: row.tags ?? [],
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

export function housingRowToPost(
  row: HousingRow,
  author?: User,
  eventTitle?: string | null,
): HousingPost {
  return {
    _id: row.id,
    title: row.title,
    type: row.type,
    eventId: row.event_id ?? undefined,
    eventTitle: eventTitle ?? undefined,
    location: {
      city: row.city,
      state: row.state ?? undefined,
      country: row.country,
    },
    budgetMin: row.budget_min != null ? Number(row.budget_min) : undefined,
    budgetMax: row.budget_max != null ? Number(row.budget_max) : undefined,
    moveInDate: row.move_in_date,
    moveOutDate: row.move_out_date ?? undefined,
    description: row.description,
    preferences: row.preferences ?? [],
    authorId: row.author_id,
    author,
    createdAt: row.created_at,
  };
}

export function rideRowToRequest(
  row: RideRow,
  author?: User,
  eventTitle?: string | null,
): RideRequest {
  return {
    _id: row.id,
    type: row.type,
    eventId: row.event_id ?? undefined,
    eventTitle: eventTitle ?? undefined,
    from: row.from_text,
    to: row.to_text,
    departureTime: row.departure_time,
    seatsAvailable: row.seats_available ?? undefined,
    costPerPerson: row.cost_per_person != null ? Number(row.cost_per_person) : undefined,
    description: row.description,
    authorId: row.author_id,
    author,
    createdAt: row.created_at,
  };
}

export function feedRowToItem(row: FeedRow, author?: User): FeedItem {
  const metadata =
    row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
      ? (row.metadata as Record<string, string | number>)
      : undefined;

  return {
    _id: row.id,
    type: row.type,
    title: row.title,
    subtitle: row.subtitle,
    authorId: row.author_id,
    author,
    metadata,
    createdAt: row.created_at,
  };
}

export function messageRowToMessage(row: MessageRow, read = false): Message {
  return {
    _id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at,
    read,
  };
}

export function conversationFromParts(input: {
  row: ConversationRow;
  participantIds: string[];
  participants?: User[];
  lastMessage?: Message;
  unreadCount: number;
}): Conversation {
  return {
    _id: input.row.id,
    participantIds: input.participantIds,
    participants: input.participants,
    lastMessage: input.lastMessage,
    unreadCount: input.unreadCount,
    contextType: input.row.context_type ?? undefined,
    contextId: input.row.context_id ?? undefined,
    contextLabel: input.row.context_label ?? undefined,
    updatedAt: input.row.updated_at,
  };
}
