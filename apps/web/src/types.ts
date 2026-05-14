export type Role = 'OWNER' | 'TRAINER' | 'STUDENT';

export interface User {
  id: string;
  username: string;
  minecraftName: string | null;
  role: Role;
  ftData?: FTData | null;
}

export interface TierData {
  tier: string;
  points: number;
  peak_tier: string;
}

export interface FTData {
  pseudo: string;
  total_points: number;
  global_rank: number;
  avatar_url: string;
  tiers: Record<string, TierData>;
}

export interface Application {
  id: string;
  discordId: string;
  content: Record<string, unknown>;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
}

export interface Block {
  id: string;
  type: 'text' | 'code' | 'alert' | 'video';
  content: string;
}

export interface WikiResource {
  id: string;
  title: string;
  content: Block[];
  authorId: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  type: string;
  mode: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  date: string;
  trainerId: string;
  studentId: string;
  student?: {
    username: string;
    minecraftName: string | null;
  };
}
