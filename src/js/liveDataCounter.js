import { getMinutesSinceUpload } from "./utils";
import { getState, setState, getTab } from "./sharedStates";
import { getLiveData } from "./loadData";
import { newLiveDataHTML, makeRaceClassButtons } from "./htmlWriters.jsx";
import { tabSwitch, startFileView } from "./uiChange";

export function tittleCounter(eventName) {
  document.querySelector(".main-tittle__display-name").innerHTML = eventName;
  document.querySelector(".main-tittle__date").innerHTML = "-";
  document.querySelector(".main-tittle__time").innerHTML = "-";
  const timer1 = setInterval(() => {
    document.querySelector(".main-tittle__date").innerHTML = getMinutesSinceUpload("minutes", getState("liveTimestamp"));
    document.querySelector(".main-tittle__time").innerHTML = getMinutesSinceUpload("seconds", getState("liveTimestamp"));
  }, 1000);
}

export function checkLiveData() {
  setState(
    "checkLiveDataInterval",
    setInterval(async () => {
      const newData = await getLiveData(getState("isUuid"));
      console.log("CHECK DATA");

      if (getState("liveTimestamp") != newData.lastUpdate && getState("newLiveData") == false) {
        setState("newLiveData", true);
      }
      if (getState("newLiveData")) {
        const tournamentTab = document.getElementById("tournamentTab");
        const isTournamentTabOpened = tournamentTab?.classList.contains("_active");

        if (!isTournamentTabOpened) {
          const updateLiveDataButton = newLiveDataHTML();
          document.querySelector(".main").prepend(updateLiveDataButton);
          updateLiveDataButton.addEventListener("click", () => refreshData(false), { once: true });
        } else {
          refreshData(true);
        }

        //очищаем таймер, как только newLiveData true
        clearInterval(getState("checkLiveDataInterval"));
        console.log("ТАЙМЕР");
      }
    }, 10000)
  );
}

async function refreshData(isTournament) {
  const updateButton = document.querySelector(".new-live-data-button");
  updateButton?.classList.add("_no-event");

  //при клике на кнопку нужно получить самые свежие данные, поэтому просим их ещё раз
  const freshData = await getLiveData(getState("isUuid"));
  setState("mainObj", freshData.results);
  setState("liveTimestamp", freshData.lastUpdate);
  setState("fullRHData", freshData);
  setState("finalTypesByClass", freshData.finalTypesByClass);
  const raceClassesWithFinals = freshData.finalTypesByClass.filter((raceClass) => raceClass.finalType != "");
  setState(
    "raceClassesWithFinals",
    raceClassesWithFinals.map((raceClass) => raceClass.raceClassId)
  );

  //Очищаем кнопки классов - вдруг поменялись
  // document.querySelectorAll(".class-switch-buttons__button").forEach((raceClass) => {
  //   raceClass.remove();
  // });

  //получаем новые кнопки классов и выбиравем последнюю
  makeRaceClassButtons();
  if (isTournament == false) {
    tabSwitch("closeAll", getTab("main"));
  }

  //удаляем html
  setTimeout(() => {
    const pilotsTab = document.querySelector(".pilots");
    const leaderboardTab = document.querySelector(".leaderboard");
    const roundsTab = document.querySelector(".rounds");
    pilotsTab?.remove();
    leaderboardTab?.remove();
    roundsTab?.remove();
  }, 50);

  //добавляем html
  setTimeout(() => {
    startFileView("classSwitch");
  }, 150);
  setState("newLiveData", false);

  //удаляем кнопку и включаем функцию ещё раз
  updateButton?.remove();
  const repeatTmr = setTimeout(() => {
    checkLiveData();
    clearTimeout(repeatTmr);
  }, 6660);
}




// updateLiveDataButton.classList.add("_no-event");

// //при клике на кнопку нужно получить самые свежие данные, поэтому просим их ещё раз
// const freshData = await getLiveData(getState("isUuid"));
// setState("mainObj", freshData.results);
// setState("liveTimestamp", freshData.lastUpdate);

// //Очищаем кнопки классов - вдруг поменялись
// document.querySelectorAll(".class-switch-buttons__button").forEach((raceClass) => {
//   raceClass.remove();
// });

// //получаем новые кнопки классов и выбиравем последнюю
// makeRaceClassButtons();
// tabSwitch("closeAll", getTab("main"));

// //удаляем html
// setTimeout(() => {
//   const pilotsTab = document.querySelector(".pilots");
//   const leaderboardTab = document.querySelector(".leaderboard");
//   const roundsTab = document.querySelector(".rounds");
//   pilotsTab.remove();
//   leaderboardTab.remove();
//   roundsTab.remove();
// }, 50);

// //добавляем html
// setTimeout(() => {
//   startFileView("classSwitch");
// }, 150);
// setState("newLiveData", false);

// //удаляем кнопку и включаем функцию ещё раз
// updateLiveDataButton.remove();
// const repeatTmr = setTimeout(() => {
//   checkLiveData();
//   clearTimeout(repeatTmr);
// }, 10000);
// },
// { once: true }
// );
// //очищаем таймер, как только newLiveData true
// clearInterval(getState("checkLiveDataInterval"));
// console.log("ТАЙМЕР");
// }
// }, 10000)
// );