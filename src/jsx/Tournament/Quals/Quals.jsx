import { useEffect, useState } from "react";

import QualsResults from "./QualsResults";
import QualsTable from "./QualsTable";
import { getState } from "../../../js/sharedStates";
import QualsTableVertical from "./QualsTableVertical";

function Quals({ bracketData, leaderboardData, config, getPilotId, activePilotId, isMobile }) {
  const [activeTab, setActiveTab] = useState("");
  //   const [activePilotId, setActivePilotId] = useState(null);
  //   console.log("bracketDatabracketData", bracketData);

  const getUrlParams = () => {
    return new URLSearchParams(window.location.search);
  };

  useEffect(() => {
    const params = getUrlParams();
    const tabFromUrl = params.get("quals") || "table";
    setActiveTab(tabFromUrl);
  }, []);

  const tabSwitch = (e) => {
    const tabToOpen = e.target.name;
    setActiveTab(tabToOpen);

    const params = getUrlParams();
    params.set("quals", tabToOpen);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  //   const getPilotId = (e) => {
  //     const id = e.target.closest("._pilot-button")?.getAttribute("pilot-id");

  //     if (id == activePilotId) {
  //       setActivePilotId(null);
  //     } else {
  //       setActivePilotId(id);
  //     }
  //   };

  return (
    <>
      <div className="tournament__buttons _buttons-wrapper">
        <button name="table" onClick={tabSwitch} className={`tournament__button _button ${activeTab == "table" ? "_active _no-event" : ""}`}>
          {getState("textStrings").tournamentTab.quals}
        </button>
        <button name="results" onClick={tabSwitch} className={`tournament__button _button ${activeTab == "results" ? "_active _no-event" : ""}`}>
          {getState("textStrings").tournamentTab.results}
        </button>
      </div>
      {activeTab == "table" &&
        (isMobile ? (
          <QualsTableVertical getPilotId={getPilotId} activePilotId={activePilotId} bracketData={bracketData} config={config} />
        ) : (
          <QualsTable getPilotId={getPilotId} activePilotId={activePilotId} bracketData={bracketData} config={config} />
        ))}
      {activeTab == "results" && <QualsResults getPilotId={getPilotId} activePilotId={activePilotId} leaderboardData={leaderboardData} config={config} />}{" "}
    </>
  );
}
export default Quals;
