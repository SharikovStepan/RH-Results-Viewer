import { motion } from "motion/react";
import { getStringGap } from "../utils";
import { getState } from "../../../js/sharedStates";
function QualsResults({ qualsLeaderboard, activePilotId, getPilotId }) {
  const topQuantity = 16;

  const lastToIndex = qualsLeaderboard.findIndex((pilotInfo) => pilotInfo.place == topQuantity);

  const topPilots = lastToIndex != -1 ? qualsLeaderboard.slice(0, lastToIndex + 1) : qualsLeaderboard;
  const botPilots = lastToIndex != -1 ? qualsLeaderboard.slice(lastToIndex + 1) : [];

  const handleClick = (e) => {
    getPilotId(e);
  };

  return (
    <>
      <div className="quals-results">
        <div className="quals-results__container">
          <div className="quals-results__top-container">
            <div className="quals-results__tittles">
              <div className="quals-results__tittle-name">{getState("textStrings").tournamentTab.name}</div>
              <div className="quals-results__tittle-time">{getState("textStrings").tournamentTab.time}</div>
              <div className="quals-results__tittle-lead">{getState("textStrings").tournamentTab.gap}</div>
            </div>

            <div className="quals-results__top-pilots">
              {topPilots.map((pilot, index) => {
                const place = pilot.place;
                const pilotName = pilot.name;
                const pilotId = pilot.id;
                const bestTimeStamp = pilot.bestTime.timeStamp;
                const bestTimeString = pilot.bestTime.timeString;
                const laps = pilot.bestTime.laps;
                const qualsLapsCount = pilot.bestTime.qualsLapsCount;
                const previousTimeStamp = index == 0 ? bestTimeStamp : topPilots[index - 1]?.bestTime.timeStamp;
                const previousLaps = index == 0 ? laps : topPilots[index - 1].bestTime.laps;
                const isLandmark = pilot.landmark ? true : false;

                const gapTime = laps == previousLaps ? getStringGap(bestTimeStamp, previousTimeStamp) : `+${previousLaps - laps} ${getState("textStrings").tournamentTab.lap}`;

                return (
                  <motion.div
                    layout
                    transition={{ duration: 1, ease: "easeOut" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={`${pilotName}-${pilotId}`}
                    onClick={!isLandmark && handleClick}
                    pilot-id={pilotId}
                    className={`${isLandmark ? "quals-results__landmark" : "quals-results__top-pilot"} _pilot-button ${activePilotId == pilotId ? "_active" : ""}`}>
                    <div className={`${isLandmark ? "quals-results__landmark-name" : "quals-results__top-pilot-name"}`}>
                      <p>{place || ""}</p>
                      <p>{pilotName}</p>
                    </div>
                    <div className={`${isLandmark ? "quals-results__landmark-time" : "quals-results__top-pilot-time"}`}>{qualsLapsCount == laps ? bestTimeString : `${laps}/${bestTimeString}`}</div>
                    <div className={`${isLandmark ? "quals-results__landmark-gap" : "quals-results__top-pilot-gap"}`}>{index == 0 ? "-" : gapTime}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="quals-results__bot-container">
            <div className="quals-results__bot-pilots">
              {botPilots.map((pilot, index) => {
                const place = pilot.place;
                const pilotName = pilot.name;
                const pilotId = pilot.id;
                const laps = pilot.bestTime.laps;
                const qualsLapsCount = pilot.bestTime.qualsLapsCount;
                const bestTimeStamp = pilot.bestTime.timeStamp;
                const bestTimeString = pilot.bestTime.timeString;
                const previousTimeStamp = index == 0 ? topPilots[topPilots.length - 1]?.bestTime.timeStamp : botPilots[index - 1]?.bestTime.timeStamp;
                const previousLaps = index == 0 ? topPilots[topPilots.length - 1]?.bestTime.laps : botPilots[index - 1]?.bestTime.laps;
                const isLandmark = pilot.landmark ? true : false;

                const gapTime = laps == previousLaps ? getStringGap(bestTimeStamp, previousTimeStamp) : `+${previousLaps - laps} ${getState("textStrings").tournamentTab.lap}`;

                return (
                  <motion.div
                    layout
                    transition={{ duration: 1, ease: "easeOut" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={`${pilotName}-${pilotId}`}
                    pilot-id={pilotId}
                    onClick={handleClick}
                    className={`${isLandmark ? "quals-results__landmark" : "quals-results__bot-pilot"} _pilot-button ${activePilotId == pilotId ? "_active" : ""}`}>
                    <div className={`${isLandmark ? "quals-results__landmark-name" : "quals-results__bot-pilot-name"} `}>
                      <p>{place || ""}</p>
                      <p>{pilotName}</p>
                    </div>
                    <div className={`${isLandmark ? "quals-results__landmark-time" : "quals-results__bot-pilot-time"} `}>{qualsLapsCount == laps ? bestTimeString : `${laps}/${bestTimeString}`}</div>
                    <div className={`${isLandmark ? "quals-results__landmark-gap" : "quals-results__bot-pilot-gap"} `}>{gapTime}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default QualsResults;
