import { motion } from "motion/react";
import { getStringGap } from "../utils";

function QualsResults({ qualsLeaderboard, activePilotId, getPilotId }) {
  const topQuantity = 16;

  const topPilots = qualsLeaderboard.slice(0, topQuantity);
  const botPilots = qualsLeaderboard.slice(topQuantity);

  const handleClick = (e) => {
    getPilotId(e);
  };

  return (
    <>
      <div className="quals-results">
        <div className="quals-results__container">
          <div className="quals-results__top-container">
            <div className="quals-results__tittles">
              <div className="quals-results__tittle-name">Имя</div>
              <div className="quals-results__tittle-time">Время</div>
              <div className="quals-results__tittle-lead">Отставание</div>
            </div>

            <div className="quals-results__top-pilots">
              {topPilots.map((pilot, index) => {
                const place = index + 1;
                const pilotName = pilot.name;
                const pilotId = pilot.id;
                const bestTimeStamp = pilot.bestTime.timeStamp;
                const bestTimeString = pilot.bestTime.timeString;
                const laps = pilot.bestTime.laps;
                const qualsLapsCount = pilot.bestTime.qualsLapsCount;
                const previousTimeStamp = index == 0 ? bestTimeStamp : topPilots[index - 1].bestTime.timeStamp;
                const previousLaps = index == 0 ? laps : topPilots[index - 1].bestTime.laps;

                const gapTime = laps == previousLaps ? getStringGap(bestTimeStamp, previousTimeStamp) : `+${previousLaps - laps} круг`;

                return (
                  <motion.div
                    layout
                    transition={{ duration: 1, ease: "easeOut" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={`${pilotName}-${pilotId}`}
                    onClick={handleClick}
                    pilot-id={pilotId}
                    className={`quals-results__top-pilot _pilot-button ${activePilotId == pilotId ? "_active" : ""}`}>
                    <div className="quals-results__top-pilot-name">
                      <p>{place}</p>
                      <p>{pilotName}</p>
                    </div>
                    <div className="quals-results__top-pilot-time">{qualsLapsCount == laps ? bestTimeString : `${laps}/${bestTimeString}`}</div>
                    <div className="quals-results__top-pilot-gap">{index == 0 ? "-" : gapTime}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="quals-results__bot-container">
            <div className="quals-results__bot-pilots">
              {botPilots.map((pilot, index) => {
                const place = topQuantity + index + 1;
                const pilotName = pilot.name;
                const pilotId = pilot.id;
                const laps = pilot.bestTime.laps;
                const qualsLapsCount = pilot.bestTime.qualsLapsCount;
                const bestTimeStamp = pilot.bestTime.timeStamp;
                const bestTimeString = pilot.bestTime.timeString;
                const previousTimeStamp = index == 0 ? topPilots[topPilots.length - 1].bestTime.timeStamp : botPilots[index - 1].bestTime.timeStamp;
                const previousLaps = index == 0 ? topPilots[topPilots.length - 1].bestTime.laps : botPilots[index - 1].bestTime.laps;

                const gapTime = laps == previousLaps ? getStringGap(bestTimeStamp, previousTimeStamp) : `+${previousLaps - laps} круг`;

                return (
                  <motion.div
                    layout
                    transition={{ duration: 1, ease: "easeOut" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={`${pilotName}-${pilotId}`}
                    pilot-id={pilotId}
                    onClick={handleClick}
                    className={`quals-results__bot-pilot _pilot-button ${activePilotId == pilotId ? "_active" : ""}`}>
                    <div className="quals-results__bot-pilot-name">
                      <p>{place}</p>
                      <p>{pilotName}</p>
                    </div>
                    <div className="quals-results__bot-pilot-time">{qualsLapsCount == laps ? bestTimeString : `${laps}/${bestTimeString}`}</div>
                    <div className="quals-results__bot-pilot-gap">{gapTime}</div>
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
