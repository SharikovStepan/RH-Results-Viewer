import ChannelAndColor from "../../ChannelAndColor";
import React from "react";
import { getState } from "../../../js/sharedStates";

function QualsTable({ channelsAndColors, qualsInfo, getPilotId, activePilotId }) {
  const handleClsick = (e) => {
    getPilotId(e);
  };

  return (
    <>
      <div className="quals">
        <div className="quals__container">
          {qualsInfo.map((qualHeat) => {
            const heatName = qualHeat.heatName;
            const roundsArr = qualHeat.pilots?.[0].roundsInfo;
            const pilots = qualHeat.pilots;
            const pilotsQuantity = pilots?.length;
            return (
              <React.Fragment key={heatName}>
                <div className="quals__group">
                  <div className="quals__tittles">
                    <div className="quals__heat-name">{heatName}</div>
                    <div className="quals__rounds-tittle">{getState("textStrings").tournamentTab.rounds}</div>
                    <div className="quals__round-num" style={{ gridTemplateColumns: `repeat(${roundsArr.length},1fr)` }}>
                      {roundsArr.map((round, index) => {
                        return <p key={`${qualHeat.heatId}-round-${index}`}>{index + 1}</p>;
                      })}
                    </div>
                  </div>
                  <div className="quals__pilots-stats">
                    <div className="quals__pilots-names" style={{ gridTemplateRows: `repeat(${pilotsQuantity},1fr)` }}>
                      {pilots.map((pilot) => {
                        const nodeIndex = pilot.nodeIndex;
                        const pilotName = pilot.callsign;
                        const pilotId = pilot.id;
                        const channelData = channelsAndColors.find((node) => node.nodeIndex == nodeIndex);

                        return (
                          <div pilot-id={pilotId} onClick={handleClsick} key={`${pilotName}-${pilotId}`} className={`quals__pilot-name _pilot-button ${activePilotId == pilotId ? "_active" : ""}`}>
                            <p>{pilotName}</p>
                            {channelData && <ChannelAndColor channel={channelData?.channel} color={channelData?.color} />}
                          </div>
                        );
                      })}
                    </div>

                    <div className="quals__pilots-times" style={{ gridTemplateRows: `repeat(${pilotsQuantity},1fr)` }}>
                      {pilots.map((pilot) => {
                        const pilotRounds = pilot.roundsInfo;
                        const pilotId = pilot.id;
                        const pilotName = pilot.callsign;
                        return (
                          <div key={`${pilotName}-${pilotId}-times`} className="quals__pilot-times pilot-1-times" style={{ gridTemplateColumns: `repeat(${pilotRounds.length},1fr)` }}>
                            {pilotRounds.map((roundInfo, index) => {
                              if (roundInfo.isRoundResults) {
                                const timeStamp = roundInfo.timeStamp;
                                const timeString = roundInfo.timeString;
                                const qualsLaps = roundInfo.qualsLapsCount;
                                const laps = roundInfo.laps;
                                const bestTime = pilot.bestTime.timeStamp;
                                const isBestTime = timeStamp == bestTime;
                                const isFirstQual = pilotRounds.filter((round) => round.isRoundResults).length <= 1;
                                const timeResult = laps == qualsLaps ? timeString : `${laps}/${timeString}`;
                                return (
                                  <div
                                    key={`pilot-${pilotId}-time-${index}`}
                                    className={`quals__pilot-time pilot-1-time-1 ${isBestTime && !isFirstQual ? "_best-quals-time" : ""} ${laps != qualsLaps ? `_bad-qual-time` : ""}`}>
                                    <p>{timeResult}</p>
                                  </div>
                                );
                              } else {
                                return (
                                  <div key={`no-results-for-id-${pilotId}-${index}`} className={`quals__pilot-time pilot-1-time-1`}>
                                    <p>-</p>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        );
                      })}
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
export default QualsTable;
