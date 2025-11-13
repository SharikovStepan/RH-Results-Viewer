import { getDoubles16Results } from "./utils";
import { motion } from "motion/react";

function Doubles16Results({ raceData, getPilotId, activePilotId }) {
	
  const handleClick = (e) => {
    getPilotId(e);
  };

  const doubles16Results = getDoubles16Results(raceData);

  const reversedResults = doubles16Results.reduce((acc, current) => [current, ...acc], []);
  let topPilots = [];
  let botPilots = [];

  console.log("Doubles16Results", doubles16Results);

  return (
    <>
      <div className="doubles16-results">
        <div className="doubles16-results__container">
          <div className="doubles16-results__pilots-container">
            <div className="doubles16-results__tittles">
              <div className="doubles16-results__tittle-place">Место</div>
              <div className="doubles16-results__tittle-name">Имя</div>

              {/* <div className="doubles16-results__tittle-lead">Отставание</div> */}
            </div>

            <div className="doubles16-results__pilots">
              {reversedResults.map((pilot, index) => {
                const place = pilot.doubles16Place;

                const pilotName = pilot.pilotName;
                const pilotId = pilot.id;

                return (
                  <motion.div
                    onClick={handleClick}
                    layout
                    transition={{ duration: 1, ease: "easeOut" }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={`${pilotName}-${pilotId || index}`}
                    pilot-id={pilotId}
                    className={`doubles16-results__pilot _pilot-button ${+activePilotId == +pilotId ? "_active" : ""}`}>
                    <div className="doubles16-results__pilot-place">
                      <p>{place}</p>
                    </div>
                    <div className="doubles16-results__pilot-name">
                      <p>{pilotName}</p>
                    </div>
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
export default Doubles16Results;
