import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import QualsResults from "./QualsResults";
import QualsTable from "./QualsTable";
import QualsTableVertical from "./QualsTableVertical";
import { getState } from "../../../js/sharedStates";

function Quals({ bracketData, leaderboardData, config, getPilotId, activePilotId, isMobile }) {
  const [activeTab, setActiveTab] = useState("");

  const getUrlParams = () => new URLSearchParams(window.location.search);

  useEffect(() => {
    const params = getUrlParams();
    const tabFromUrl = params.get("bracket") || "table";
    setActiveTab(tabFromUrl);
  }, []);

  const tabSwitch = (e) => {
    const tabToOpen = e.target.name;
    setActiveTab(tabToOpen);
    const params = getUrlParams();
    params.set("bracket", tabToOpen);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, "", newUrl);
  };

  const tabVariants = {
    initial: { y: 10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 10, opacity: 0 },
  };

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

      <div className="tournament__tab-anim-wrapper">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={activeTab} variants={tabVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.22, ease: "easeInOut" }} className="tournament__tab-anim-item">
            {activeTab == "table" &&
              (isMobile ? (
                <QualsTableVertical getPilotId={getPilotId} activePilotId={activePilotId} bracketData={bracketData} config={config} />
              ) : (
                <QualsTable getPilotId={getPilotId} activePilotId={activePilotId} bracketData={bracketData} config={config} />
              ))}
            {activeTab == "results" && <QualsResults getPilotId={getPilotId} activePilotId={activePilotId} leaderboardData={leaderboardData} config={config} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

export default Quals;
