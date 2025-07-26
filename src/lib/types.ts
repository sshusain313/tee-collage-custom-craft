import { CollageStyle } from "@/components/CollageStyleCard";

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface Session {
  user: User;
  token: string;
  expiresAt: string;
}

export interface AuthError {
  message: string;
  field?: string;
}

export interface Project {
  id: string;
  groupName: string;
  occasion: string;
  memberCount: number;
  gridStyle: CollageStyle;
  schoolLogo?: string;
  createdAt: string;
  submissions: MemberSubmission[];
  votes: VoteData;
}

export interface MemberSubmission {
  id: string;
  projectId: string;
  name: string;
  photo: string;
  role?: string;
  message?: string;
  collageStyle: CollageStyle;
  hasVoted: boolean;
  submittedAt: string;
  occasionFields: Record<string, string>;
}

export interface VoteData {
  hexagonal: number;
  square: number;
  circular: number;
}

export interface StorageKeys {
  PROJECTS: 'teecollage_projects';
  SUBMISSIONS: 'teecollage_submissions';
  USERS: 'teecollage_users';
  SESSION: 'teecollage_session';
}

export const STORAGE_KEYS: StorageKeys = {
  PROJECTS: 'teecollage_projects',
  SUBMISSIONS: 'teecollage_submissions',
  USERS: 'teecollage_users',
  SESSION: 'teecollage_session'
}; 