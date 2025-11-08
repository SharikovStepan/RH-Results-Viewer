import { useEffect, useState } from "react";
import QualsResults from "./QualsResults";
import QualsTable from "./QualsTable";

function Quals({ qualsInfo, qualsLeaderboard, channelsAndColors }) {
  const [activeTab, setActiveTab] = useState("");

  const getUrlParams = () => {
    return new URLSearchParams(window.location.search);
  };

  useEffect(() => {
    const params = getUrlParams();
    const tabFromUrl = params.get("quals") || "quals"
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

      {activeTab == "quals" && <QualsTable channelsAndColors={channelsAndColors} qualsInfo={qualsInfo} />}
      {activeTab == "qualsResults" && <QualsResults qualsLeaderboard={qualsLeaderboard} />}
    </>
  );
}
export default Quals;
