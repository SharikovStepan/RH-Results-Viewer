import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DOUBLE16_GRID_DATA } from "./const";
import RaceCard from "./RaceCard";
import { getState } from "../../../js/sharedStates";
import { getGlowClassnameByProgressStatus, getGlowClassnameByRaceStatus, getStatusText } from "./Doubles16";
import { useUrlPhase } from "../useUrlPhase";

const TO_LOWER_BRACKET_RACE_NUMS = [1, 2, 3, 4, 6, 8, 11];

// Уникальные фазы в порядке появления в vertical-константе.
// racePhase здесь — уже символьный ключ словаря: "r16" | "r8" | "r4" | "semi" | "final".
const PHASES = [...new Set(DOUBLE16_GRID_DATA.vertical.map((g) => g.racePhase))];

function Doubles16TableVertical({ bracketData, getPilotId, activePilotId, config }) {
  const [activePhase, switchPhase, direction] = useUrlPhase({
    values: PHASES,
    param: "phase",
  });

  const activeIndex = PHASES.indexOf(activePhase);
  const prevPhase = PHASES[activeIndex - 1];
  const nextPhase = PHASES[activeIndex + 1];

//   const switchPhase = (phase, dir) => {
//     if (!phase) return;
//     setDirection(dir);
//     setActivePhase(phase);
//   };

  const racesOfPhase = bracketData.map((race, index) => ({ race, grid: DOUBLE16_GRID_DATA.vertical[index], index })).filter(({ grid }) => grid && grid.racePhase === activePhase);

  const hasUpperInPhase = racesOfPhase.some(({ grid }) => !grid.isLowTab);

  const variants = {
    enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? 60 * -1 : 60, opacity: 0 }),
  };

  // Тексты из словаря (с безопасным фолбэком, если стейт ещё не загружен)
  const phasesText = getState("textStrings")?.tournamentTab?.phases ?? {};
  const lowBracketText = getState("textStrings")?.tournamentTab?.lowBracket ?? "Нижняя сетка";

  const activePhaseLabel = phasesText[activePhase] ?? activePhase;
  const prevPhaseLabel = prevPhase ? (phasesText[prevPhase] ?? prevPhase) : "";
  const nextPhaseLabel = nextPhase ? (phasesText[nextPhase] ?? nextPhase) : "";

  return (
    <>
      <div className="finals-bracket__buttons _buttons-wrapper">
        <button
          type="button"
          className={`_button finals-bracket__button ${!prevPhase ? "_disabled" : ""}`}
          onClick={() => switchPhase(prevPhase)}
          aria-label={prevPhaseLabel || "Предыдущая фаза"}
          disabled={!prevPhase}>
          {"<"}
        </button>
        <span className="finals-bracket__phase-name">{activePhaseLabel}</span>
        <button
          type="button"
          className={`_button finals-bracket__button ${!nextPhase ? "_disabled" : ""}`}
          onClick={() => switchPhase(nextPhase)}
          aria-label={nextPhaseLabel || "Следующая фаза"}
          disabled={!nextPhase}>
          {">"}
        </button>
      </div>

      <div className="finals-bracket__vertical-table-wrapper">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={activePhase}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="finals-bracket__vertical-table">
            {racesOfPhase.map(({ race, grid, index }, i) => {
              if (config.raceType !== "double16") return null;

              const isFinal = index === bracketData.length - 1;
              const raceStatusText = getStatusText(race.raceStatus, race.progressStatus);

              const glowClassName =
                getGlowClassnameByRaceStatus(race.raceStatus, race.calcMismatch) + " " + getGlowClassnameByProgressStatus(race.progressStatus) + (grid.isLowTab ? " _low-table" : "");

              const isToLowerBracket = TO_LOWER_BRACKET_RACE_NUMS.includes(race.raceNum);
              const loserClassName = isToLowerBracket ? "_toLowerBracket" : "_loser";

              const prevRace = racesOfPhase[i - 1];
              const showLowStrip = hasUpperInPhase && grid.isLowTab && (!prevRace || !prevRace.grid.isLowTab);

              return (
                <div key={index} className="finals-bracket__vertical-item">
                  {showLowStrip && (
                    <div className="finals-bracket__low-strip_vertical-wrapper">
                      <span className="finals-bracket__low-strip-label">{lowBracketText}</span>
                      <div className="finals-bracket__low-strip finals-bracket__low-strip_vertical" />
                    </div>
                  )}
                  <RaceCard
                    raceData={race}
                    raceNum={race.raceNum}
                    pilotsQuantity={race.pilotsId.length}
                    roundsQuantity={race.pilotsRoundPlaces.length}
                    racePhaseText={activePhaseLabel}
                    statusText={raceStatusText}
                    loserClassName={!isFinal && (race.raceStatus === "complete" || race.raceStatus === "lastComplete") ? loserClassName : ""}
                    glowClassName={glowClassName}
                    activePilotId={activePilotId}
                    pilotButton={getPilotId}
                  />
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default Doubles16TableVertical;
