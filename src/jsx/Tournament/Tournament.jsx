import React, { useState, useEffect } from "react";

import { getState, getTab, subscribe, unsubscribe } from "../../js/sharedStates";

import {
  getResultRaces,
  setDuelPlaces,
  setRaceScores,
  setRaceStatus,
  getPlannedRaces,
  addEmptyRaces,
  getChannelsAndColors,
  getRoundsPauses,
  getRacesPauses,
  getRacesTime,
  addRaceNumbers,
  checkDeletedResults,
  checkGroupForEmpty,
} from "./utils";
import { tabSwitch } from "../../js/uiChange";
import { getParamTabIndex } from "../../js/utils";
import { COLORS, QUALS_QUANTITY } from "./const";
import Quals from "./Quals/Quals";
import Doubles16 from "./Doubles16/Doubles16";
import { PLACE_TABLE_RACES } from "./Doubles16/const";
import { useIsMobile } from "./isMobile";

const checkPauses = false;

function Tournament({ fullRHData, currentClass }) {
  const [fullData, setFullData] = useState(fullRHData);
  const [raceClass, setRaceClass] = useState(currentClass);
  const [activePilotId, setActivePilotId] = useState("-");

  const isMobile = useIsMobile();

  const tournamnetData = fullData.tournamentData[raceClass];

  const config = tournamnetData.raceTypeConfig;
  const raceType = config.raceType;

  const bracketsData = tournamnetData.dataResults.bracket;
  const leaderboardData = tournamnetData.dataResults.leaderboard;

  if (checkPauses) {
    getRacesPauses(allRaces);
    getRoundsPauses(allRaces);
    getRacesTime(allRaces);
  }

  const getPilotId = (e) => {
    const id = e.target.closest("._pilot-button")?.getAttribute("pilot-id");

    if (id == activePilotId) {
      setActivePilotId("-");
    } else {
      setActivePilotId(id);
    }
  };

  useEffect(() => {
    console.log("activePilotId", activePilotId);
  }, [activePilotId]);
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

  return (
    <>
      <div className="tournament__container tab-items">
        {/* <div className="tournament__tittle">
          <h2 className="tournament__event-name">{fullData.eventName}</h2>
          <h3 className="tournament__final-name">{fullData.results.classes[raceClass].name}</h3>
        </div> */}
        {raceType == "double16" && <Doubles16 bracketData={bracketsData} leaderboardData={leaderboardData} config={config} getPilotId={getPilotId} activePilotId={activePilotId} isMobile={isMobile} />}

        {raceType == "quals" && <Quals bracketData={bracketsData} leaderboardData={leaderboardData} config={config} getPilotId={getPilotId} activePilotId={activePilotId} isMobile={isMobile} />}
      </div>
    </>
  );
}
export default Tournament;
