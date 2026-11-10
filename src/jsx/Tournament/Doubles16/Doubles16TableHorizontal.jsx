import { useState, useEffect } from "react";
import { DOUBLE16_GRID_DATA } from "./const";
import RaceCard from "./RaceCard";
import { getGlowClassnameByProgressStatus, getGlowClassnameByRaceStatus, getStatusText } from "./Doubles16";

// import { getState } from "../../../js/sharedStates";

// function HorizontalTable({ raceData, getPilotId, activePilotId }) {
//   //   const [activePilotId, setActivePilotId] = useState(null);

//   const [activeRaces, setActiveRaces] = useState("");

//   const findStatus = (raceData) => {
//     const currentRace = raceData.findIndex((race) => race.status == "current");
//     const lastComplete = raceData.findIndex((race) => race.status == "lastComplete");
//     const nextRace = raceData.findIndex((race) => race.status == "next");

//     setActiveRaces([currentRace, lastComplete, nextRace]);
//   };

//   useEffect(() => {
//     findStatus(raceData);
//   }, [raceData]);

//   return (
//     <>
//       <div className="tournament__full-table" style={{ gridTemplateRows: `repeat(24, minmax(${getState("tournamentPilotsPerHeat") * 8 + 2}px, auto)` }}>
//         {raceData.map((race, index) => {
//           return (
//             <RaceCard
//               key={`race-${index}`}
//               raceData={race}
//               pilotButton={getPilotId}
//               activePilotId={activePilotId}
//               raceIndex={index}
//               gridPositionsData={DOUBLE_ELIM_GRIDS.horizontal}
//               doubleElimLows={DOUBLE_ELIM_GRIDS.lowTableRaces}
//               activeRaces={activeRaces}
//               pilotsQuantity={getState("tournamentPilotsPerHeat")}

//             />
//           );
//         })}
//         <div className="tournament__low-strip"></div>
//       </div>
//     </>
//   );
// }
// export default HorizontalTable;

function HorizontalTable({ bracketData, getPilotId, activePilotId, config }) {
  //   const [activePilotId, setActivePilotId] = useState(null);

  //   const findStatus = (raceData: RaceDataWithScoresWithStatusNumbered[]) => {
  //     const currentRace: number = raceData.findIndex((race) => race.status == "current");
  //     const lastComplete: number = raceData.findIndex((race) => race.status == "lastComplete");
  //     const nextRace: number = raceData.findIndex((race) => race.status == "next");

  //     setActiveRaces([currentRace, lastComplete, nextRace]);
  //   };

  //   useEffect(() => {
  //     findStatus(raceData);
  //   }, [raceData]);

  return (
    <>
      {/* <div className="finals-bracket">
        <div className="finals-bracket__container tab-items"> */}
      <div className="finals-bracket__full-table" style={{ gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: `repeat(24, minmax(${config.pilotsPerHeat * 8 + 2}px, auto)` }}>
        {bracketData.map((race, index) => {
          if (config.raceType !== "double16") return;
          const isFinal = index == bracketData.length - 1;

          const raceStatusText = getStatusText(race.raceStatus, race.progressStatus);

          const raceNum = race.raceNum;

          const glowClassName = getGlowClassnameByRaceStatus(race.raceStatus, race.calcMismatch) + " " + getGlowClassnameByProgressStatus(race.progressStatus);

          const toLowerBracketRaceNums = [1, 2, 3, 4, 6, 8, 11];
          const isToLowerBracket = toLowerBracketRaceNums.includes(raceNum);
          const loserClassName = isToLowerBracket ? "_toLowerBracket" : "_loser";

          return (
            <RaceCard
              key={index}
              raceData={race}
              raceNum={raceNum}
              gridRow={DOUBLE16_GRID_DATA.horizontal[index].gridRow}
              gridColumn={DOUBLE16_GRID_DATA.horizontal[index].gridColumn}
              pilotsQuantity={race.pilotsId.length}
              roundsQuantity={race.pilotsRoundPlaces.length}
              racePhaseText={DOUBLE16_GRID_DATA.horizontal[index].racePhase}
              statusText={raceStatusText}
              loserClassName={!isFinal && (race.raceStatus == "complete" || race.raceStatus == "lastComplete") ? loserClassName : ""}
              glowClassName={glowClassName}
              activePilotId={activePilotId}
              pilotButton={getPilotId}
            />
          );
        })}
        <div className="finals-bracket__low-strip"></div>

        {/* {!isTransparent && (
              <>
                <div className="max-h-full max-w-full row-[1/7] col-[3/4] relative overflow-hidden">
                  <img className="absolute p-2 inset-0 w-full h-full object-contain" src={horizontal} alt="drivefpv" />
                </div>

                <div className="max-h-full max-w-full row-[11/17] col-[3/4] relative overflow-hidden">
                  <img className="absolute p-10 inset-0 w-full h-full object-contain" src={horizontal} alt="drivefpv" />
                </div>
              </>
            )} */}
      </div>
      {/* </div>
      </div> */}
    </>
  );
}
export default HorizontalTable;
