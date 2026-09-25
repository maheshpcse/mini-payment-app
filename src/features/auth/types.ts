export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  initials: string;
  email: string;
  emailVerified: boolean;
  phone: string | null;
  /** Relative to the API base URL, e.g. `/avatars/<id>`; null when no avatar is set. */
  avatarUrl: string | null;
  roles: string[];
  createdAt: string;
}

export interface SessionGrant {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: User;
}

export interface ActiveSession {
  id: string;
  userAgent: string;
  createdAt: string;
  lastUsedAt: string;
  current: boolean;
}
