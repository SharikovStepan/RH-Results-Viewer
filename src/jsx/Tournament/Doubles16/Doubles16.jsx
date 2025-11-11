import { useEffect, useState } from "react";
import Doubles16TableHorizontal from "./Doubles16TableHorizontal";
import Doubles16TableVertical from "./Doubles16TableVertical";

function Doubles16({ raceData, qualsLeaderboard, channelsAndColors }) {
  const [activeTab, setActiveTab] = useState("");
  const [activePilotId, setActivePilotId] = useState(null);

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
    const id = e.target.closest(".doubles16__pilot-name ").getAttribute("pilot-id");

    if (id == activePilotId) {
      setActivePilotId(null);
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
          Таблица
        </button>
        <button name="results" onClick={tabSwitch} className={`tournament__button _button ${activeTab == "results" ? "_active _no-event" : ""}`}>
          Результаты
        </button>
      </div>

      {activeTab == "table" &&
        (isMobile ? <Doubles16TableVertical channelsAndColors={channelsAndColors} raceData={raceData} /> : <Doubles16TableHorizontal channelsAndColors={channelsAndColors} raceData={raceData} />)}
      {/* {activeTab == "results" && <Doubles16Results activePilotId={activePilotId} Doubles16Leaderboard={Doubles16Leaderboard} />} */}
    </>
  );
}
export default Doubles16;
