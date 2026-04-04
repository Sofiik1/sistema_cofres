import styles from "./RewardCard.module.css";
import type { ChestItem, ChestRarity } from "@/types/chest";

type RewardCardProps = {
  chest: ChestItem;
  avatarSrc?: string;
};

const rarityTextMap: Record<ChestRarity, string> = {
  common: "Has obtenido una recompensa común",
  rare: "Has obtenido una recompensa rara",
  epic: "Has obtenido una recompensa épica",
  legendary: "Has obtenido una recompensa legendaria",
  filler: "Has obtenido una recompensa sorpresa",
};

const rarityLabelMap: Record<ChestRarity, string> = {
  common: "Común",
  rare: "Raro",
  epic: "Épico",
  legendary: "Legendario",
  filler: "Relleno",
};

export default function RewardCard({
  chest,
  avatarSrc = "/player/avatar.png",
}: RewardCardProps) {
  return (
    <article className={`${styles.card} ${styles[chest.rarity]}`}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <div className={styles.topRow}>
            <p className={styles.chestName}>{chest.chestName}</p>
            <span className={styles.badge}>{rarityLabelMap[chest.rarity]}</span>
          </div>

          <h2 className={styles.rarityText}>{rarityTextMap[chest.rarity]}</h2>

          <div className={styles.content}>
            <h3 className={styles.rewardTitle}>{chest.rewardTitle}</h3>
            <p className={styles.description}>{chest.description}</p>
          </div>

          <div className={styles.claimBox}>
            <span className={styles.claimLabel}>Reclamalo con</span>
            <strong className={styles.claimFrom}>{chest.claimedFrom}</strong>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.imageWrap}>
            <img
              src={chest.imageSrc}
              alt={chest.rewardTitle}
              className={styles.rewardImage}
            />
          </div>

          <div className={styles.avatarWrap}>
            <img
              src={avatarSrc}
              alt="Avatar del jugador"
              className={styles.avatar}
            />
          </div>
        </div>
      </div>
    </article>
  );
}