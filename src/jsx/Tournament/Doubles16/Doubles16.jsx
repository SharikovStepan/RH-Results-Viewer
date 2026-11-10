import { useEffect, useState } from "react";
import Doubles16TableHorizontal from "./Doubles16TableHorizontal";
import Doubles16TableVertical from "./Doubles16TableVertical";
import Doubles16Results from "./Doubles16Results";
import { getState } from "../../../js/sharedStates";
function Doubles16({ bracketData, leaderboardData, config, getPilotId, activePilotId, isMobile }) {
  const [activeTab, setActiveTab] = useState("");

  //   const [isMobile, setIsMobile] = useState(window.innerWidth <= 1023);

  const getUrlParams = () => {
    return new URLSearchParams(window.location.search);
  };

  useEffect(() => {
    const params = getUrlParams();
    const tabFromUrl = params.get("doubles16") || "table";
    setActiveTab(tabFromUrl);
  }, []);

  const tabSwitch = (e) => {
    const tabToOpen = e.target.name;
    setActiveTab(tabToOpen);

    const params = getUrlParams();
    params.set("doubles16", tabToOpen);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  //   useEffect(() => {
  //     const handleResize = () => {
  //       setIsMobile(window.innerWidth <= 1023);
  //     };
  //     window.addEventListener("resize", handleResize);
  //     return () => window.removeEventListener("resize", handleResize);
  //   }, []);

  return (
    <>
      <div className="tournament__buttons _buttons-wrapper">
        <button name="table" onClick={tabSwitch} className={`tournament__button _button ${activeTab == "table" ? "_active _no-event" : ""}`}>
          {getState("textStrings").tournamentTab.table}
        </button>
        <button name="results" onClick={tabSwitch} className={`tournament__button _button ${activeTab == "results" ? "_active _no-event" : ""}`}>
          {getState("textStrings").tournamentTab.results}
        </button>
      </div>

      {activeTab == "table" &&
        (isMobile ? (
          <Doubles16TableVertical activePilotId={activePilotId} bracketData={bracketData} config={config} getPilotId={getPilotId} />
        ) : (
          <Doubles16TableHorizontal activePilotId={activePilotId} bracketData={bracketData} config={config} getPilotId={getPilotId} />
        ))}
      {activeTab == "results" && <Doubles16Results activePilotId={activePilotId} leaderboardData={leaderboardData} config={config} getPilotId={getPilotId} />}
    </>
  );
}
export default Doubles16;

export function getStatusText(raceStatus, progressStatus) {
  if (progressStatus == "current") {
    switch (raceStatus) {
      case "lastComplete":
        return getState("textStrings").tournamentTab.completed;
      case "inProgress":
        return getState("textStrings").tournamentTab.now;
      case "calculated":
        return getState("textStrings").tournamentTab.now;
      case "planned":
        return getState("textStrings").tournamentTab.now;
      case "complete":
        return "";

      case "empty":
        return "";

      default:
        return "";
    }
  } else if (progressStatus == "next") {
    return getState("textStrings").tournamentTab.next;
  }
}

export function getGlowClassnameByRaceStatus(raceStatus, calcMismatch) {
  let errorClassName = "";

  if (calcMismatch) errorClassName = " _wrong";
  switch (raceStatus) {
    case "lastComplete":
      return "_last-complete" + errorClassName;

    case "calculated":
      return "" + errorClassName;

    case "complete":
      return "" + errorClassName;

    case "empty":
      return "" + errorClassName;

    case "inProgress":
      return "" + errorClassName;

    case "planned":
      return "" + errorClassName;

    default:
      return "";
  }
}

export function getGlowClassnameByProgressStatus(progressStatus) {
  switch (progressStatus) {
    case "current":
      return "_current";
    case "next":
      return "_next";
    default:
      return "";
  }
}
