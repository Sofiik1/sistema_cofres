export type ChestRarity = "common" | "rare" | "epic" | "legendary" | "filler";

export type ChestItem = {
  id: number;
  chestName: string;
  rarity: ChestRarity;
  rewardTitle: string;
  description: string;
  imageSrc: string;
  claimedFrom: string;
  shortLabel?: string;
};