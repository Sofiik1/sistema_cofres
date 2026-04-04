import styles from "./rewardcard.module.css";
import type { ChestItem, ChestRarity } from "../types/chest";

type RewardCardProps = {
  chest?: ChestItem;
  avatarSrc?: string;
};

const rarityTextMap: Record<ChestRarity, string> = {
  common: "Recompensa común",
  rare: "Recompensa rara",
  epic: "Recompensa épica",
  legendary: "Recompensa legendaria",
  filler: "Recompensa sorpresa",
};

const rarityLabelMap: Record<ChestRarity, string> = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
  filler: "Sorpresa",
};

export default function RewardCard({
  chest,
  avatarSrc,
}: RewardCardProps) {
  if (!chest) {
    return (
      <article className={styles.card}>
        <div className={styles.frame}>
          <p>No se encontró la recompensa.</p>
        </div>
      </article>
    );
  }

  return (
    <article className={`${styles.card} ${styles[chest.rarity]}`}>
      <div className={styles.frame}>
        <div className={styles.header}>
          <p className={styles.chestName}>{chest.chestName}</p>
          <span className={styles.badge}>{rarityLabelMap[chest.rarity]}</span>
          <h2 className={styles.rarityText}>{rarityTextMap[chest.rarity]}</h2>
        </div>

        <div className={styles.body}>
          <div className={styles.left}>
            <p className={styles.description}>{chest.description}</p>

            <div className={styles.claimBox}>
              <span className={styles.claimLabel}>Reclamalo con</span>
              <strong className={styles.claimFrom}>{chest.claimedFrom}</strong>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.imagePanel}>
              <img
                src={chest.rewardImageSrc || avatarSrc || "/player/avatar.png"}
                className={styles.rewardImage}
                alt={chest.chestName}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}