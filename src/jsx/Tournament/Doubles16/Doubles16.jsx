import { useEffect, useState } from "react";
import Doubles16TableHorizontal from "./Doubles16TableHorizontal";
import Doubles16TableVertical from "./Doubles16TableVertical";
import Doubles16Results from "./Doubles16Results";
import { getState } from "../../../js/sharedStates";
function Doubles16({ raceData }) {
  const [activeTab, setActiveTab] = useState("");
  const [activePilotId, setActivePilotId] = useState("-");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1023);

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

  const getPilotId = (e) => {
    const id = e.target.closest("._pilot-button")?.getAttribute("pilot-id");

    if (id == activePilotId) {
      setActivePilotId("-");
    } else {
      setActivePilotId(id);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1023);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
          <Doubles16TableVertical activePilotId={activePilotId} raceData={raceData} getPilotId={getPilotId} />
        ) : (
          <Doubles16TableHorizontal activePilotId={activePilotId} raceData={raceData} getPilotId={getPilotId} />
        ))}
      {activeTab == "results" && <Doubles16Results activePilotId={activePilotId}  raceData={raceData} getPilotId={getPilotId} />}
    </>
  );
}
export default Doubles16;
