export type ChestRarity = "common" | "rare" | "epic" | "legendary" | "filler";

export type ChestItem = {
  id: number;
  chestName: string;
  rarity: ChestRarity;
  description: string;
  closedImageSrc: string;
  openedImageSrc: string;
  rewardImageSrc: string;
  claimedFrom: string;
};