import { useEffect, useRef, useState } from "react";
import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import ChannelAndColor from "../../ChannelAndColor";
import { getState } from "../../../js/sharedStates";
import { COLORS } from "../const";
import { useUrlPhase } from "../useUrlPhase";
import { goToRoundAction } from "../../../js/playRound";

function QualsTableVertical({ bracketData, getPilotId, activePilotId, config }) {
  const maxRoundsFromData = Math.max(1, ...bracketData.flatMap((heat) => heat.pilots.map((p) => p.roundsInfo?.length || 0)));
  const roundsQuantity = config?.roundsQuantity ?? maxRoundsFromData;

  const [activeRound1Based, switchRound, direction] = useUrlPhase({
    min: 1,
    max: roundsQuantity,
    param: "phase",
  });
  const activeRoundIdx = activeRound1Based - 1;

  // Подрезка при уменьшении roundsQuantity
  useEffect(() => {
    if (activeRound1Based > roundsQuantity) {
      switchRound(roundsQuantity, -1);
    }
  }, [roundsQuantity]);

  // --- Floating-кнопки ---
  const sentinelRef = useRef(null);
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const check = () => {
      const rect = el.getBoundingClientRect();
      // sentinel полностью выше viewport → inline-кнопки ушли
      setShowFloating(rect.bottom < 0);
    };

    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  const timeVariants = {
    enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };

  const handleClick = (e) => getPilotId(e);

  const roundsText = getState("textStrings")?.tournamentTab?.round ?? "Раунд";
  const roundLabel = `${roundsText} ${activeRound1Based}`;

  const prevDisabled = activeRound1Based <= 1;
  const nextDisabled = activeRound1Based >= roundsQuantity;

  // Панель кнопок — используется дважды: inline и во floating
  const renderButtons = () => (
    <div className="finals-bracket__buttons _buttons-wrapper">
      <button
        type="button"
        className={`_button finals-bracket__button ${prevDisabled ? "_disabled" : ""}`}
        onClick={() => switchRound(activeRound1Based - 1, -1)}
        disabled={prevDisabled}
        aria-label="Предыдущий раунд">
        {"<"}
      </button>
      {/* <span className="finals-bracket__phase-name">{roundLabel}</span> */}
      <span className="finals-bracket__phase-name">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.span
            key={activeRound1Based}
            custom={direction}
            variants={timeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ display: "inline-block" }}>
            {roundLabel}
          </motion.span>
        </AnimatePresence>
      </span>
      <button
        type="button"
        className={`_button finals-bracket__button ${nextDisabled ? "_disabled" : ""}`}
        onClick={() => switchRound(activeRound1Based + 1, 1)}
        disabled={nextDisabled}
        aria-label="Следующий раунд">
        {">"}
      </button>
    </div>
  );

  return (
    <>
      {renderButtons()}

      {createPortal(
        <AnimatePresence>
          {showFloating && (
            <motion.div
              key="quals-floating-buttons"
              initial={{ y: 40, x: "-50%", opacity: 0 }}
              animate={{ y: 0, x: "-50%", opacity: 1 }}
              exit={{ y: 40, x: "-50%", opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="quals__floating-buttons">
              {renderButtons()}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
      <div ref={sentinelRef} aria-hidden="true" style={{ height: 1, width: "100%" }} />

      <div className="quals _vertical">
        <div className="quals__container">
          {bracketData.map((qualHeat) => {
            const heatName = qualHeat.heatName;
            const roundsArr = qualHeat.pilots?.[0].roundsInfo;
            const pilots = qualHeat.pilots;
            const pilotsQuantity = pilots?.length;

            return (
              <React.Fragment key={heatName}>
                <div className="quals__group">
                  <div className="quals__tittles">
                    <div className="quals__heat-name">{heatName}</div>
                    <div className="quals__rounds-tittle">{getState("textStrings").tournamentTab.time}</div>
                    <div className="quals__round-num" style={{ gridTemplateColumns: `repeat(${roundsArr.length},1fr)` }}>
                      {roundsArr.map((round, index) => (
                        <p key={`${qualHeat.heatId}-round-${index}`} className={index === activeRoundIdx ? "_active" : ""}>
                          {index + 1}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="quals__pilots-stats">
                    <div className="quals__pilots-names" style={{ gridTemplateRows: `repeat(${pilotsQuantity},1fr)` }}>
                      {pilots.map((pilot) => {
                        const nodeIndex = pilot.nodeIndex;
                        const pilotName = pilot.callsign;
                        const pilotId = pilot.id;
                        const channelData = {
                          channel: pilot?.channel,
                          color: pilot?.color || COLORS[nodeIndex],
                        };

                        return (
                          <div pilot-id={pilotId} onClick={handleClick} key={`${pilotName}-${pilotId}`} className={`quals__pilot-name _pilot-button ${activePilotId == pilotId ? "_active" : ""}`}>
                            <p>{pilotName}</p>
                            {channelData && <ChannelAndColor channel={channelData.channel} color={channelData.color} />}
                          </div>
                        );
                      })}
                    </div>

                    <div
                      className="quals__pilots-times"
                      style={{
                        gridTemplateColumns: "1fr",
                        gridTemplateRows: `repeat(${pilotsQuantity},1fr)`,
                      }}>
                      <AnimatePresence mode="wait" custom={direction} initial={false}>
                        <motion.div
                          key={activeRoundIdx}
                          custom={direction}
                          variants={timeVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          transition={{ duration: 0.22, ease: "easeInOut" }}
                          style={{
                            position: "absolute",
                            inset: 0,
                            display: "grid",
                            gridTemplateRows: `repeat(${pilotsQuantity},1fr)`,
                          }}>
                          {pilots.map((pilot) => {
                            const pilotRounds = pilot.roundsInfo;
                            const pilotId = pilot.id;
                            const pilotName = pilot.callsign;
                            const roundInfo = pilotRounds?.[activeRoundIdx];

                            return (
                              <div className="quals__pilot-times">
                                <div
                                  onClick={(e) => {
                                    const roundHeatId = roundInfo.heatId || null;
                                    const roundId = roundInfo.roundId || null;
                                    if (roundHeatId !== null && roundId !== null) {
                                      goToRoundAction(roundId, roundHeatId);
                                    }
                                  }}
                                  key={`${pilotName}-${pilotId}-time`}
                                  className="quals__pilot-time">
                                  {roundInfo?.isRoundResults ? (
                                    (() => {
                                      const timeStamp = roundInfo.timeStamp;
                                      const timeString = roundInfo.timeString;
                                      const qualsLaps = roundInfo.qualsLapsCount;
                                      const laps = roundInfo.laps;
                                      const bestTime = pilot.bestTime?.timeStamp;
                                      const isBestTime = timeStamp == bestTime;
                                      const isFirstQual = pilotRounds.filter((r) => r.isRoundResults).length <= 1;
                                      const timeResult = laps == qualsLaps ? timeString : `${laps}/${timeString}`;

                                      return <p className={`${isBestTime && !isFirstQual ? "_best-quals-time" : ""} ${laps != qualsLaps ? "_bad-qual-time" : ""}`}>{timeResult}</p>;
                                    })()
                                  ) : (
                                    <p>-</p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default QualsTableVertical;
