import { motion } from "motion/react";
import ChannelAndColor from "../../ChannelAndColor";
import { getState } from "../../../js/sharedStates";
import { goToRoundAction } from "../../../js/playRound";

function RaceCard({ raceData, raceNum, gridRow, gridColumn, pilotsQuantity, roundsQuantity = 3, racePhaseText, statusText, loserClassName, glowClassName, activePilotId, pilotButton }) {
  const losersNums = Array.from({ length: Math.floor(pilotsQuantity / 2) }, (_, index) => pilotsQuantity - 1 - index);

  const style = gridRow || gridColumn ? { gridRow, gridColumn } : undefined;

  return (
    <div className={`finals-bracket__race ${glowClassName ?? ""}`} style={style}>
      <div className="finals-bracket__race-tittles">
        <h3 className="finals-bracket__race-num">{`${getState("textStrings").tournamentTab.race} ${raceNum}`}</h3>
        <h4 className="finals-bracket__race-phase">{racePhaseText || ""}</h4>
        <h2 className={`finals-bracket__race-status ${statusText ? "" : "_hidden"}`}>
          <p>{statusText || ""}</p>
        </h2>
      </div>

      <div className="finals-bracket__race-sub-tittles">
        <h4 className="finals-bracket__race-name-tittle _race-subtittle">{getState("textStrings").tournamentTab.pilots}</h4>
        <h4 className="finals-bracket__race-rounds-tittle _race-subtittle">{getState("textStrings").tournamentTab.rounds}</h4>
        <h4 className="finals-bracket__race-place-tittle _race-subtittle">{getState("textStrings").tournamentTab.scores}</h4>
      </div>

      <div className="finals-bracket__race-strokes" style={{ gridTemplateRows: `repeat(${pilotsQuantity}, 1fr)` }}>
        {raceData.pilotsRacePlaces?.map((pilotData, index) => {
          if (index >= pilotsQuantity && !pilotData.id) return null;

          const pilotInfo = raceData.pilotsInfo.find((pilot) => pilot.id == pilotData.id);
          const nodeIndex = pilotInfo?.nodeIndex;
          const pilotName = pilotInfo?.callsign;
          const pilotId = pilotInfo?.id;
          const pilotPlace = pilotData.place;

          const channelData = {
            channel: pilotInfo?.channel,
            color: pilotInfo?.color || COLORS[nodeIndex != undefined ? nodeIndex : COLORS.length - 1],
          };
          const isNoFly = pilotInfo?.notFly;
          const isLoser = !!loserClassName && losersNums.includes(index) && !!pilotId;
          //  pilotData.score
          const score = pilotData.score;

          return (
            <motion.div
              layout
              transition={{ duration: 1, ease: "easeOut" }}
              key={`pilot-${pilotData.id ? pilotData.id : index + 999}-race-${raceNum}`}
              className={`finals-bracket__pilot-items ${isNoFly ? "_no-fly" : ""}`}>
              <div
                onClick={pilotButton}
                pilot-id={pilotData.id}
                className={`finals-bracket__pilot-name _name-item _race-item _pilot-button ${+activePilotId == +pilotData.id ? "_active" : ""} ${isLoser ? loserClassName : ""}`}>
                <p>{pilotId ? (pilotPlace ? pilotPlace : index + 1) : ""}</p>
                <p>{pilotId ? pilotName : ""}</p>
                {channelData && pilotId != 0 && <ChannelAndColor channel={channelData.channel || ""} color={channelData.color} />}
              </div>

              <div
                className="finals-bracket__pilot-rounds _race-item"
                style={{
                  ...(raceData.pilotsRoundPlaces.length > roundsQuantity
                    ? { gridTemplateColumns: `repeat(${raceData.pilotsRoundPlaces.length}, 1fr)` }
                    : { gridTemplateColumns: `repeat(${roundsQuantity}, 1fr)` }),
                }}>
                {raceData.pilotsRoundPlaces.map((roundData, roundIndex) => {
                  const pilotRoundData = roundData.filter((data) => data.id == pilotData.id)[0];
                  if (pilotRoundData?.id) {
                    return (
                      <div
                        onClick={(e) => {
                          const roundHeatId = raceData.roundHeatIds?.[roundIndex] || null;
                          const roundId = raceData.roundIds?.[roundIndex] || null;
                          if (roundHeatId !== null && roundId !== null) {
                            goToRoundAction(roundId, roundHeatId);
                          }
                        }}
                        key={`round-${roundIndex}`}
                        className="finals-bracket__pilot-round">
                        {pilotRoundData?.place ? pilotRoundData.place : "-"}
                      </div>
                    );
                  }
                  return null;
                })}
              </div>

              <div className={`finals-bracket__pilot-place _race-item _place-item ${score.toString().length > 2 ? "_float-scores" : ""}`}>{pilotId != 0 ? score : ""}</div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default RaceCard;
