import { getMinutesSinceUpload } from "./utils";
import { getState, setState, getTab } from "./sharedStates";
import { getLiveData } from "./loadData";
import { newLiveDataHTML, makeRaceClassButtons } from "./htmlWriters.jsx";
import { tabSwitch, startFileView } from "./uiChange";

let _titleTimer = null;

export function tittleCounter(eventName) {
  const titleEl = document.querySelector(".main-tittle__display-name");
  const dateEl = document.querySelector(".main-tittle__date");
  const timeEl = document.querySelector(".main-tittle__time");
  if (!titleEl || !dateEl || !timeEl) return;

  titleEl.innerHTML = eventName;
  dateEl.innerHTML = "-";
  timeEl.innerHTML = "-";

  clearInterval(_titleTimer);
  _titleTimer = setInterval(() => {
    dateEl.innerHTML = getMinutesSinceUpload("minutes", getState("liveTimestamp"));
    timeEl.innerHTML = getMinutesSinceUpload("seconds", getState("liveTimestamp"));
  }, 1000);
}

export function checkLiveData() {
  clearTimeout(getState("checkLiveDataTimeout"));

  const timeout = setTimeout(async () => {
    try {
      const response = await fetch("/api/loadFiles");
      if (!response.ok) throw new Error(`ошибка загрузки fileList: ${response.statusText}`);
      const responseData = await response.json();

      const currentFile = responseData.files.find((fileInfo) => fileInfo.uuid == getState("isUuid"));

      // файл пропал — не падаем, просто продолжаем опрос
      if (!currentFile) {
        checkLiveData();
        return;
      }

      if (getState("liveTimestamp") != currentFile.meta.lastUpdate && getState("newLiveData") == false) {
        setState("newLiveData", true);
      }

      if (getState("newLiveData")) {
        const tournamentTab = document.getElementById("tournamentTab");
        const isTournamentTabOpened = tournamentTab?.classList.contains("_active");

        if (!isTournamentTabOpened) {
          const updateLiveDataButton = newLiveDataHTML();
          document.querySelector(".main").prepend(updateLiveDataButton);
          updateLiveDataButton.addEventListener("click", () => refreshData(false).catch(console.error), { once: true });
        } else {
          await refreshData(true); // ← await + try/catch снаружи
        }
      } else {
        checkLiveData();
      }
    } catch (e) {
      console.error("checkLiveData error:", e);
      checkLiveData(); // ← перезапускаем цикл даже при ошибке
    }
  }, 6660);

  setState("checkLiveDataTimeout", timeout);
}

// export function checkLiveData() {
//   clearTimeout(getState("checkLiveDataTimeout"));

//   const timeout = setTimeout(async () => {
//     //Раньше запрашивали весь файл
//     //  const newData = await getLiveData(getState("isUuid"));
//     //  console.log("CHECK DATA");

//     //теперь запрашиваем список и ищем по uuid наш файл и там lastUpdate (экономия трафика)
//     const response = await fetch("/api/loadFiles");

//     if (!response.ok) throw new Error(`ошибка загрузки fileList: ${response.statusText}`);
//     const responseData = await response.json();

//     const currentFile = responseData.files.find((fileInfo) => fileInfo.uuid == getState("isUuid"));

//     //  console.log("currentFilecurrentFile,", currentFile.meta.lastUpdate);

//     if (getState("liveTimestamp") != currentFile.meta.lastUpdate && getState("newLiveData") == false) {
//       setState("newLiveData", true);
//     }
//     if (getState("newLiveData")) {
//       const tournamentTab = document.getElementById("tournamentTab");
//       const isTournamentTabOpened = tournamentTab?.classList.contains("_active");

//       if (!isTournamentTabOpened) {
//         const updateLiveDataButton = newLiveDataHTML();
//         document.querySelector(".main").prepend(updateLiveDataButton);
//         updateLiveDataButton.addEventListener("click", () => refreshData(false), { once: true });
//       } else {
//         refreshData(true);
//       }
//       console.log("ТАЙМЕР");
//     } else {
//       checkLiveData();
//     }
//   }, 6660);

//   setState("checkLiveDataTimeout", timeout);
// }

async function refreshData(isTournament) {
  const updateButton = document.querySelector(".new-live-data-button");

  // мгновенная визуальная реакция на клик
  if (updateButton) {
    updateButton.classList.add("_no-event");
    updateButton.textContent = "Обновление...";
  }

  try {
    const freshData = await getLiveData(getState("isUuid"));

    setState("mainObj", freshData.results);
    setState("liveTimestamp", freshData.lastUpdate);
    setState("fullRHData", freshData);

    if (freshData.tournamentData) {
      const raceClassesWithFinals = Object.keys(freshData.tournamentData);
      setState("raceClassesWithFinals", raceClassesWithFinals || []);
    }

    makeRaceClassButtons();
    if (isTournament == false) {
      tabSwitch("closeAll", getTab("main"));
    }

    // удаляем html
    setTimeout(() => {
      document.querySelector(".pilots")?.remove();
      document.querySelector(".leaderboard")?.remove();
      document.querySelector(".rounds")?.remove();
    }, 50);

    // добавляем html
    setTimeout(() => {
      startFileView("classSwitch");
    }, 150);

    setState("newLiveData", false);
  } catch (e) {
    console.error("refreshData error:", e);
    // не сбрасываем newLiveData — пусть пользователь попробует ещё раз
  } finally {
    // кнопку убираем и цикл перезапускаем В ЛЮБОМ СЛУЧАЕ
    updateButton?.remove();
    checkLiveData();
  }
}

// async function refreshData(isTournament) {
//   const updateButton = document.querySelector(".new-live-data-button");
//   updateButton?.classList.add("_no-event");

//   if (updateButton) {
//     updateButton.textContent = "Обновление";
//   }

//   //при клике на кнопку нужно получить самые свежие данные, поэтому просим их ещё раз
//   const freshData = await getLiveData(getState("isUuid"));
//   setState("mainObj", freshData.results);
//   setState("liveTimestamp", freshData.lastUpdate);
//   setState("fullRHData", freshData);

//   if (freshData.tournamentData) {
//     const raceClassesWithFinals = Object.keys(freshData.tournamentData);
//     setState("raceClassesWithFinals", raceClassesWithFinals || []);
//   }

//   //получаем новые кнопки классов и выбиравем последнюю
//   makeRaceClassButtons();
//   if (isTournament == false) {
//     tabSwitch("closeAll", getTab("main"));
//   }

//   //удаляем html
//   setTimeout(() => {
//     const pilotsTab = document.querySelector(".pilots");
//     const leaderboardTab = document.querySelector(".leaderboard");
//     const roundsTab = document.querySelector(".rounds");
//     pilotsTab?.remove();
//     leaderboardTab?.remove();
//     roundsTab?.remove();
//   }, 50);

//   //добавляем html
//   setTimeout(() => {
//     startFileView("classSwitch");
//   }, 150);
//   setState("newLiveData", false);

//   //удаляем кнопку и включаем функцию ещё раз
//   updateButton?.remove();

//   checkLiveData();
// }
