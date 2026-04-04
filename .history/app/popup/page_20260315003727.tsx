"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./popup.module.css";

type NewChestPopupProps = {
  isVisible: boolean;
  onClose: () => void;
  playerName?: string;
  soundSrc?: string;
  autoHideMs?: number;
};

export default function NewChestPopup({
  isVisible,
  onClose,
  playerName = "Jugador",
  soundSrc = "/sounds/new-chest.mp3",
  autoHideMs = 5000,
}: NewChestPopupProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(soundSrc);
    if (audioRef.current) {
      audioRef.current.volume = 0.65;
    }
  }, [soundSrc]);

  useEffect(() => {
    if (!isVisible) return;

    setMounted(true);

    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }

    const timer = window.setTimeout(() => {
      onClose();
    }, autoHideMs);

    return () => {
      clearTimeout(timer);
    };
  }, [isVisible, autoHideMs, onClose]);

  useEffect(() => {
    if (!isVisible) {
      const timer = window.setTimeout(() => {
        setMounted(false);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!mounted && !isVisible) return null;

  return (
    <div className={`${styles.overlay} ${isVisible ? styles.show : styles.hide}`}>
      <div className={`${styles.popup} ${isVisible ? styles.popupShow : styles.popupHide}`}>
        <div className={styles.glow} />
        <div className={styles.iconWrap}>
          <span className={styles.icon}>🎁</span>
        </div>

        <p className={styles.eyebrow}>NUEVO COFRE DISPONIBLE</p>
        <h2 className={styles.title}>Ya podés abrir un nuevo cofre</h2>
        <p className={styles.subtitle}>
          {playerName}, el santuario volvió a despertar.
        </p>

        <div className={styles.actions}>
          <button className={styles.primaryButton} onClick={onClose}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}