import { motion } from "motion/react";
import { getState } from "../../../js/sharedStates";


function QualsResults({ leaderboardData, activePilotId, getPilotId, config, consecutivesCount = 3 }) {
  const topQuantity = config.topPilotQuantity;

  //   const leaderboardData = raceClassData.dataResults.leaderboard;

  const qualsLapsCount = config.qualsType == "bestLap" ? 1 : config.qualsType == "bestConsecutive" ? consecutivesCount : getQualsMaxLaps(leaderboardData);

  const lastToIndex = leaderboardData.findIndex((pilotInfo) => pilotInfo.place === topQuantity);

  const topPilots = lastToIndex !== -1 ? leaderboardData.slice(0, lastToIndex + 1) : leaderboardData.slice(0, topQuantity);

  const botPilots = lastToIndex !== -1 ? leaderboardData.slice(lastToIndex + 1) : leaderboardData.slice(topQuantity);

  const handleClick = (e) => {
    getPilotId(e);
  };

  return (
    <>
      <div className="quals-results">
        <div className="quals-results__container">
          {/* leaderboard-drive-fpv */}

          <div className="quals-results__top-container leaderboard-drive-fpv">
            <div className="quals-results__tittles text-shadow-[1px_1px_2px_#000]">
              <div className="quals-results__tittle-name">{getState("textStrings").tournamentTab.name}</div>

              {/* <div className="quals-results__tittle-name h-10">
                <img className="w-full h-full object-contain" src={logo} alt="" />
              </div> */}

              <div className="quals-results__tittle-time">{getState("textStrings").tournamentTab.time}</div>
              <div className="quals-results__tittle-lead">{getState("textStrings").tournamentTab.gap}</div>
            </div>

            <div className="quals-results__top-pilots">
              {topPilots.map((pilot, index) => {
                const place = pilot.place;
                const pilotName = pilot.callsign;
                const pilotId = pilot.id;
                const bestTimeStamp = pilot.bestTime?.timeStamp;
                const bestTimeString = pilot.bestTime?.timeString;
                const laps = pilot.bestTime?.laps || 0;
                const previousTimeStamp = index == 0 ? bestTimeStamp : topPilots[index - 1].bestTime?.timeStamp;
                const previousLaps = index == 0 ? laps || 0 : topPilots[index - 1].bestTime?.laps || 0;
                //  const isLandmark = pilot.landmark ? true : false;

                const gapTime = laps == previousLaps ? getStringGap(bestTimeStamp, previousTimeStamp) : `+${previousLaps - laps} круг`;

                return (
                  <motion.div
                    layout
                    transition={{ duration: 1, ease: "easeOut" }}
                    //   initial={{ opacity: 1 }}
                    //   animate={{ opacity: 1 }}
                    key={pilotId !== 0 ? `${pilotName}-${pilotId}` : `${index}-${place || 0}`}
                    onClick={handleClick}
                    pilot-id={pilotId}
                    className={`quals-results__top-pilot _pilot-button ${activePilotId == pilotId ? "_active" : ""}`}>
                    <div className={`quals-results__top-pilot-name text-shadow-[1px_1px_2px_#000]`}>
                      <p>{place || ""}</p>
                      <p className="">{pilotName}</p>
                    </div>
                    <div className={`quals-results__top-pilot-time text-shadow-[1px_1px_2px_#000]`}>
                      {pilotId !== 0 && (place == null ? "-" : qualsLapsCount == laps ? bestTimeString : `${laps}/${bestTimeString}`)}
                    </div>
                    <div className={`quals-results__top-pilot-gap text-shadow-[1px_1px_2px_#000]`}>{pilotId !== 0 && (index == 0 || place == null ? "-" : gapTime)}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="quals-results__bot-container">
            <div className="quals-results__bot-pilots">
              {botPilots.map((pilot, index) => {
                const place = pilot.place;
                const pilotName = pilot.callsign;
                const pilotId = pilot.id;
                const laps = pilot.bestTime?.laps || 0;
                //  const qualsLapsCount = pilot.bestTime?.qualsLapsCount;
                const bestTimeStamp = pilot.bestTime?.timeStamp;
                const bestTimeString = pilot.bestTime?.timeString;
                const previousTimeStamp = index == 0 ? topPilots[topPilots.length - 1].bestTime?.timeStamp : botPilots[index - 1].bestTime?.timeStamp;
                const previousLaps = index == 0 ? topPilots[topPilots.length - 1].bestTime?.laps || 0 : botPilots[index - 1].bestTime?.laps || 0;
                //  const isLandmark = pilot.landmark ? true : false;

                const gapTime = laps == previousLaps ? getStringGap(bestTimeStamp, previousTimeStamp) : `+${previousLaps - laps} круг`;

                return (
                  <motion.div
                    layout
                    transition={{ duration: 1, ease: "easeOut" }}
                    //   initial={{ opacity: 0 }}
                    //   animate={{ opacity: 1 }}
                    key={pilotId !== 0 ? `${pilotName}-${pilotId}` : `${index}-${place || 0}`}
                    //   pilot-id={pilotId}
                    onClick={handleClick}
                    className={`quals-results__bot-pilot _pilot-button ${activePilotId == pilotId ? "_active" : ""}`}>
                    <div className={`quals-results__bot-pilot-name `}>
                      <p>{place || ""}</p>
                      <p>{pilotName}</p>
                    </div>
                    <div className={`quals-results__bot-pilot-time`}>{pilotId !== 0 && (place == null ? "-" : qualsLapsCount == laps ? bestTimeString : `${laps}/${bestTimeString}`)}</div>
                    <div className={`quals-results__bot-pilot-gap`}>{pilotId !== 0 && (index == 0 || place == null ? "-" : gapTime)}</div>
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

const getStringGap = (timeStamp, previousTimeStamp) => {
  if (!timeStamp || !previousTimeStamp) return "0:000.000";
  const gapTimeStamp = timeStamp - previousTimeStamp;
  const formatted = gapTimeStamp / 1000;
  const fixed = formatted.toFixed(3);

  const minutes = Math.floor(Number(fixed) / 60);
  const secconds = Math.floor(Number(fixed) % 60);
  const milliseconds = Math.floor((Number(fixed) % 1) * 1000);

  return `+${minutes}:${String(secconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
};

function getQualsMaxLaps(leaderBoard) {
  const lapsArr = leaderBoard.map((pilot) => pilot.bestTime?.laps || 0);
  return Math.max(...lapsArr);
}
