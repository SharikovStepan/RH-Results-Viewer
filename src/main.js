import "./styles/style.scss";
import { getDayFiles } from "./js/getDatas";
import { EN_DICT, RU_DICT } from "./js/consts";
import { addLocalFile, startLocalFile } from "./js/localFileRead";
import { tabSwitch, roundStatsStrokeWidthChange, moveMonth } from "./js/uiChange";
import { loadFilesList, loadLastFile, urlUpload, loadDateFile } from "./js/loadData";
import { setState, getState, getButton, getLocalFileElement, getTab } from "./js/sharedStates";
import { averageTime, timeDiff } from "./js/utils";

////////////////////////////////////////////

const checkPauses = false;

if (window.matchMedia("((hover: none) and (pointer: coarse))").matches) {
  //Анимация кнопок на тач экранах
  document.addEventListener("click", function (event) {
    if (event.target.closest("button")) {
      event.target.classList.add("_active-animation");
      setTimeout(() => {
        event.target.classList.remove("_active-animation"); ///
      }, 100);
    }
  });
}

////////////////////////////////////////////
setState("language", document.querySelector("html").getAttribute("lang"));

setState("textStrings", getState("language") == "ru" ? RU_DICT : getState("language") == "en" && EN_DICT);

setState("isUuid", new URLSearchParams(window.location.search).get("uuid"));
// setState("isEvent", new URLSearchParams(window.location.search).get("event"));

if (getState("isUuid")) {
  loadFilesList(false);
  urlUpload("uuid");
} else {
  document.querySelector(".main").classList.remove("_hide");
  document.querySelector(".wrapper").classList.remove("_hide");
  loadFilesList(true);
}

///////////////////////////////////
document.querySelector(".calendar__prev-month").addEventListener("click", () => moveMonth("right", "left"));
document.querySelector(".calendar__next-month").addEventListener("click", () => moveMonth("left", "right"));

document.querySelector(".calendar__days").addEventListener("click", function (e) {
  const day = e.target.closest(".calendar__day");
  if (e.target == day && day.classList.contains("_day__file")) {
    getLocalFileElement("tittle").classList.add("_hidden");
    getLocalFileElement("label").classList.add("_hidden");
    const dateStr = e.target.id;
    getDayFiles(dateStr);
    e.target.classList.add("_active");
  }
});

document.querySelector(".date-files__items").addEventListener("click", function (e) {
  if (e.target.closest(".file__item")) {
    const fileItemElement = e.target.closest(".file__item");

    const fileName = fileItemElement.id;
    const dateFileElements = document.querySelectorAll(".file__item");

    dateFileElements.forEach((elem) => {
      if (elem != fileItemElement) {
        elem.classList.add("_hidden", "_no-event");
      }
    });

    fileItemElement.classList.add("_active", "_uploading-file");
    loadDateFile(fileName);
  }
});

//////////////////////////////////////////
document.querySelector(".last-file__item").addEventListener("click", function () {
  document.querySelector(".last-file__item").classList.add("_active");
  loadLastFile();
});

getLocalFileElement("input").addEventListener("change", addLocalFile);
getLocalFileElement("form").addEventListener("submit", startLocalFile);

//////////////////////////////////////////
getButton("pilots").addEventListener("click", function () {
  tabSwitch(getTab("main")[0].name, getTab("main"), "main");
});

getButton("leaderboard").addEventListener("click", function () {
  tabSwitch(getTab("main")[1].name, getTab("main"), "main");
});

getButton("rounds").addEventListener("click", function () {
  tabSwitch(getTab("main")[2].name, getTab("main"), "main");

  if (checkPauses) {
    const heatsNums = getState("mainObj")["heats_by_class"][getState("currentClass")];

    //  const heatsNums = [1, 2, 3, 4];

    const heatsData = heatsNums
      .map((heatNum) => {
        const heatFromResults = getState("mainObj")["heats"][heatNum];
        if (heatFromResults) {
          return heatFromResults;
        } else {
          return {};
        }
      })
      .filter((heatData) => heatData.heat_id);

    const roundsQuals = [];
    let roundId = 1;
    const circles = 5; //колличество кругов всех групп
    for (let i = 1; i <= circles; i++) {
      const roundsHeat = heatsData.map((heat) => {
        const roundsInHeat = heat.rounds;

        const filtered = roundsInHeat.filter((round) => round.id == roundId || round.id == roundId + 1); //Количество раундов вылете - 2
        return filtered;
      });
      roundsQuals.push(...roundsHeat);
      roundId = roundId + 2;
    }
    console.log("roundsQuals", roundsQuals);

    const timesBetweenRounds = [];
    roundsQuals.forEach((rounds) => {
      const roundsTimeStarts = rounds.map((round) => {
        console.log("roundround", round);

        return { heatId: round.heatId, heatName: round.heatName, roundId: `${round.id}`, timeStart: round.start_time_formatted.split(" ")[1] };
      });
      console.log("roundsTimeStartsroundsTimeStarts", roundsTimeStarts);

      const heatId = roundsTimeStarts[0].heatId;
      const heatName = roundsTimeStarts[0].heatName;
      const roundsId = `${roundsTimeStarts[0].roundId} - ${roundsTimeStarts[1].roundId}`;
      const prevRound = roundsTimeStarts[0].timeStart;
      const nextRound = roundsTimeStarts[1].timeStart;
      const diff = timeDiff(prevRound, nextRound, 1, 45);
      timesBetweenRounds.push({ heatId, heatName, roundsId, diff, prevRound, nextRound });
    });

    const sortedRoundsTime = timesBetweenRounds.sort((a, b) => +a.heatId - +b.heatId);
    console.log("timesBetweenRounds", sortedRoundsTime);
    const diffsRound = [];

    sortedRoundsTime.forEach((round) => {
      if (diffsRound.length == 0) {
        diffsRound.push({ heatId: round.heatId, heatName: round.heatName, diffs: [round.diff] });
      } else if (diffsRound.length > 0 && diffsRound[diffsRound.length - 1].heatId == round.heatId) {
        diffsRound[diffsRound.length - 1].diffs.push(round.diff);
      } else {
        diffsRound.push({ heatId: round.heatId, heatName: round.heatName, diffs: [round.diff] });
      }
    });
    const avgTimesRound = diffsRound.map((heat) => {
      const avg = averageTime(heat.diffs);
      return { heatName: heat.heatName, AVG: avg };
    });

    console.log("avgTimesRound", avgTimesRound);

    const avgTimesRoundsArr = avgTimesRound.map((time) => time.AVG);
    const fullAvgTimesRounds = averageTime(avgTimesRoundsArr);

    console.log("fullAvgTimesRounds", fullAvgTimesRounds);

    const timesBetweenHeats = [];
    roundsQuals.forEach((heat, index) => {
      const lastRoundTime = heat[1].start_time_formatted.split(" ")[1];
      const nextIndex = index + 1 == roundsQuals.length ? roundsQuals.length - 1 : index + 1;

      const firstRoundsNextStart = roundsQuals[nextIndex][0].start_time_formatted.split(" ")[1];

      timesBetweenHeats.push({
        heats: `${heat[0].heatName} - ${roundsQuals[nextIndex][0].heatName}`,
        diff: timeDiff(lastRoundTime, firstRoundsNextStart, 1, 45),
        prev: lastRoundTime,
        next: firstRoundsNextStart,
      });
    });

    console.log(timesBetweenHeats);
    const diffsHeats = timesBetweenHeats.map((diff) => diff.diff);
    const avgTimesHeats = averageTime(diffsHeats);
    console.log("СРЕДНЕЕ", avgTimesHeats);
  }
});

window.addEventListener("resize", function () {
  roundStatsStrokeWidthChange();
});
