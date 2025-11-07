import { useState } from "react";
import QualsResults from "./QualsResults";
import QualsTable from "./QualsTable";

function Quals({ qualsInfo, qualsLeaderboard, channelsAndColors }) {
  const [activeTab, setActiveTab] = useState("quals");

  const tabSwitch = (e) => {
    const tabToOpen = e.target.name;
    setActiveTab(tabToOpen);
  };

  return (
    <>
      <div className="quals__buttons _buttons-wrapper">
        <button name="quals"  onClick={tabSwitch} className={`quals__button _button ${activeTab == "quals" ? "_active _no-event" : ""}`}>
          Квалификация
        </button>
        <button name="qualsResults" onClick={tabSwitch} className={`quals__button _button ${activeTab == "qualsResults" ? "_active _no-event" : ""}`}>
          Результаты
        </button>
      </div>

      {activeTab == "quals" && <QualsTable channelsAndColors={channelsAndColors} qualsLeaderboard={qualsLeaderboard} qualsInfo={qualsInfo} />}
      {activeTab == "qualsResults" && <QualsResults qualsLeaderboard={qualsLeaderboard} />}
    </>
  );
}
export default Quals;
