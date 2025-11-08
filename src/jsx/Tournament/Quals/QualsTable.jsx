import { p } from "motion/react-client";
import ChannelAndColor from "../../ChannelAndColor";
import React from "react";

function QualsTable({ channelsAndColors, qualsInfo, qualsLeaderboard }) {
  console.log("qualsInfo", qualsInfo);

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
                    <div className="quals__rounds-tittle">Раунды</div>
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
                          <div key={`${pilotName}-${pilotId}`} className="quals__pilot-name">
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
                                const pilotLeaderboardInfo = qualsLeaderboard.find((pilot) => pilot.id == pilotId);

                                const isBestTime = timeStamp == pilotLeaderboardInfo.bestTime.timeStamp;

                                const timeResult = laps == qualsLaps ? timeString : `${laps}/${timeString}`;
                                return (
                                  <div
                                    key={`pilot-${pilotId}-time-${index}`}
                                    className={`quals__pilot-time pilot-1-time-1 ${isBestTime ? "_best-quals-time" : ""} ${laps != qualsLaps ? `_bad-qual-time` : ""}`}>
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

      {/* <div className="quals">
        <div className="quals__container">
          <div className="quals__group">
            <div className="quals__tittles">
              <div className="quals__heat-name">Группа 1</div>
              <div className="quals__rounds-tittle">Раунды</div>
              <div className="quals__round-num">
                <p>1</p>
                <p>2</p>
                <p>3</p>
                <p>4</p>
                <p>5</p>
                <p>6</p>
                <p>7</p>
                <p>8</p>
                <p>9</p>
                <p>10</p>
              </div>
            </div>
            <div className="quals__pilots-stats">
              <div className="quals__pilots-names">
                <div className="quals__pilot-name pilot-1-name">
                  <p>Алексей Родин</p>
                  {channelData && <ChannelAndColor channel={channelData?.channel} color={channelData?.color} />}
                </div>
                <div className="quals__pilot-name pilot-2-name">
                  <p>Станкевич Алексей</p>
                  {channelData && <ChannelAndColor channel={channelData?.channel} color={channelData?.color} />}
                </div>
                <div className="quals__pilot-name pilot-3-name">
                  <p>Владислав Меньшиков</p>
                  {channelData && <ChannelAndColor channel={channelData?.channel} color={channelData?.color} />}
                </div>
                <div className="quals__pilot-name pilot-4-name">
                  <p>Кошка 1</p>
                  {channelData && <ChannelAndColor channel={channelData?.channel} color={channelData?.color} />}
                </div>
              </div>
              <div className="quals__pilots-times">
                <div className="quals__pilot-times pilot-1-times">
                  <div className="quals__pilot-time pilot-1-time-1 _best-quals-time">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-1-time-2">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-1-time-3">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-1-time-4">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-1-time-5">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-1-time-6">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-1-time-7">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-1-time-8">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-1-time-9">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-1-time-10">
                    <p>0:37.666</p>
                  </div>
                </div>
                <div className="quals__pilot-times pilot-2-times">
                  <div className="quals__pilot-time pilot-2-time-1">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-2-time-2 _bad-qual-time">
                    <p>1/0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-2-time-3">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-2-time-4">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-2-time-5 _best-quals-time">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-2-time-6 _bad-qual-time">
                    <p>2/0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-2-time-7">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-2-time-8">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-2-time-9">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-2-time-10">
                    <p>0:37.666</p>
                  </div>
                </div>
                <div className="quals__pilot-times pilot-3-times">
                  <div className="quals__pilot-time pilot-3-time-1">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-3-time-2">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-3-time-3 _bad-qual-time">
                    <p>2/0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-3-time-4">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-3-time-5">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-3-time-6">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-3-time-7">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-3-time-8 _best-quals-time">
                    <p>0:10.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-3-time-9">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-3-time-10">
                    <p>0:37.666</p>
                  </div>
                </div>
                <div className="quals__pilot-times pilot-4-times">
                  <div className="quals__pilot-time pilot-4-time-1">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-4-time-2">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-4-time-3">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-4-time-4">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-4-time-5">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-4-time-6">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-4-time-7">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-4-time-8">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-4-time-9">
                    <p>0:37.666</p>
                  </div>
                  <div className="quals__pilot-time pilot-4-time-10 _best-quals-time">
                    <p>0:37.666</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}
export default QualsTable;
