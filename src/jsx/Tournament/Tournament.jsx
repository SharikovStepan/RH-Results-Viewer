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

const checkPauses = false;

function Tournament({ fullRHData, currentClass }) {
  const [fullData, setFullData] = useState(fullRHData);
  const [raceClass, setRaceClass] = useState(currentClass);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1023);

  const [activeTabId, setActiveTabId] = useState(1);

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

  console.log("allSlotsallSlots", allSlots);

  const heatsNum = getState("mainObj")["heats_by_class"][raceClass];
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

  //   const heatsData = Object.entries(results["heats"])
  //     .filter(([key]) => heatsNumSorted.includes(+key))
  //     .map(([, value]) => value);

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

  //Здесь собираем все раунды
  const rounds = heatsData
    .map((heat) => {
      if (deletedRoundsInHeats.length > 0) {
        const deletedRoundsInHeat = deletedRoundsInHeats.find((data) => data.heatId == heat.heat_id)?.deletedRoundNum || [];
        const filteredRounds = heat.rounds.filter((round) => !deletedRoundsInHeat.includes(round.id));
        return filteredRounds;
      } else {
        return heat.rounds;
      }
    })
    .flat();

  //собираем массив всех выполненных гонок
  const races = getResultRaces(rounds, allSlots);

  //Ставим баллы за дуэли, если они есть
  const raceWithDuels = setDuelPlaces(races, raceQuantity, roundsQuantity, finalRoundsQuantity);

  //Здесь счет каждой гонки, уже не раунда
  const racesWithScore = setRaceScores(raceWithDuels);

  //ставим статус complete и проверяем последнюю гонку, complete она или нет
  const racesWithStatus = setRaceStatus(racesWithScore, raceQuantity, roundsQuantity, finalRoundsQuantity);

  //собираем массив предстоящих гонок
  const plannedRaces = getPlannedRaces(noResultsHeats, roundsQuantity, pilotsPerHeat);

  //соединяем два массива Results и noResults
  const allKnownRaces = [...racesWithStatus, ...plannedRaces];

  //делаем массив всех гонок(+пусые)
  const allRaces = allKnownRaces.length == raceQuantity ? allKnownRaces : addEmptyRaces(allKnownRaces, raceQuantity, pilotsPerHeat);

  if (checkPauses) {
    getRacesPauses(allRaces);
    getRoundsPauses(allRaces);
    getRacesTime(allRaces);
  }

  console.log("heatsheats", heatsData);
  console.log("roundsrounds", rounds);
  console.log("races", races);
  console.log("racesWithScore", racesWithScore);
  console.log("ALLLLRACESSS", allRaces);

  const getButton = (e) => {
    const currentId = e.target.id;
    setActiveTabId(+currentId);
    console.log("activeTabIdactiveTabId", e.target.id);
  };

  useEffect(() => {
    const handleUpdate = (value) => {
      setFullData(value);
    };
    const raceClassUpdate = (value) => {
      setRaceClass(value);
    };
    console.log("SUBSCRIBE");

    subscribe("fullRHData", handleUpdate);
    subscribe("currentClass", raceClassUpdate);

    const mainTabParam = getParamTabIndex("main");

    if (mainTabParam == 3) tabSwitch(getTab("main")[mainTabParam].name, getTab("main"), "main", true);

    return () => {
      unsubscribe("fullRHData", handleUpdate);
      unsubscribe("currentClass", raceClassUpdate);
      console.log("UNNNNNNNSUBSCRIBE");
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
          <DirectionSwitcher />
        </div>

        {isMobile ? <VerticalTable channelsAndColors={channelsAndColors} raceData={allRaces} /> : <HorizontalTable channelsAndColors={channelsAndColors} raceData={allRaces} />}
      </div>
    </>
  );
}
export default Tournament;
