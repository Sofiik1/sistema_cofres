"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import RewardCard from "./rewardcard/page";
import { CHESTS } from "./data/chest";
import type { ChestItem } from "./types/chest";
import NewChestPopup from "./popup/page";

type Stage = "name" | "security" | "intro" | "game";

const TOTAL_CHESTS = CHESTS.length;
const START_DATE = "2026-03-08";

function getTodayKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function daysSinceStart(startDate: string) {
  const start = new Date(`${startDate}T00:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = today.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getTimeUntilNextDay() {
  const now = new Date();
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    0,
    0
  );

  const diff = tomorrow.getTime() - now.getTime();

  return {
    total: diff,
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export default function Page() {
  const [stage, setStage] = useState<Stage>("name");
  const [name, setName] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [openedChests, setOpenedChests] = useState<number[]>([]);
  const [lastOpenDate, setLastOpenDate] = useState<string | null>(null);
  const [selectedChest, setSelectedChest] = useState<ChestItem | null>(null);
  const [shakeError, setShakeError] = useState(false);
  const [introVisible, setIntroVisible] = useState(false);
  const [countdown, setCountdown] = useState(getTimeUntilNextDay());
  const [showNewChestPopup, setShowNewChestPopup] = useState(false);
  const [lastPopupDate, setLastPopupDate] = useState<string | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastHoverPlayedAtRef = useRef(0);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [musicOn, setMusicOn] = useState(true);
  const openAudioRef = useRef<HTMLAudioElement | null>(null);
  const hoverAudioRef = useRef<HTMLAudioElement | null>(null);
  const revealAudioRef = useRef<HTMLAudioElement | null>(null);

  const todayKey = getTodayKey();
  const elapsedDays = daysSinceStart(START_DATE);

  const maxAllowedOpened = Math.max(0, Math.min(TOTAL_CHESTS, elapsedDays + 1));

  const canOpenToday =
    lastOpenDate !== todayKey && openedChests.length < maxAllowedOpened;

  const remainingToday = useMemo(() => {
    if (elapsedDays < 0) return 0;
    if (lastOpenDate === todayKey) return 0;
    return Math.max(0, Math.min(1, maxAllowedOpened - openedChests.length));
  }, [elapsedDays, lastOpenDate, maxAllowedOpened, openedChests.length, todayKey]);

  useEffect(() => {
    const savedName = localStorage.getItem("birthday_name");
    const savedOpened = localStorage.getItem("birthday_opened_chests");
    const savedLastOpen = localStorage.getItem("birthday_last_open_date");
    const savedStage = localStorage.getItem("birthday_stage");
    const savedPopupDate = localStorage.getItem("birthday_last_popup_date");
    if (savedPopupDate) setLastPopupDate(savedPopupDate);

    if (savedName) setName(savedName);
    if (savedOpened) setOpenedChests(JSON.parse(savedOpened));
    if (savedLastOpen) setLastOpenDate(savedLastOpen);
    if (
      savedStage === "security" ||
      savedStage === "intro" ||
      savedStage === "game"
    ) {
      setStage(savedStage);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("birthday_name", name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem("birthday_opened_chests", JSON.stringify(openedChests));
  }, [openedChests]);

  useEffect(() => {
    if (lastOpenDate) {
      localStorage.setItem("birthday_last_open_date", lastOpenDate);
    }
  }, [lastOpenDate]);

  useEffect(() => {
    localStorage.setItem("birthday_stage", stage);
  }, [stage]);

  useEffect(() => {
    if (stage === "intro") {
      const t = setTimeout(() => setIntroVisible(true), 120);
      return () => clearTimeout(t);
    }
  }, [stage]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilNextDay());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  openAudioRef.current = new Audio("/opening.mp3");
  hoverAudioRef.current = new Audio("/hover.mp3");
  revealAudioRef.current = new Audio("/recompensa.mp3");
  musicAudioRef.current = new Audio("/ambiente.mp3");

  if (openAudioRef.current) openAudioRef.current.volume = 0.6;
  if (hoverAudioRef.current) hoverAudioRef.current.volume = 0.18;
  if (revealAudioRef.current) revealAudioRef.current.volume = 0.7;

  if (musicAudioRef.current) {
    musicAudioRef.current.volume = 0.28;
    musicAudioRef.current.loop = true;
  }

  return () => {
    openAudioRef.current?.pause();
    hoverAudioRef.current?.pause();
    revealAudioRef.current?.pause();
    musicAudioRef.current?.pause();
  };
}, []);

  useEffect(() => {
  if (lastPopupDate) {
    localStorage.setItem("birthday_last_popup_date", lastPopupDate);
  }
}, [lastPopupDate]);

  useEffect(() => {
  if (stage !== "game") return;
  if (elapsedDays < 0) return;
  if (!canOpenToday) return;
  if (lastPopupDate === todayKey) return;

  setShowNewChestPopup(true);
  setLastPopupDate(todayKey);
}, [stage, elapsedDays, canOpenToday, lastPopupDate, todayKey]);

  async function unlockAudio() {
  if (audioUnlocked) return;

  try {
    const audios = [
      openAudioRef.current,
      hoverAudioRef.current,
      revealAudioRef.current,
      musicAudioRef.current,
    ].filter(Boolean) as HTMLAudioElement[];

    for (const audio of audios) {
      audio.muted = true;
      await audio.play().catch(() => {});
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    }

    setAudioUnlocked(true);
  } catch {
    // no-op
  }
}

  function playHoverSound() {
    const audio = hoverAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function playOpenSound() {
    const audio = openAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function playRevealSound() {
    const audio = revealAudioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().catch(() => {});
  }

  function triggerShake() {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  }

  function handleNameContinue() {
    if (!name.trim()) {
      triggerShake();
      return;
    }

    setStage("security");
  }

  function handleSecurityContinue() {
    if (securityAnswer.trim() !== "22") {
      triggerShake();
      return;
    }

    setStage("intro");
  }

  async function openGame() {
  setStage("game");

  await unlockAudio();

  if (musicOn && musicAudioRef.current) {
    musicAudioRef.current.currentTime = 0;
    musicAudioRef.current.play().catch(() => {});
  }
}

  function handleOpenChest(chest: ChestItem) {
    if (openedChests.includes(chest.id)) {
      setSelectedChest(chest);
      playRevealSound();
      return;
    }

    if (elapsedDays < 0) {
      alert("Todavía no empezó la aventura de los cofres.");
      return;
    }

    if (!canOpenToday) {
      alert("Hoy ya abriste tu cofre del día. Mañana podrás abrir otro.");
      return;
    }

    playOpenSound();

    setOpenedChests((prev) => [...prev, chest.id]);
    setLastOpenDate(todayKey);

    setTimeout(() => {
      setSelectedChest(chest);
      playRevealSound();
    }, 450);
  }

  return (
    <main className="page">
      <div className="bgOrbs" />
      <div className="stars" />

      <section className="shell">
        {stage === "name" && (
          <div className="card centerCard">
            <h1>Ingresá tu nombre</h1>

            <div className={`formBlock ${shakeError ? "shake" : ""}`}>
              <input
                className="input"
                placeholder="Escribí tu nombre..."
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button className="primaryBtn" onClick={handleNameContinue}>
                Continuar
              </button>
            </div>
          </div>
        )}

        {stage === "security" && (
          <div className="card centerCard">
            <div className="eyebrow">CONTROL DE SEGURIDAD</div>
            <h1>Verificamos que seas un humano</h1>

            <div className={`securityBox ${shakeError ? "shake" : ""}`}>
              <div className="mathQuestion">¿Cuánto es 11 + 11?</div>
              <input
                className="input centered"
                placeholder="Tu respuesta"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
              />
              <button className="primaryBtn" onClick={handleSecurityContinue}>
                Verificar
              </button>
            </div>
          </div>
        )}

        {stage === "intro" && (
          <div className={`card introCard ${introVisible ? "visible" : ""}`}>
            <div className="eyebrow">ACCESO CONCEDIDO</div>
            <h1>Biennn, {name || "jugador"} ✨</h1>
            <p className="lead">
              Sí, es <strong>22</strong>...
            </p>
            <p className="muted bigger">
              Como los <strong>22 días</strong> que faltan para tu cumpleaños.
            </p>

            <div className="introText">
              <p>
                Te preparé una aventura especial: hay <strong>{TOTAL_CHESTS} cofres</strong>{" "}
                y cada uno guarda una sorpresa.
              </p>
              <p>
                La regla es simple: <strong>solo podés abrir un cofre por día</strong>,
                pero <strong>vos elegís cuál</strong>.
              </p>
              <p>
                Elegí con sabiduría, porque cada día cuenta y cada cofre esconde algo
                distinto.
              </p>
            </div>

            <button className="primaryBtn bigBtn" onClick={openGame}>
              Entrar al juego
            </button>
          </div>
        )}

        {stage === "game" && (
          <>
            <section className="fantasyHero">
              <div className="heroLeft">
                <div className="playerPortraitFrame">
                  <img
                    src="/avatar.png"
                    alt="Jugador"
                    className="playerPortrait"
                  />
                  <div className="portraitGlow" />
                </div>

                <div className="heroText">
                  <div className="eyebrow">SOS EL ELEGIDO</div>
                  <h1 className="fantasyTitle">Los Cofres del Destino</h1>
                  <p className="fantasySubtitle">
                    Cada día, solo uno. Elegí sabiamente.
                  </p>
                </div>
              </div>

              <div className="heroStats">
                <div className="heroStat">
                  <span>Abiertos</span>
                  <strong>
                    {openedChests.length} / {TOTAL_CHESTS}
                  </strong>
                </div>

                <div className="heroStat">
                  <span>Hoy</span>
                  <strong>{remainingToday}</strong>
                </div>

                <div className="heroStat countdownBox">
                  <span>{canOpenToday ? "Estado" : "Próximo cofre en"}</span>
                  <strong>
                    {canOpenToday
                      ? "Disponible"
                      : `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(
                          countdown.seconds
                        )}`}
                  </strong>
                </div>
              </div>
            </section>
                      <NewChestPopup
                    isVisible={showNewChestPopup}
                    onClose={() => setShowNewChestPopup(false)}
                    playerName={name || "Jugador"}
                    soundSrc="/new.mp3"
                    autoHideMs={5000}
                  />
            <section className="fantasyMessage card">
              {canOpenToday ? (
                <p>
                  El santuario está despierto. <strong>Elegí tu cofre de hoy</strong>.
                </p>
              ) : (
                <p>
                  Ya reclamaste el cofre de hoy. El próximo volverá a manifestarse
                  con el siguiente amanecer.
                </p>
              )}
            </section>

            <section className="chestSection">
              <div className="sectionHeading">
                <div className="eyebrow">SANTUARIO</div>
                <h2>Elegí tu próximo cofre</h2>
              </div>

              <div className="grid fantasyGrid">
                {CHESTS.map((chest, index) => {
                  const isOpened = openedChests.includes(chest.id);

                  return (
                    <button
                      key={chest.id}
                      className={`chestCard fantasyChestCard rarity-${chest.rarity} ${
                        isOpened ? "opened" : ""
                      }`}
                      onClick={() => handleOpenChest(chest)}
                      onMouseEnter={playHoverSound}
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      <div className="mistRing" />
                      <div className="rarityAura" />
                      <div className="pedestalGlow" />

                      <div className="sparkles">
                        <span />
                        <span />
                        <span />
                        <span />
                      </div>

                      <div className="chestGlow" />

                      <img
                        src={isOpened ? chest.openedImageSrc : chest.closedImageSrc}
                        alt={chest.chestName}
                        className={`chestImage ${isOpened ? "chestImageOpened" : "chestImageClosed"}`}
                      />

                      <div className="chestMeta">
                        <span className="chestNumber">{chest.chestName}</span>

                        {isOpened && (
                          <span className={`rarityBadge rarityBadge-${chest.rarity}`}>
                            {chest.rarity === "common" && "Común"}
                            {chest.rarity === "rare" && "Raro"}
                            {chest.rarity === "epic" && "Épico"}
                            {chest.rarity === "legendary" && "Legendario"}
                          </span>
                        )}

                        <span
                          className={`chestState ${isOpened ? "done" : "closed"}`}
                        >
                          {isOpened ? "Abierto" : "Sellado"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </section>

      {selectedChest && (
        <div className="modalOverlay" onClick={() => setSelectedChest(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <RewardCard chest={selectedChest} avatarSrc="/player/avatar.png" />
          </div>
        </div>
      )}
    </main>
  );
}