export interface LevelInfo {
  level: number;
  name: string;
  currentXP: number;
  xpForNextLevel: number;
  progress: number; // 0-1
}

const LEVEL_THRESHOLDS = [
  { minXP: 0, maxXP: 500, levelStart: 1, levelEnd: 5, name: 'مبتدئ' },
  { minXP: 500, maxXP: 1500, levelStart: 6, levelEnd: 10, name: 'متعلم' },
  { minXP: 1500, maxXP: 3500, levelStart: 11, levelEnd: 15, name: 'متوسط' },
  { minXP: 3500, maxXP: 7000, levelStart: 16, levelEnd: 20, name: 'متقدم' },
  { minXP: 7000, maxXP: 12000, levelStart: 21, levelEnd: 25, name: 'خبير' },
  { minXP: 12000, maxXP: 20000, levelStart: 26, levelEnd: 30, name: 'محترف' },
  { minXP: 20000, maxXP: Infinity, levelStart: 31, levelEnd: 99, name: 'أسطورة' },
];

export function calculateLevel(xp: number): number {
  if (xp < 500) return Math.max(1, Math.floor(xp / 100) + 1);
  if (xp < 1500) return 6 + Math.floor((xp - 500) / 200);
  if (xp < 3500) return 11 + Math.floor((xp - 1500) / 400);
  if (xp < 7000) return 16 + Math.floor((xp - 3500) / 700);
  if (xp < 12000) return 21 + Math.floor((xp - 7000) / 1000);
  if (xp < 20000) return 26 + Math.floor((xp - 12000) / 1600);
  return 31 + Math.floor((xp - 20000) / 2000);
}

export function getLevelInfo(xp: number): LevelInfo {
  const level = calculateLevel(xp);
  const tier = LEVEL_THRESHOLDS.find(
    (t) => level >= t.levelStart && level <= t.levelEnd
  ) ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]!;

  const levelsInTier = tier.levelEnd - tier.levelStart + 1;
  const xpPerLevel = (tier.maxXP === Infinity ? 2000 : (tier.maxXP - tier.minXP)) / levelsInTier;
  const levelInTier = level - tier.levelStart;
  const xpAtLevelStart = tier.minXP + levelInTier * xpPerLevel;
  const xpAtLevelEnd = xpAtLevelStart + xpPerLevel;
  const progress = Math.min(1, (xp - xpAtLevelStart) / (xpAtLevelEnd - xpAtLevelStart));

  return {
    level,
    name: tier.name,
    currentXP: xp,
    xpForNextLevel: Math.ceil(xpAtLevelEnd),
    progress: Math.max(0, progress),
  };
}

export { LEVEL_THRESHOLDS };
