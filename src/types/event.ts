export type Organization = 'RUIL' | 'RUDC' | 'BOTH';

export type ActivityStatus = 'ONGOING' | 'PAUSED' | 'COMPLETED' | 'UPCOMING';

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'EXCUSED'
  | 'INTERESTED'
  | 'COMPLETED';

export interface IActivity {
  id: number;
  org: Organization;
  title: string;
  slug: string;
  category?: string | null;
  description?: string | null;
  bannerImage?: string | null;
  status: ActivityStatus;
  events?: IEvent[];
  _count?: {
    events: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IEvent {
  id: number;
  org: Organization;
  activityId?: number | null;
  activity?: {
    id: number;
    title: string;
    slug: string;
    status?: ActivityStatus;
  } | null;
  title: string;
  slug: string;
  category?: string | null;
  status: EventStatus;
  scheduleText?: string | null;
  location?: string | null;
  bannerImage?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  currentChapter?: string | null;
  metadata?: Record<string, unknown> | null;
  isActive: boolean;
  sessions?: IEventSession[];
  memberRecords?: IEventMemberRecord[];
  _count?: {
    sessions: number;
    memberRecords: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IEventSession {
  id: number;
  eventId: number;
  event?: {
    id: number;
    title: string;
    slug: string;
  };
  sessionDate: string;
  chapter?: string | null;
  summary?: string | null;
  audioUrl?: string | null;
  records?: IEventMemberRecord[];
  _count?: {
    records: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IEventMemberRecord {
  id: number;
  eventId: number;
  event?: {
    id: number;
    title: string;
    slug: string;
    bannerImage?: string | null;
    startDate?: string | null;
    location?: string | null;
  };
  sessionId?: number | null;
  session?: {
    id: number;
    sessionDate: string;
    chapter?: string | null;
  } | null;
  userId: number;
  user?: {
    id: number;
    name: string;
    email: string;
    avatarUrl?: string | null;
    phone?: string | null;
  };
  status: AttendanceStatus;
  sessionDate?: string | null;
  rating?: number | null;
  comment?: string | null;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IAttendanceStats {
  eventId: number;
  total: number;
  attendees?: number;
  participants?: number;
  totalRegistered?: number;
  present: number;
  absent: number;
  excused: number;
  interested: number;
  completed: number;
  averageRating: number;
  approvedFeedbackCount: number;
  pendingFeedbackCount: number;
}
