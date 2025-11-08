import { useEffect, useState } from "react";

import QualsResults from "./QualsResults";
import QualsTable from "./QualsTable";

function Quals({ qualsInfo, qualsLeaderboard, channelsAndColors }) {
  const [activeTab, setActiveTab] = useState("");
  const [activePilotId, setActivePilotId] = useState(null);
  const getUrlParams = () => {
    return new URLSearchParams(window.location.search);
  };

  useEffect(() => {
    const params = getUrlParams();
    const tabFromUrl = params.get("quals") || "quals";
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

  const getPilotId = (e) => {
    const id = e.target.closest(".quals__pilot-name ").getAttribute("pilot-id");
    console.log("iD ", id);

    if (id == activePilotId) {
      setActivePilotId(null);
    } else {
      setActivePilotId(id);
    }
  };

  return (
    <>
      <div className="quals__buttons _buttons-wrapper">
        <button name="quals" onClick={tabSwitch} className={`quals__button _button ${activeTab == "quals" ? "_active _no-event" : ""}`}>
          Квалификация
        </button>
        <button name="qualsResults" onClick={tabSwitch} className={`quals__button _button ${activeTab == "qualsResults" ? "_active _no-event" : ""}`}>
          Результаты
        </button>
      </div>
      {activeTab == "quals" && <QualsTable getPilotId={getPilotId} activePilotId={activePilotId} channelsAndColors={channelsAndColors} qualsInfo={qualsInfo} />}
      {activeTab == "qualsResults" && <QualsResults activePilotId={activePilotId} qualsLeaderboard={qualsLeaderboard} />}
    </>
  );
}
export default Quals;
