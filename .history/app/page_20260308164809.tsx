"use client";

import { useEffect, useMemo, useState } from "react";

type Stage = "name" | "security" | "intro" | "game";

type ChestRarity = "common" | "epic" | "legendary";

type ChestItem = {
  id: number;
  title: string;
  reward: string;
  rarity: ChestRarity;
};

const TOTAL_CHESTS = 22;

// Cambiá esta fecha por la fecha real desde la que querés que empiece el juego
const START_DATE = "2026-03-09";

// Acá ponés los 22 regalos reales
const CHESTS: ChestItem[] = Array.from({ length: TOTAL_CHESTS }, (_, i) => ({
  id: i + 1,
  title: `Cofre ${i + 1}`,
  reward: `Este es el regalo/sorpresa del cofre ${i + 1}. Acá podés escribir una carta, pista, premio, foto, cupón o lo que quieras.`,
  rarity: "common",
}));

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

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    total: diff,
    hours,
    minutes,
    seconds,
  };
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

  useEffect(() => {
    const savedName = localStorage.getItem("birthday_name");
    const savedOpened = localStorage.getItem("birthday_opened_chests");
    const savedLastOpen = localStorage.getItem("birthday_last_open_date");
    const savedStage = localStorage.getItem("birthday_stage");

    if (savedName) setName(savedName);
    if (savedOpened) setOpenedChests(JSON.parse(savedOpened));
    if (savedLastOpen) setLastOpenDate(savedLastOpen);
    if (savedStage === "security" || savedStage === "intro" || savedStage === "game") {
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

  function pad(value: number) {
  return String(value).padStart(2, "0");
}

  const todayKey = getTodayKey();
  const elapsedDays = daysSinceStart(START_DATE);

  // cantidad máxima de cofres que podrían haberse abierto hasta hoy
  const maxAllowedOpened = Math.max(0, Math.min(TOTAL_CHESTS, elapsedDays + 1));

  // si ya abrió uno hoy, no puede abrir otro
  const canOpenToday = lastOpenDate !== todayKey && openedChests.length < maxAllowedOpened;

  const remainingToday = useMemo(() => {
    if (elapsedDays < 0) return 0;
    if (lastOpenDate === todayKey) return 0;
    return Math.max(0, Math.min(1, maxAllowedOpened - openedChests.length));
  }, [elapsedDays, lastOpenDate, maxAllowedOpened, openedChests.length, todayKey]);

  function handleNameContinue() {
    if (!name.trim()) {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
      return;
    }
    setStage("security");
  }

  function handleSecurityContinue() {
    if (securityAnswer.trim() === "22") {
      setStage("intro");
    } else {
      setShakeError(true);
      setTimeout(() => setShakeError(false), 500);
    }
  }

  function openGame() {
    setStage("game");
  }

  function handleOpenChest(chest: ChestItem) {
    if (openedChests.includes(chest.id)) {
      setSelectedChest(chest);
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

    setOpenedChests((prev) => [...prev, chest.id]);
    setLastOpenDate(todayKey);
    setSelectedChest(chest);
  }

  return (
    <main className="page">
      <div className="bgOrbs" />
      <div className="stars" />

      <section className="shell">
        {stage === "name" && (
          <div className="card centerCard">
            <div className="eyebrow">MODO CUMPLEAÑOS</div>
            <h1>Ingresá tu nombre</h1>
            <p className="muted">
              Antes de empezar esta aventura, el jugador debe identificarse.
            </p>

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
            <h1>Verificación gamer</h1>
            <p className="muted">
              Solo los verdaderos elegidos pueden entrar al reino de los cofres.
            </p>

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
                Te preparé una aventura especial: hay <strong>22 cofres</strong> y cada
                uno guarda una sorpresa.
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
            <div className="topPanel card">
              <div>
                <div className="eyebrow">JUGADOR</div>
                <h2>{name || "Jugador"}</h2>
              </div>

              <div className="statusGroup">
                <div className="statusItem">
                  <span className="statusLabel">Cofres abiertos</span>
                  <strong>{openedChests.length} / 22</strong>
                </div>
                <div className="statusItem">
                    <span className="statusLabel">Podés abrir hoy</span>
                    <strong>{remainingToday}</strong>
                </div>
                <div className="statusItem countdownBox">
                  <span className="statusLabel">
                    {canOpenToday ? "Estado de hoy" : "Próximo cofre en"}
                  </span>
                  <strong>
                    {canOpenToday
                      ? "Disponible ahora"
                      : `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`}
                  </strong>
                </div>
              </div>
            </div>

            <div className="rules card">
              <p>
                <strong>Dinámica:</strong> podés abrir <strong>1 cofre por día</strong>,
                y podés elegir <strong>cualquiera</strong> que todavía esté cerrado.
              </p>
              {!canOpenToday && (
                <p className="warningText">
                  Ya abriste tu cofre de hoy. Volvé mañana para abrir otro.
                </p>
              )}
              {elapsedDays < 0 && (
                <p className="warningText">
                  La aventura todavía no empezó. Esperá a la fecha de inicio.
                </p>
              )}
            </div>

            <div className="grid">
              {CHESTS.map((chest) => {
                const isOpened = openedChests.includes(chest.id);

                return (
                  <button
                    key={chest.id}
                    className={`chestCard ${isOpened ? "opened" : ""}`}
                    onClick={() => handleOpenChest(chest)}
                  >
                    <div className="chestGlow" />
                    <div className={`chest ${isOpened ? "chestOpened" : ""}`}>
                      <div className="lid" />
                      <div className="lock" />
                      <div className="base" />
                      <div className="band band1" />
                      <div className="band band2" />
                    </div>

                    <div className="chestMeta">
                      <span className="chestNumber">#{chest.id}</span>
                      <span className={`chestState ${isOpened ? "done" : "closed"}`}>
                        {isOpened ? "Abierto" : "Cerrado"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </section>

      {selectedChest && (
        <div className="modalOverlay" onClick={() => setSelectedChest(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="eyebrow">COFRE REVELADO</div>
            <h2>{selectedChest.title}</h2>
            <p className="rewardText">{selectedChest.reward}</p>
            <button className="primaryBtn" onClick={() => setSelectedChest(null)}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </main>
  );
}