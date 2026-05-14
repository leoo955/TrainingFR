export type Tier = 'HT1' | 'LT1' | 'HT2' | 'LT2' | 'HT3' | 'LT3' | 'HT4' | 'LT4' | 'HT5' | 'LT5' | 'NONE';

export interface PlayerStats {
  uuid: string;
  username: string;
  tiers: {
    sword?: Tier;
    axe?: Tier;
    uhc?: Tier;
    crystal?: Tier;
    pot?: Tier;
    smp?: Tier;
  };
  rank?: string;
  winrate?: string;
}

export const GAMEMODES = [
  { id: 'sword', label: 'Sword', icon: 'Crosshair' },
  { id: 'axe', label: 'Axe & Shield', icon: 'Shield' },
  { id: 'uhc', label: 'UHC', icon: 'Zap' },
  { id: 'crystal', label: 'Crystal', icon: 'Activity' },
  { id: 'pot', label: 'Pot / Nodebuff', icon: 'Plus' },
  { id: 'smp', label: 'SMP PvP', icon: 'Globe' },
];
