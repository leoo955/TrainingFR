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

export interface Session {
  id: string;
  type: string;
  date: string;
  trainerId: string;
  studentId: string;
  student?: {
    username: string;
    minecraftName: string | null;
  };
}
