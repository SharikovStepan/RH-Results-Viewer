import React, { useState, useEffect } from "react";

import { getState, getTab, subscribe, unsubscribe } from "../../js/sharedStates";
import HorizontalTable from "./HorizontalTable";
import DirectionSwitcher from "./DirectionSwitcher";

import { getResultRaces, setDuelPlaces, setRaceScores, setRaceStatus, getPlannedRaces, addEmptyRaces, getChannelsAndColors, getRoundsPauses, getRacesPauses, getRacesTime } from "./utils";
import { tabSwitch } from "../../js/uiChange";
import { getParamTabIndex } from "../../js/utils";
import { div } from "motion/react-client";
import VerticalTable from "./VerticalTable";
import { COLORS } from "./const";
import Quals from "./Quals/Quals";

const checkPauses = false;

function Tournament({ fullRHData, currentClass }) {
  const [fullData, setFullData] = useState(fullRHData);
  const [raceClass, setRaceClass] = useState(currentClass);

  let qualsLeaderboard = [];
  let qualsInfo = [];
  let raceInfo = [];

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1023);

  const [activeTabId, setActiveTabId] = useState(1);

  const tournamentTypeInfo = fullData.finalTypesByClass.find((type) => type.raceClassId == raceClass);

  const results = fullData.results;

  const channelsAndColors = getChannelsAndColors(fullData.channels, COLORS);

  const roundsQuantity = getState("tournamentRoundsQuantity");
  const finalRoundsQuantity = getState("tournamentFinalRoundsQuantity");
  const raceQuantity = getState("tournamentRaceQuantity");
  const pilotsPerHeat = getState("tournamentPilotsPerHeat");

  const duplicatedHeatsData = fullData.duplicatedHeats.filter((heat) => heat.classId == raceClass);
  const duplicatedHeatsId = duplicatedHeatsData.map((heat) => heat.heatId);
  const duplicateIds = duplicatedHeatsData.map((heat) => heat.duplicateId);

  const allSlots = fullData.noResultsHeats.filter((heat) => heat.classId == raceClass);

  const noResultsHeats = allSlots.filter((slot) => slot.isResults == false).filter((heat) => duplicateIds?.includes(heat.heatId) == false);

  const heatsNum = fullData.results["heats_by_class"][raceClass];
  const heatsNumSorted = [];
  heatsNum.forEach((num) => {
    if (duplicatedHeatsId?.includes(num)) {
      const duplicateDataForCurrent = duplicatedHeatsData.filter((heat) => heat.heatId == num);
      const duplicateIdForCurrent = duplicateDataForCurrent.map((duplicated) => duplicated.duplicateId);

      heatsNumSorted.push(num, ...duplicateIdForCurrent);
    } else if (heatsNumSorted?.includes(num)) {
      return;
    } else {
      heatsNumSorted.push(num);
    }
  });

  const deletedRounds = fullData.deletedRounds;
  const deletedRoundsInHeats = deletedRounds.filter((data) => heatsNumSorted.includes(data.heatId));

  const heatsData = heatsNumSorted
    .map((heatNum) => {
      const heatFromResults = results["heats"][heatNum];
      if (heatFromResults) {
        return heatFromResults;
      } else {
        return {};
      }
    })
    .filter((heatData) => heatData.heat_id);

  //Ломалось без явного указания heatId и heatName...
  //   const roundsWithResultsOld = heatsData
  //     .map((heat) => {
  //       if (deletedRoundsInHeats.length > 0) {
  //         const deletedRoundsInHeat = deletedRoundsInHeats.find((data) => data.heatId == heat.heat_id)?.deletedRoundNum || [];
  //         const filteredRounds = heat.rounds.filter((round) => !deletedRoundsInHeat.includes(round.id));
  //         return filteredRounds;
  //       } else {
  //         return heat.rounds;
  //       }
  //     })
  //     .flat();

  //Здесь собираем все раунды
  const roundsWithResults = heatsData
    .map((heat) => {
      const heatId = heat.heat_id;
      const heatName = heat.displayname;

      if (deletedRoundsInHeats.length > 0) {
        const deletedRoundsInHeat = deletedRoundsInHeats.find((data) => data.heatId == heatId)?.deletedRoundNum || [];

        const filteredRounds = heat.rounds
          .filter((round) => !deletedRoundsInHeat.includes(round.id))
          .map((round) => ({
            ...round,
            heatId,
            heatName,
          }));

        return filteredRounds;
      } else {
        return heat.rounds.map((round) => ({
          ...round,
          heatId,
          heatName,
        }));
      }
    })
    .flat();

  if (tournamentTypeInfo.finalType == "double16") {
    //собираем массив всех выполненных гонок
    const races = getResultRaces(roundsWithResults, allSlots);

    //Ставим баллы за дуэли, если они есть
    const raceWithDuels = setDuelPlaces(races, raceQuantity, roundsQuantity, finalRoundsQuantity);

    //Здесь счет каждой гонки, уже не раунда
    const racesWithScore = setRaceScores(raceWithDuels, pilotsPerHeat);

    //ставим статус complete и проверяем последнюю гонку, complete она или нет
    const racesWithStatus = setRaceStatus(racesWithScore, raceQuantity, roundsQuantity, finalRoundsQuantity);

    //собираем массив предстоящих гонок
    const plannedRaces = getPlannedRaces(noResultsHeats, roundsQuantity, pilotsPerHeat);

    //соединяем два массива Results и noResults
    const allKnownRaces = [...racesWithStatus, ...plannedRaces];

    //делаем массив всех гонок(+пусые)
    raceInfo = allKnownRaces.length == raceQuantity ? allKnownRaces : addEmptyRaces(allKnownRaces, raceQuantity, pilotsPerHeat);
  }

  if (tournamentTypeInfo.finalType == "quals") {
    const pilotsLeaderboard = [];

    const qualsType = getState("tournamentQualsType");

    const consecutivesCount = getState("consecutivesCount");

    const qualSlots = allSlots.filter((slot) => !duplicateIds?.includes(slot.heatId));

    const qualsSlotsFull = qualSlots.map((slot) => {
      if (duplicatedHeatsId?.includes(slot.heatId)) {
        const duplicatedInfo = duplicatedHeatsData.filter((duplicatedHeat) => duplicatedHeat.heatId == slot.heatId);
        const duplicatedIds = duplicatedInfo.map((dupl) => dupl.duplicateId);
        const lastSlotInfo = allSlots.find((slot) => slot.heatId == duplicatedIds[duplicatedIds.length - 1]);
        return { ...slot, pilots: lastSlotInfo.pilots, duplicateHeats: duplicatedIds };
      } else {
        return { ...slot, duplicateHeats: false };
      }
    });

    const qualsSlotsInfo = qualsSlotsFull.map((slotInfo) => {
      const diplicatedId = slotInfo.duplicateHeats ? slotInfo.duplicateHeats : [];
      const heatIds = [+slotInfo.heatId, ...diplicatedId];

      // const roundsForGroupOld = roundsWithResults.filter((round) => {
      //   console.log("round in OLD", round);
      //   console.log("+round.heatId OLD", +round.heatId);

      //   return heatIds.includes(+round.heatId);
      // });

      const roundsForGroup = roundsWithResults.filter((round) => heatIds.includes(+round.heatId));

      const pilotsInfo = slotInfo.pilots.map((pilotSlot) => {
        const pilotRoundsInfo = roundsForGroup.map((roundInfo) => {
          const roundResults = roundInfo.leaderboard.by_fastest_lap;
          const pilotRoundResults = roundResults.find((pilotResults) => pilotResults.pilot_id == pilotSlot.id);

          return pilotRoundResults;
        });

        const allRounds = Array.from({ length: 10 }, (_, index) => {
          if (pilotRoundsInfo?.[index]) {
            return pilotRoundsInfo[index];
          } else {
            return {};
          }
        });

        const roundsInfo = allRounds.map((round) => {
          if (round.laps) {
            const timeString = round[qualsType];
            const timeStamp = round[`${qualsType}_raw`];
            const laps = qualsType == "consecutives" ? round.consecutives_base : 1;
            const pilotId = round.pilot_id;
            const pilotName = round.callsign;
            const qualsLapsCount = qualsType == "consecutives" ? consecutivesCount : 1;

            return { isRoundResults: true, timeString, timeStamp, laps, pilotId, pilotName, qualsType, qualsLapsCount };
          } else {
            return { isRoundResults: false };
          }
        });
        return { ...pilotSlot, roundsInfo: roundsInfo };
      });

      return { ...slotInfo, pilots: pilotsInfo };
    });

    const qualsFullInfo = qualsSlotsInfo.map((slotInfo) => {
      const pilotsInSlotInfo = slotInfo.pilots.map((pilotInfo) => {
        const pilotInfoObj = {};
        pilotInfoObj.id = pilotInfo.id;
        pilotInfoObj.name = pilotInfo.callsign;
        pilotInfoObj.times = [];
        const pilotResults = pilotInfo.roundsInfo.filter((info) => info.laps > 0);

        pilotResults.forEach((results) => {
          const timeString = results.timeString;
          const timeStamp = results.timeStamp;
          const laps = results.laps;
          const qualsLapsCount = results.qualsLapsCount;

          pilotInfoObj.times.push({ timeStamp, timeString, laps, qualsType, qualsLapsCount });
        });

        if (pilotInfoObj.times.length > 0) {
          pilotInfoObj.times.sort((a, b) => b.laps - a.laps || a.timeStamp - b.timeStamp);

          pilotInfoObj.bestTime = pilotInfoObj.times[0];

          pilotsLeaderboard.push(pilotInfoObj);
          return { ...pilotInfo, bestTime: pilotInfoObj.times[0] };
        } else {
          return { ...pilotInfo, bestTime: false };
        }
      });
      return { ...slotInfo, pilots: pilotsInSlotInfo };
    });

    const pilotsLeaderboardFiltered = pilotsLeaderboard.reduce((acc, pilot, index) => {
      console.log("acc", acc);
      console.log("pilot", pilot);
      const prevIds = acc.map((pilot) => pilot.id);

      const isRepeatId = prevIds.includes(pilot.id);
      console.log("isRepeatId", isRepeatId);

      if (isRepeatId) {
        const prevpilotInfo = acc.find((prevPilot) => prevPilot.id == pilot.id);
        const newTimes = pilot.times;
        const prevTimes = prevpilotInfo.times;
        const allTimes = [...prevTimes, ...newTimes];

        const allTimesSorted = allTimes.sort((a, b) => b.laps - a.laps || a.timeStamp - b.timeStamp);
        const newBestTime = allTimesSorted.length > 0 ? allTimesSorted[0] : false;

        const accFiltered = acc.filter((accPilot) => accPilot.id != pilot.id);

        return [...accFiltered, { ...prevpilotInfo, times: allTimes, bestTime: newBestTime }];
      } else {
        return [...acc, pilot];
      }
    }, []);
    console.log("pilotsLeaderboard", pilotsLeaderboard);

    console.log("pilotsLeaderboardFiltered", pilotsLeaderboardFiltered);

    const sortedPilotsLeaderboard = pilotsLeaderboardFiltered.sort((a, b) => b.bestTime.laps - a.bestTime.laps || a.bestTime.timeStamp - b.bestTime.timeStamp);

    qualsLeaderboard = sortedPilotsLeaderboard;
    qualsInfo = qualsFullInfo;
  }

  if (checkPauses) {
    getRacesPauses(allRaces);
    getRoundsPauses(allRaces);
    getRacesTime(allRaces);
  }

  //   console.log("heatsheats", heatsData);
  //   console.log("roundsrounds", rounds);
  //   console.log("races", races);
  //   console.log("racesWithScore", racesWithScore);
  //   console.log("ALLLLRACESSS", allRaces);

  //   const getButton = (e) => {
  //     const currentId = e.target.id;
  //     setActiveTabId(+currentId);
  //     console.log("activeTabIdactiveTabId", e.target.id);
  //   };

  useEffect(() => {
    const handleUpdate = (value) => {
      setFullData(value);
    };
    const raceClassUpdate = (value) => {
      setRaceClass(value);
    };

    subscribe("fullRHData", handleUpdate);
    subscribe("currentClass", raceClassUpdate);

    const mainTabParam = getParamTabIndex("main");

    if (mainTabParam == 3) tabSwitch(getTab("main")[mainTabParam].name, getTab("main"), "main", true);

    return () => {
      unsubscribe("fullRHData", handleUpdate);
      unsubscribe("currentClass", raceClassUpdate);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1023);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="tournament__container tab-items">
        <div className="tournament__tittle">
          <h2 className="tournament__event-name">{fullData.eventName}</h2>
          <h3 className="tournament__final-name">{fullData.results.classes[raceClass].name}</h3>
          {/* <DirectionSwitcher /> */}
        </div>
        {tournamentTypeInfo.finalType == "double16" &&
          (isMobile ? <VerticalTable channelsAndColors={channelsAndColors} raceData={raceInfo} /> : <HorizontalTable channelsAndColors={channelsAndColors} raceData={raceInfo} />)}

        {tournamentTypeInfo.finalType == "quals" && <Quals channelsAndColors={channelsAndColors} qualsInfo={qualsInfo} qualsLeaderboard={qualsLeaderboard} />}
      </div>
    </>
  );
}
export default Tournament;
