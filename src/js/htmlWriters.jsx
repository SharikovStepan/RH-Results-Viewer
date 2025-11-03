import { getLapsByName, getConsecutivesByName, getRound, getPilotsStats, getRoundsByHeats } from "./getDatas.js";
import { lapTimeConverter, arraysEqual, updateUrl } from "./utils.js";
import { lapNodeShow, classSwitch, tabSwitch } from "./uiChange.jsx";
import { getState, setAkcent, setState, setTab, getTab, addButton, getButton, getLocalFileElement, unsubscribe } from "./sharedStates.js";

import React from "react";
import { createRoot } from "react-dom/client";

import Tournament from "../jsx/Tournament/Tournament.jsx";

export function writePilotsHTML() {
  // Рисуем страницу пилотов
  const pilots = {
    pilots: document.createElement("div"),
    container: document.createElement("div"),
    items: document.createElement("div"),
  };
  pilots.pilots.classList.add("pilots", "tab");
  pilots.container.classList.add("pilots__container", "_container", "tab-items");
  pilots.items.classList.add("pilots__items");

  pilots.pilots.append(pilots.container);
  pilots.container.append(pilots.items);

  const pilotsData = getPilotsStats(); //получаем список пилотов

  pilotsData.sort((a, b) => (a.name > b.name ? 1 : -1)); //сортируем по алфавиту

  for (let pilot of pilotsData) {
    //рисуем элемент каждого пилота
    if (pilot.laps) {
      const lapsToShow = 5; //Сколько кругов показывать;
      const unableRound = "-";
      const unableDate = "--:--:--";
      const unableTime = "-:--.---";

      const item = {
        container: document.createElement("div"),
        pilotName: document.createElement("button"),
        stats: document.createElement("div"),

        bestlap: document.createElement("div"),
        bestLapText: document.createElement("div"),
        bestLapButton: document.createElement("button"),
        bestLapMainTime: document.createElement("button"),

        bestLapItems: document.createElement("div"),

        bestLapTittles: document.createElement("div"),
        bestLapTittlesRound: document.createElement("div"),
        bestLapTittlesStart: document.createElement("div"),
        bestLapTittlesEnd: document.createElement("div"),
        bestLapTittlesTime: document.createElement("div"),

        bestLapItem: document.createElement("div"),
        bestLapItemRound: document.createElement("div"),
        bestLapItemStart: document.createElement("div"),
        bestLapItemEnd: document.createElement("div"),
        bestLapItemTime: document.createElement("button"),

        bestConsecutives: document.createElement("div"),
        bestConsecutivesText: document.createElement("div"),
        bestConsecutivesButton: document.createElement("button"),
        bestConsecutivesMainTime: document.createElement("button"),
        bestConsecutivesItems: document.createElement("div"),

        bestConsecutivesTittles: document.createElement("div"),
        bestConsecutivesTittlesRound: document.createElement("div"),
        bestConsecutivesTittlesStart: document.createElement("div"),
        bestConsecutivesTittlesEnd: document.createElement("div"),
        bestConsecutivesTittlesTime: document.createElement("div"),

        bestConsecutivesItem: document.createElement("div"),
        bestConsecutivesItemRound: document.createElement("div"),
        bestConsecutivesItemStart: document.createElement("div"),
        bestConsecutivesItemEnd: document.createElement("div"),
        bestConsecutivesItemTime: document.createElement("button"),

        quantityLap: document.createElement("div"),
        quantityLapText: document.createElement("div"),
        quantityLapValue: document.createElement("div"),
        quantityStarts: document.createElement("div"),
        quantityStartsText: document.createElement("div"),
        quantityStartsValue: document.createElement("div"),
        averageLap: document.createElement("div"),
        averageLapText: document.createElement("div"),
        averageLapValue: document.createElement("div"),
        // lap: document.createElement('div'),
        // lapText: document.createElement('div'),
        // lapValue: document.createElement('div'),
        // consecutive: document.createElement('div'),
        // consecutiveText: document.createElement('div'),
        // consecutiveValue: document.createElement('div'),

        allLapsButton: document.createElement("button"),
      };
      item.container.classList.add("pilots__item");
      item.pilotName.classList.add("pilots__pilot-name", "_button");
      item.stats.classList.add("pilots__stats");

      item.bestlap.classList.add("pilots__best-lap");
      item.bestLapText.classList.add("pilots__best-lap-text", "_stat-text");
      item.bestLapButton.classList.add("pilots__best-lap-button", "_button-spoiler");
      item.bestLapMainTime.classList.add("pilots__best-lap-time-value", "_button-time", "_main-time");

      item.bestLapItems.classList.add("pilots__best-lap-items");

      item.bestLapTittles.classList.add("pilots__best-lap-stats-tittles", "stats-tittles");
      item.bestLapTittlesRound.classList.add("pilots__best-lap-round-text", "_stat-text");
      item.bestLapTittlesStart.classList.add("pilots__best-lap-start-text", "_stat-text");
      item.bestLapTittlesEnd.classList.add("pilots__best-lap-end-text", "_stat-text");
      item.bestLapTittlesTime.classList.add("pilots__best-lap-time-text", "_stat-text");

      item.bestLapItem.classList.add("pilots__best-lap-item", "_stat-item");
      item.bestLapItemRound.classList.add("pilots__best-lap-round-value", "_stat-value");
      item.bestLapItemStart.classList.add("pilots__best-lap-start-value", "_stat-value");
      item.bestLapItemEnd.classList.add("pilots__best-lap-end-value", "_stat-value");
      item.bestLapItemTime.classList.add("pilots__best-lap-time-value", "_button-time");

      item.bestConsecutives.classList.add("pilots__best-consecutives");
      item.bestConsecutivesText.classList.add("pilots__best-consecutives-text", "_stat-text");
      item.bestConsecutivesButton.classList.add("pilots__best-consecutives-button", "_button-spoiler");
      item.bestConsecutivesMainTime.classList.add("pilots__best-consecutives-time-value", "_button-time", "_main-time");
      item.bestConsecutivesItems.classList.add("pilots__best-consecutives-items");

      item.bestConsecutivesTittles.classList.add("pilots__best-consecutives-stats-tittles", "stats-tittles");
      item.bestConsecutivesTittlesRound.classList.add("pilots__best-consecutives-round-text", "_stat-text");
      item.bestConsecutivesTittlesStart.classList.add("pilots__best-consecutives-start-text", "_stat-text");
      item.bestConsecutivesTittlesEnd.classList.add("pilots__best-consecutives-end-text", "_stat-text");
      item.bestConsecutivesTittlesTime.classList.add("pilots__best-consecutives-time-text", "_stat-text");

      item.bestConsecutivesItem.classList.add("pilots__best-consecutives-item", "_stat-item");
      item.bestConsecutivesItemRound.classList.add("pilots__best-consecutives-round-value", "_stat-value");
      item.bestConsecutivesItemStart.classList.add("pilots__best-consecutives-start-value", "_stat-value");
      item.bestConsecutivesItemEnd.classList.add("pilots__best-consecutives-end-value", "_stat-value");
      item.bestConsecutivesItemTime.classList.add("pilots__best-consecutives-time-value", "_button-time");

      item.quantityLap.classList.add("pilots__quantity-lap");
      item.quantityLapText.classList.add("pilots__quantity-lap-text", "_stat-text");
      item.quantityLapValue.classList.add("pilots__quantity-lap-value", "_stat-value");
      item.quantityStarts.classList.add("pilots__quantity-starts");
      item.quantityStartsText.classList.add("pilots__quantity-starts-text", "_stat-text");
      item.quantityStartsValue.classList.add("pilots__quantity-starts-value", "_stat-value");
      item.allLapsButton.classList.add("pilots__all-laps-button", "_button");
      item.averageLap.classList.add("pilots__average-lap");
      item.averageLapText.classList.add("pilots__average-lap-text", "_stat-text");
      item.averageLapValue.classList.add("pilots__average-lap-value", "_stat-value");

      // item.lap.classList.add('pilots__lap');
      // item.lapText.classList.add('pilots__lap-text', '_stat-text');
      // item.lapValue.classList.add('pilots__lap-value', '_stat-value');
      // item.consecutive.classList.add('pilots__consecutive');
      // item.consecutiveText.classList.add('pilots__consecutive-text', '_stat-text');
      // item.consecutiveValue.classList.add('pilots__consecutive-value', '_stat-value');

      item.pilotName.innerHTML = pilot.name; //Имя пилота

      item.allLapsButton.innerHTML = getState("textStrings").pilotsTab.allLaps;
      const lapsData = getLapsByName(pilot.name, pilot.heat, true); //берем круги пилота

      item.bestLapText.innerHTML = getState("textStrings").pilotsTab.bestLap;
      try {
        item.bestLapMainTime.innerHTML = lapsData[0].lapTime;
      } catch (error) {
        item.bestLapMainTime.innerHTML = unableTime;
      }
      item.bestLapButton.innerHTML = "<span></span>"; //кнопка спойлер

      item.bestLapTittlesRound.innerHTML = getState("textStrings").pilotsTab.round;
      item.bestLapTittlesStart.innerHTML = getState("textStrings").pilotsTab.start;
      item.bestLapTittlesEnd.innerHTML = getState("textStrings").pilotsTab.end;
      item.bestLapTittlesTime.innerHTML = getState("textStrings").pilotsTab.time;

      item.bestLapItems.append(item.bestLapTittles);
      item.bestLapTittles.append(item.bestLapTittlesRound, item.bestLapTittlesStart, item.bestLapTittlesEnd, item.bestLapTittlesTime);

      for (let i = 1; i <= lapsToShow; i++) {
        //здесь рисуем круги под спойлером помимо основного
        const itemElement = item.bestLapItem.cloneNode(true);
        const roundElement = item.bestLapItemRound.cloneNode(true);
        const startElement = item.bestLapItemStart.cloneNode(true);
        const endElement = item.bestLapItemEnd.cloneNode(true);
        const timeElement = item.bestLapItemTime.cloneNode(true);

        try {
          roundElement.innerHTML = lapsData[i - 1].round;
          startElement.innerHTML = lapsData[i - 1].lapTimeStart;
          endElement.innerHTML = lapsData[i - 1].lapTimeEnd;
          timeElement.innerHTML = lapsData[i - 1].lapTime;
        } catch (err) {
          roundElement.innerHTML = unableRound;
          startElement.innerHTML = unableDate;
          endElement.innerHTML = unableDate;
          timeElement.innerHTML = unableTime;
          // if(getState('CONSOLE_DEBUG'))console.log(`У ${ pilot.name } нет лучшего круга номер ${ i } `);
          // if(getState('CONSOLE_DEBUG'))console.log(err);
        }
        itemElement.append(roundElement, startElement, endElement, timeElement);
        item.bestLapItems.append(itemElement);
      }

      const consecutivesData = getConsecutivesByName(pilot.name, pilot.heat, true); //берем круги подряд пилота

      // if(getState('CONSOLE_DEBUG'))console.log(`consecutives от ${ pilot.name } `, consecutivesData);

      item.bestConsecutivesText.innerHTML =
        getState("language") == "ru" ? `${getState("consecutivesCount")} ${getState("textStrings").pilotsTab.bestConsecutive}` : `${getState("textStrings").pilotsTab.bestConsecutive}`;
      try {
        item.bestConsecutivesMainTime.innerHTML = consecutivesData[0].lapTime;
      } catch (error) {
        item.bestConsecutivesMainTime.innerHTML = unableTime;
      }
      item.bestConsecutivesButton.innerHTML = "<span></span>";

      item.bestConsecutivesTittlesRound.innerHTML = getState("textStrings").pilotsTab.round;
      item.bestConsecutivesTittlesStart.innerHTML = getState("textStrings").pilotsTab.start;
      item.bestConsecutivesTittlesEnd.innerHTML = getState("textStrings").pilotsTab.end;
      item.bestConsecutivesTittlesTime.innerHTML = getState("textStrings").pilotsTab.time;

      item.bestConsecutivesItems.append(item.bestConsecutivesTittles);
      item.bestConsecutivesTittles.append(item.bestConsecutivesTittlesRound, item.bestConsecutivesTittlesStart, item.bestConsecutivesTittlesEnd, item.bestConsecutivesTittlesTime);

      for (let i = 1; i <= lapsToShow; i++) {
        //здесь рисуем круги подряд под спойлером помимо основного
        const itemElement = item.bestConsecutivesItem.cloneNode(true);
        const roundElement = item.bestConsecutivesItemRound.cloneNode(true);
        const startElement = item.bestConsecutivesItemStart.cloneNode(true);
        const endElement = item.bestConsecutivesItemEnd.cloneNode(true);
        const timeElement = item.bestConsecutivesItemTime.cloneNode(true);

        try {
          roundElement.innerHTML = consecutivesData[i - 1].round;
          startElement.innerHTML = consecutivesData[i - 1].lapTimeStart;
          endElement.innerHTML = consecutivesData[i - 1].lapTimeEnd;
          timeElement.innerHTML = consecutivesData[i - 1].lapTime;
        } catch (err) {
          roundElement.innerHTML = unableRound;
          startElement.innerHTML = unableDate;
          endElement.innerHTML = unableDate;
          timeElement.innerHTML = unableTime;
          // if(getState('CONSOLE_DEBUG'))console.log(`У ${ pilot.name } нет лучшего круга номер ${ i } `);
          // if(getState('CONSOLE_DEBUG'))console.log(err);
        }
        itemElement.append(roundElement, startElement, endElement, timeElement);
        item.bestConsecutivesItems.append(itemElement);
      }

      item.quantityLapText.innerHTML = getState("textStrings").pilotsTab.totalLaps;
      item.quantityLapValue.innerHTML = pilot.laps;

      item.quantityStartsText.innerHTML = getState("textStrings").pilotsTab.totalStarts;
      item.quantityStartsValue.innerHTML = pilot.starts;

      item.averageLapText.innerHTML = getState("textStrings").pilotsTab.average;
      item.averageLapValue.innerHTML = pilot.averageLap;

      // item.lapText.innerHTML = 'Лучший круг';

      // item.consecutiveText.innerHTML = 'Лучшие 3 круга';

      // try {
      // 	item.lapValue.innerHTML = lapsData[0].lapTime;
      // } catch (error) {
      // 	item.lapValue.innerHTML = unableTime;
      // }

      // try {
      // 	item.consecutiveValue.innerHTML = consecutivesData[0].lapTime;
      // } catch (error) {
      // 	item.consecutiveValue.innerHTML = unableTime;
      // }

      const pilotsVsInput = document.createElement("input");
      const pilotsVsInputLabel = document.createElement("label");
      const pilotsVsInputContainer = document.createElement("div");

      pilotsVsInputContainer.classList.add("pilots-vs-form-input__container");

      pilotsVsInput.classList.add("pilots-vs-form-input");
      pilotsVsInput.setAttribute("form", "pilots-vs-form");
      pilotsVsInput.setAttribute("type", "checkbox");
      pilotsVsInput.setAttribute("name", `${pilot.name}`);

      pilotsVsInputLabel.classList.add("pilots-vs-form-input__label");
      pilotsVsInputLabel.setAttribute("for", `${pilot.name}`);
      pilotsVsInputLabel.innerHTML = `<p> ${getState("textStrings").pilotsTab.vs}</p><span class="label__span"></span>`;
      pilotsVsInputContainer.append(pilotsVsInputLabel, pilotsVsInput);

      pilots.items.append(item.container); //Начинаем складывать HTML
      item.container.append(item.pilotName, item.stats);
      item.stats.append(item.bestlap, item.bestConsecutives, item.averageLap, item.quantityLap, item.quantityStarts, item.allLapsButton, pilotsVsInputContainer);
      item.bestlap.append(item.bestLapText, item.bestLapMainTime, item.bestLapButton, item.bestLapItems);
      item.bestConsecutives.append(item.bestConsecutivesText, item.bestConsecutivesMainTime, item.bestConsecutivesButton, item.bestConsecutivesItems);
      item.quantityLap.append(item.quantityLapText, item.quantityLapValue);
      item.quantityStarts.append(item.quantityStartsText, item.quantityStartsValue);
      item.averageLap.append(item.averageLapText, item.averageLapValue);
    }
  }

  return pilots.pilots;
}

export function writeLeaderboardHTML() {
  const leaderboard = {
    tab: document.createElement("div"),
    container: document.createElement("div"),
    buttons: document.createElement("div"),
    lapBtn: document.createElement("button"),
    consecutiveBtn: document.createElement("button"),
    countBtn: document.createElement("button"),
    averageBtn: document.createElement("button"),
    items: document.createElement("div"),
    item: document.createElement("div"),
  };

  const lapItem = {
    lap: document.createElement("div"),
    container: document.createElement("div"),
    items: document.createElement("div"),
    tittles: document.createElement("div"),
    tittlesName: document.createElement("div"),
    tittlesRound: document.createElement("div"),
    tittlesTime: document.createElement("div"),
  };
  const consecutiveItem = {
    consecutive: document.createElement("div"),
    container: document.createElement("div"),
    items: document.createElement("div"),
    tittles: document.createElement("div"),
    tittlesName: document.createElement("div"),
    tittlesRound: document.createElement("div"),
    tittlesTime: document.createElement("div"),
  };
  const countItem = {
    count: document.createElement("div"),
    container: document.createElement("div"),
    items: document.createElement("div"),
    tittles: document.createElement("div"),
    tittlesName: document.createElement("div"),
    tittlesStarts: document.createElement("div"),
    tittlesCounts: document.createElement("div"),
  };
  const averageItem = {
    average: document.createElement("div"),
    container: document.createElement("div"),
    items: document.createElement("div"),
    tittles: document.createElement("div"),
    tittlesName: document.createElement("div"),
    tittlesStarts: document.createElement("div"),
    tittlesLaps: document.createElement("div"),
    tittlesAverage: document.createElement("div"),
  };

  leaderboard.tab.classList.add("leaderboard", "tab");
  leaderboard.container.classList.add("leaderboard__container", "_container", "tab-items");
  leaderboard.buttons.classList.add("leaderboard__buttons", "_buttons-wrapper");
  leaderboard.lapBtn.classList.add("leaderboard__lap-button", "_button", "_leaderboard-buttons");
  leaderboard.consecutiveBtn.classList.add("leaderboard__consecutive-button", "_button", "_leaderboard-buttons");
  leaderboard.countBtn.classList.add("leaderboard__count-button", "_button", "_leaderboard-buttons");
  leaderboard.averageBtn.classList.add("leaderboard__average-button", "_button", "_leaderboard-buttons");
  leaderboard.items.classList.add("leaderboard__items");

  lapItem.lap.classList.add("leaderboard-lap", "leaderboard__item");
  lapItem.container.classList.add("leaderboard-lap__container", "_container");
  lapItem.items.classList.add("leaderboard-lap__items");
  lapItem.tittles.classList.add("leaderboard-lap__tittles", "_leaderboard-tittles");
  lapItem.tittlesName.classList.add("leaderboard-lap__tittles-name", "_stat-text");
  lapItem.tittlesRound.classList.add("leaderboard-lap__tittles-round", "_stat-text");
  lapItem.tittlesTime.classList.add("leaderboard-lap__tittles-time", "_stat-text");

  consecutiveItem.consecutive.classList.add("leaderboard-consecutive", "leaderboard__item");
  consecutiveItem.container.classList.add("leaderboard-consecutive__container", "_container");
  consecutiveItem.items.classList.add("leaderboard-consecutive__items");
  consecutiveItem.tittles.classList.add("leaderboard-consecutive__tittles", "_leaderboard-tittles");
  consecutiveItem.tittlesName.classList.add("leaderboard-consecutive__tittles-name", "_stat-text");
  consecutiveItem.tittlesRound.classList.add("leaderboard-consecutive__tittles-round", "_stat-text");
  consecutiveItem.tittlesTime.classList.add("leaderboard-consecutive__tittles-time", "_stat-text");

  countItem.count.classList.add("leaderboard-count", "leaderboard__item");
  countItem.container.classList.add("leaderboard-count__container", "_container");
  countItem.items.classList.add("leaderboard-count__items");
  countItem.tittles.classList.add("leaderboard-count__tittles", "_leaderboard-tittles");
  countItem.tittlesName.classList.add("leaderboard-count__tittles-name", "_stat-text");
  countItem.tittlesStarts.classList.add("leaderboard-count__tittles-starts", "_stat-text");
  countItem.tittlesCounts.classList.add("leaderboard-count__tittles-counts", "_stat-text");

  averageItem.average.classList.add("leaderboard-average", "leaderboard__item");
  averageItem.container.classList.add("leaderboard-average__container", "_container");
  averageItem.items.classList.add("leaderboard-average__items");
  averageItem.tittles.classList.add("leaderboard-average__tittles", "_leaderboard-tittles");
  averageItem.tittlesName.classList.add("leaderboard-average__tittles-name", "_stat-text");
  averageItem.tittlesStarts.classList.add("leaderboard-average__tittles-starts", "_stat-text");
  averageItem.tittlesLaps.classList.add("leaderboard-average__tittles-laps", "_stat-text");
  averageItem.tittlesAverage.classList.add("leaderboard-average__tittles-average", "_stat-text");

  leaderboard.tab.append(leaderboard.container);
  leaderboard.container.append(leaderboard.buttons, leaderboard.items);
  leaderboard.buttons.append(leaderboard.lapBtn, leaderboard.consecutiveBtn, leaderboard.countBtn, leaderboard.averageBtn);
  leaderboard.lapBtn.innerHTML = getState("textStrings").leaderboardTab.lap;
  leaderboard.consecutiveBtn.innerHTML =
    getState("language") == "ru" ? `${getState("consecutivesCount")} ${getState("textStrings").pilotsTab.bestConsecutive}` : `${getState("textStrings").pilotsTab.bestConsecutive}`;
  leaderboard.countBtn.innerHTML = getState("textStrings").leaderboardTab.totalLaps;
  leaderboard.averageBtn.innerHTML = getState("textStrings").leaderboardTab.average;
  leaderboard.items.append(lapItem.lap, consecutiveItem.consecutive, countItem.count, averageItem.average);

  lapItem.lap.append(lapItem.container);
  lapItem.container.append(lapItem.items);
  lapItem.items.append(lapItem.tittles);
  lapItem.tittles.append(lapItem.tittlesName, lapItem.tittlesRound, lapItem.tittlesTime);
  lapItem.tittlesName.innerHTML = getState("textStrings").leaderboardTab.name;
  lapItem.tittlesRound.innerHTML = getState("textStrings").leaderboardTab.round;
  lapItem.tittlesTime.innerHTML = getState("textStrings").leaderboardTab.time;

  consecutiveItem.consecutive.append(consecutiveItem.container);
  consecutiveItem.container.append(consecutiveItem.items);
  consecutiveItem.items.append(consecutiveItem.tittles);
  consecutiveItem.tittles.append(consecutiveItem.tittlesName, consecutiveItem.tittlesRound, consecutiveItem.tittlesTime);
  consecutiveItem.tittlesName.innerHTML = getState("textStrings").leaderboardTab.name;
  consecutiveItem.tittlesRound.innerHTML = getState("textStrings").leaderboardTab.round;
  consecutiveItem.tittlesTime.innerHTML = getState("textStrings").leaderboardTab.time;

  countItem.count.append(countItem.container);
  countItem.container.append(countItem.items);
  countItem.items.append(countItem.tittles);
  countItem.tittles.append(countItem.tittlesName, countItem.tittlesStarts, countItem.tittlesCounts);
  countItem.tittlesName.innerHTML = getState("textStrings").leaderboardTab.name;
  countItem.tittlesStarts.innerHTML = getState("textStrings").leaderboardTab.starts;
  countItem.tittlesCounts.innerHTML = getState("textStrings").leaderboardTab.laps;

  averageItem.average.append(averageItem.container);
  averageItem.container.append(averageItem.items);
  averageItem.items.append(averageItem.tittles);
  averageItem.tittles.append(averageItem.tittlesName, averageItem.tittlesLaps, averageItem.tittlesAverage);
  averageItem.tittlesName.innerHTML = getState("textStrings").leaderboardTab.name;
  averageItem.tittlesStarts.innerHTML = getState("textStrings").leaderboardTab.starts;
  averageItem.tittlesLaps.innerHTML = getState("textStrings").leaderboardTab.laps;
  averageItem.tittlesAverage.innerHTML = getState("textStrings").leaderboardTab.time;

  let lapArr = [];
  let consecutiveArr = [];
  let countArr = [];
  let averageArr = [];

  const pilots = getPilotsStats();
  if (getState("CONSOLE_DEBUG")) console.log("PILOT STAAATS", pilots);

  pilots.forEach((pilot) => {
    if (pilot.laps) {
      let lapObj = {};
      let consecutiveObj = {};
      let countObj = {};
      let averageObj = {};
      const name = pilot.name;

      let allLaps;
      lapObj.name = name;
      lapObj.lapRound = null;
      lapObj.LapTime = null;

      try {
        allLaps = getLapsByName(name, true);
        lapObj.lapRound = allLaps[0].round;
        lapObj.LapTime = lapTimeConverter(allLaps[0].lapTime, "float");
      } catch (error) {
        if (getState("CONSOLE_DEBUG")) console.log("Нет кругов", error);
      }

      let allConsecutives;
      consecutiveObj.name = name;
      consecutiveObj.consecutiveRound = null;
      consecutiveObj.consecutiveTime = null;

      try {
        allConsecutives = getConsecutivesByName(name, true);
        consecutiveObj.consecutiveRound = allConsecutives[0].round;
        consecutiveObj.consecutiveTime = lapTimeConverter(allConsecutives[0].lapTime, "float");
      } catch (error) {
        if (getState("CONSOLE_DEBUG")) console.log("Нет 3 подряд", error);
      }

      countObj.name = name;
      countObj.countStarts = pilot.starts;
      countObj.countLaps = pilot.laps;

      averageObj.name = name;
      averageObj.averageStarts = pilot.starts;
      averageObj.averageLaps = pilot.laps;
      averageObj.averageAverage = lapTimeConverter(pilot.averageLap, "float");

      lapArr.push(lapObj);

      if (consecutiveObj.consecutiveTime) consecutiveArr.push(consecutiveObj);
      countArr.push(countObj);
      averageArr.push(averageObj);
    }
  });

  lapArr.sort((a, b) => (+a.LapTime > +b.LapTime ? 1 : -1));
  consecutiveArr.sort((a, b) => (+a.consecutiveTime > +b.consecutiveTime ? 1 : -1));

  countArr.sort((a, b) => (+a.countLaps > +b.countLaps ? -1 : 1));
  averageArr.sort((a, b) => (+a.averageAverage > +b.averageAverage ? 1 : -1));

  lapArr.forEach((element, index) => {
    const time = lapTimeConverter(+element.LapTime, "string");

    const lapStroke = {
      item: document.createElement("div"),
      name: document.createElement("div"),
      round: document.createElement("div"),
      time: document.createElement("button"),
    };

    lapStroke.item.classList.add("leaderboard-lap__item", "_leaderboard-stroke");
    lapStroke.name.classList.add("leaderboard-lap__name", "_stat-value");
    lapStroke.round.classList.add("leaderboard-lap__round", "_stat-value");
    lapStroke.time.classList.add("leaderboard-lap__time", "_button-time");
    lapStroke.name.innerHTML = `<p>${index + 1}</p><p>${element.name}</p>`;
    lapStroke.round.innerHTML = element.lapRound;
    lapStroke.time.innerHTML = time;

    lapStroke.item.append(lapStroke.name, lapStroke.round, lapStroke.time);

    lapItem.items.append(lapStroke.item);
  });
  consecutiveArr.forEach((element, index) => {
    const time = lapTimeConverter(+element.consecutiveTime, "string");

    const consecutiveStroke = {
      item: document.createElement("div"),
      name: document.createElement("div"),
      round: document.createElement("div"),
      time: document.createElement("button"),
    };

    consecutiveStroke.item.classList.add("leaderboard-consecutive__item", "_leaderboard-stroke");
    consecutiveStroke.name.classList.add("leaderboard-consecutive__name", "_stat-value");
    consecutiveStroke.round.classList.add("leaderboard-consecutive__round", "_stat-value");
    consecutiveStroke.time.classList.add("leaderboard-consecutive__time", "_button-time");
    consecutiveStroke.name.innerHTML = `<p>${index + 1}</p><p>${element.name}</p>`;
    consecutiveStroke.round.innerHTML = element.consecutiveRound;
    consecutiveStroke.time.innerHTML = time;
    consecutiveStroke.item.append(consecutiveStroke.name, consecutiveStroke.round, consecutiveStroke.time);

    consecutiveItem.items.append(consecutiveStroke.item);
  });

  countArr.forEach((element, index) => {
    const countStroke = {
      item: document.createElement("div"),
      name: document.createElement("div"),
      starts: document.createElement("div"),
      count: document.createElement("div"),
    };

    countStroke.item.classList.add("leaderboard-count__item", "_leaderboard-stroke");
    countStroke.name.classList.add("leaderboard-count__name", "_stat-value");
    countStroke.starts.classList.add("leaderboard-count__starts", "_stat-value");
    countStroke.count.classList.add("leaderboard-count__count", "_stat-value");
    countStroke.name.innerHTML = `<p>${index + 1}</p><p>${element.name}</p>`;
    countStroke.starts.innerHTML = element.countStarts;
    countStroke.count.innerHTML = element.countLaps;
    countStroke.item.append(countStroke.name, countStroke.starts, countStroke.count);

    countItem.items.append(countStroke.item);
  });

  averageArr.forEach((element, index) => {
    const time = lapTimeConverter(+element.averageAverage, "string");
    const averageStroke = {
      item: document.createElement("div"),
      name: document.createElement("div"),
      starts: document.createElement("div"),
      laps: document.createElement("div"),
      time: document.createElement("div"),
    };

    averageStroke.item.classList.add("leaderboard-average__item", "_leaderboard-stroke");
    averageStroke.name.classList.add("leaderboard-average__name", "_stat-value");
    averageStroke.starts.classList.add("leaderboard-average__starts", "_stat-value");
    averageStroke.laps.classList.add("leaderboard-average__laps", "_stat-value");
    averageStroke.time.classList.add("leaderboard-average__average", "_stat-value");

    averageStroke.name.innerHTML = `<p>${index + 1}</p><p>${element.name}</p>`;
    averageStroke.starts.innerHTML = element.averageStarts;
    averageStroke.laps.innerHTML = element.averageLaps;
    averageStroke.time.innerHTML = time;

    averageStroke.item.append(averageStroke.name, averageStroke.laps, averageStroke.time);

    averageItem.items.append(averageStroke.item);
  });

  if (getState("CONSOLE_DEBUG")) console.log(leaderboard.tab);
  return leaderboard.tab;
}

export function writeRoundsHTML() {
  const rounds = {
    rounds: document.createElement("div"),
    container: document.createElement("div"),
    buttons: document.createElement("div"),
    items: document.createElement("div"),
  };
  rounds.rounds.classList.add("rounds", "tab");
  rounds.container.classList.add("tab-items", "_container", "rounds__container");
  rounds.buttons.classList.add("rounds__buttons", "_buttons-wrapper");
  rounds.items.classList.add("rounds__items");

  const heatsObj = getRoundsByHeats();

  // Будем сортировать Heatы по надписи display name
  let heatNamesArr = []; //Сюда добавим heatId и Displayname, по которому будем сортирвать

  for (let heat in heatsObj) {
    const obj = {};
    obj.name = getState("mainObj").heats[heat].displayname;
    obj.heatNum = heat;
    heatNamesArr.push(obj);
  }

  const heatNamesArrSorted = heatNamesArr.sort((a, b) => {
    let firstDisplayName = a.name;
    let secondDisplayName = b.name;

    const firstArr = firstDisplayName.match(/\d+/g); //Вытаскиваем из названия число или 2числа
    const secondArr = secondDisplayName.match(/\d+/g);
    const first = firstArr.join(""); //Соединяем, но не суммируем
    const second = secondArr.join("");

    return first - second;
  });

  let heatsIdsSorted = []; //Сюда добавим сортированные heatId из heatNamesArrSorted;

  for (let heat in heatNamesArrSorted) {
    heatsIdsSorted.push(heatNamesArrSorted[heat].heatNum);
  }

  // for (let heat in heatsObj) {

  heatsIdsSorted.forEach((heatNum) => {
    const heatButton = document.createElement("button");
    const heatClassString = `rounds__heat-${heatNum}`;

    let groupName;
    try {
      const displayName = getState("mainObj").heats[heatNum].displayname;
      groupName = displayName;
    } catch (error) {
      groupName = `${getState("textStrings").roundsTab.heat} ${heatNum}`;
    }

    // const heatTextString = `Группа ${ heat } `;
    heatButton.classList.add("rounds__heat", "_button", `${heatClassString}`);
    heatButton.innerHTML = groupName;
    rounds.buttons.append(heatButton);

    const roundsElement = document.createElement("div");
    const roundsContainer = document.createElement("div");
    const roundsClassString = `rounds__rounds-heat-${heatNum}`;
    roundsElement.classList.add("rounds__rounds", `${roundsClassString}`);
    roundsContainer.classList.add("rounds__rounds-container", "_container");
    rounds.items.append(roundsElement);
    roundsElement.append(roundsContainer);

    const roundsArr = heatsObj[heatNum];
    roundsArr.forEach((round) => {
      const roundElement = document.createElement("button");
      roundElement.classList.add("rounds__item", "_button");
      roundElement.innerHTML = `${getState("textStrings").roundsTab.round} ${round} `;
      roundsContainer.append(roundElement);
    });
  });
  // }

  if (getState("CONSOLE_DEBUG")) console.log("rounds.itemsrounds.items", rounds.items);

  rounds.rounds.append(rounds.container);
  rounds.container.append(rounds.buttons, rounds.items);
  if (getState("CONSOLE_DEBUG")) console.log("ROUNDS", rounds.rounds);
  return rounds.rounds;
}

export function writeRound(roundRound, roundHeat) {
  const round = {
    round: document.createElement("div"),
    container: document.createElement("div"),
    tittle: document.createElement("div"),
    tittleRound: document.createElement("div"),
    tittleHeat: document.createElement("div"),
    exitBtn: document.createElement("div"),

    buttons: document.createElement("div"),
    viewBtn: document.createElement("button"),
    statBtn: document.createElement("button"),

    tabs: document.createElement("div"),
  };

  const view = {
    view: document.createElement("div"),
    graphArea: document.createElement("div"),
    lapsArea: document.createElement("div"),
    // lapNode:document.createElement('div'), //Здесь будут добавляться много кругов
    pilots: document.createElement("div"),
    // pilotsInfo:document.createElement('div'),  //А здесь инфа по пилоту
    speedSlider: document.createElement("div"),
    sliderInput: document.createElement("input"),
    speedText: document.createElement("div"),
    speedTittle: document.createElement("div"),
    speedValue: document.createElement("div"),
    playBtn: document.createElement("button"),
  };

  const statistic = {
    statistic: document.createElement("div"),
    container: document.createElement("div"),

    fullRoundTittle: document.createElement("div"),
    fullRound: document.createElement("div"),

    fullRoundNamesColumn: document.createElement("div"),
    fullRoundNamesTittle: document.createElement("div"),
    fullRoundNamesItems: document.createElement("div"),
    // names: document.createElement('div'),			//Здесь будут имена

    statsRow: document.createElement("div"),
    statsRowContainer: document.createElement("div"),

    lapsColumn: document.createElement("div"),
    lapsTittle: document.createElement("div"),
    lapsItems: document.createElement("div"),
    // laps: document.createElement('div'),			//Круги

    bestLapColumn: document.createElement("div"),
    bestLapTittle: document.createElement("div"),
    bestLapItems: document.createElement("div"),
    // bestLaps: document.createElement('div'),			//лучшие Круги

    consecutiveColumn: document.createElement("div"),
    consecutiveTittle: document.createElement("div"),
    consecutiveItems: document.createElement("div"),
    // consecutive: document.createElement('div'),			//Круги подряд

    totalTimeColumn: document.createElement("div"),
    totalTimeTittle: document.createElement("div"),
    totalTimeItems: document.createElement("div"),
    // totalTime: document.createElement('div'),			//Все время

    singleLapsTittle: document.createElement("div"),
    singleLaps: document.createElement("div"),

    singleLapNamesColumn: document.createElement("div"),
    singleLapNamesTittle: document.createElement("div"),
    singleLapNamesItems: document.createElement("div"),
    // names: document.createElement('div'),			//Здесь будут имена

    singleLapsRow: document.createElement("div"),
    singleLapsRowContainer: document.createElement("div"),

    // singleLaps: document.createElement('div'),			//здесь порисуем круги
  };

  round.round.classList.add("round", "modal");
  round.container.classList.add("round__container", "_container", "modal__container", "_no-events");

  round.tittle.classList.add("round__tittle", "modal__tittle", "_hidden-tittle");
  round.tittleRound.classList.add("round__tittle-round");
  // round.tittleHeat.classList.add('round__tittle-heat')
  round.exitBtn.classList.add("round__exit-button", "_button-exit");

  round.buttons.classList.add("round__buttons", "_buttons-wrapper", "_no-event", "_hidden-buttons");
  round.viewBtn.classList.add("round__view-button", "_button");
  round.statBtn.classList.add("round__statistic-button", "_button");

  round.tabs.classList.add("round__tabs");

  view.view.classList.add("round__view");
  view.graphArea.classList.add("round__graph-area", "_hidden-graph-area");
  view.lapsArea.classList.add("round__graph-area-laps");
  view.pilots.classList.add("round__graph-area-pilots");

  view.speedSlider.classList.add("round__speed-slider", "_hidden-slider");
  view.sliderInput.classList.add("round__slider", "_no-event");
  view.sliderInput.setAttribute("name", "round__slider");
  view.sliderInput.setAttribute("type", "range");
  view.sliderInput.setAttribute("min", "0");
  view.sliderInput.setAttribute("max", "3");
  view.sliderInput.setAttribute("value", "2");
  view.sliderInput.setAttribute("step", "1");

  view.speedText.classList.add("round__speed-text");
  view.speedTittle.classList.add("round__speed-tittle");
  view.speedValue.classList.add("round__speed-value");

  view.playBtn.classList.add("round__play-button", "_button", "_hidden-play-button", "_no-event");

  statistic.statistic.classList.add("round__statistic", "statistic");
  statistic.container.classList.add("statistic__container");

  statistic.fullRoundTittle.classList.add("statistic__full-round-tittle");
  statistic.fullRound.classList.add("statistic__full-round");
  statistic.fullRoundNamesColumn.classList.add("statistic__names-column", "name__column");
  statistic.fullRoundNamesTittle.classList.add("statistic__names-tittle", "statistic__tittle");
  statistic.fullRoundNamesItems.classList.add("statistic__names-items");

  statistic.statsRow.classList.add("statistic__stats-row");
  statistic.statsRowContainer.classList.add("statistic__stats-row-container");

  statistic.lapsColumn.classList.add("statistic__laps-column", "statistic__column");
  statistic.lapsTittle.classList.add("statistic__laps-tittle", "statistic__tittle");
  statistic.lapsItems.classList.add("statistic__laps-items");
  statistic.bestLapColumn.classList.add("statistic__best-lap-column", "statistic__column");
  statistic.bestLapTittle.classList.add("statistic__best-lap-tittle", "statistic__tittle");
  statistic.bestLapItems.classList.add("statistic__best-lap-items");
  statistic.consecutiveColumn.classList.add("statistic__best-consecutive-column", "statistic__column");
  statistic.consecutiveTittle.classList.add("statistic__best-consecutive-tittle", "statistic__tittle");
  statistic.consecutiveItems.classList.add("statistic__best-consecutive-items");
  statistic.totalTimeColumn.classList.add("statistic__total-time-column", "statistic__column");
  statistic.totalTimeTittle.classList.add("statistic__total-time-tittle", "statistic__tittle");
  statistic.totalTimeItems.classList.add("statistic__total-time-items");

  statistic.singleLapsTittle.classList.add("statistic__single-laps-main-tittle");
  statistic.singleLaps.classList.add("statistic__single-laps");

  statistic.singleLapNamesColumn.classList.add("statistic__names-column", "name__column");
  statistic.singleLapNamesTittle.classList.add("statistic__names-tittle", "statistic__tittle");
  statistic.singleLapNamesItems.classList.add("statistic__names-items");

  statistic.singleLapsRow.classList.add("statistic__single-laps-row");
  statistic.singleLapsRowContainer.classList.add("statistic__single-laps-row-container");

  // round.tittleHeat.innerHTML = `Группа ${roundHeat}`

  round.viewBtn.innerHTML = getState("textStrings").roundsTab.view;
  round.statBtn.innerHTML = getState("textStrings").roundsTab.statistic;

  view.speedTittle.innerHTML = getState("textStrings").roundsTab.speed;
  view.speedValue.innerHTML = `x2`;
  view.playBtn.innerHTML = `<p>${getState("textStrings").roundsTab.play}</p>`;

  statistic.fullRoundNamesTittle.innerHTML = getState("textStrings").roundsTab.name;
  statistic.lapsTittle.innerHTML = getState("textStrings").roundsTab.laps;
  statistic.bestLapTittle.innerHTML = getState("textStrings").roundsTab.bestLap;
  statistic.consecutiveTittle.innerHTML = getState("textStrings").roundsTab.bestConsecutive;
  statistic.totalTimeTittle.innerHTML = getState("textStrings").roundsTab.totalTime;

  statistic.singleLapNamesTittle.innerHTML = getState("textStrings").roundsTab.name;

  const roundInfo = getRound(roundRound, roundHeat);
  // if(getState('CONSOLE_DEBUG'))console.log('Round IFONNNN', roundInfo);

  round.tittleRound.innerHTML = roundInfo[0].round;

  const maxLaps = roundInfo[0].maxLaps;
  //   const maxLaps = 10;

  statistic.fullRoundTittle.innerHTML = `${getState("textStrings").roundsTab.roundStart} - ${roundInfo[0].roundStart}`;
  statistic.singleLapsTittle.innerHTML = getState("textStrings").roundsTab.laps;

  view.lapsArea.style.gridTemplateColumns = `repeat(${maxLaps},1fr) 2px`;
  view.pilots.style.gridTemplateColumns = `repeat(${maxLaps},1fr) 2px`;

  const screenMaxLaps = window.screen.width < 510 ? 9 : window.screen.width < 767 ? 15 : 22; //на каких экранах сколько кругов без скролла
  if (maxLaps > screenMaxLaps) {
    view.graphArea.classList.add("_many-laps");
    view.lapsArea.classList.add("_many-laps");
  }
  for (let i = 0; i <= maxLaps; i++) {
    const lapElement = document.createElement("div");
    if (i != maxLaps) {
      lapElement.classList.add("round__graph-area-lap-node", "_hidden-graph-area-lap-node");
      lapElement.innerHTML = `${getState("textStrings").roundsTab.lap} ${i + 1}<span></span>`;
    } else {
      lapElement.classList.add("round__graph-area-lap-node", "round__graph-area-lap-node-final", "_hidden-graph-area-lap-node");
      lapElement.innerHTML = `<span></span>`;
    }
    view.lapsArea.append(lapElement);
  }

  const singleLapItems = {};

  for (let i = 0; i <= maxLaps; i++) {
    const singleLapColumn = document.createElement("div");
    const singleLapTittle = document.createElement("div");
    singleLapItems[i] = document.createElement("div");

    singleLapColumn.classList.add("statistic__single-laps-column", "statistic__column");
    singleLapTittle.classList.add("statistic__single-laps-tittle", "statistic__tittle");
    singleLapItems[i].classList.add("statistic__single-laps-items");
    if (i == 0) {
      singleLapTittle.innerHTML = getState("textStrings").roundsTab.holeShot;
    } else {
      singleLapTittle.innerHTML = `${getState("textStrings").roundsTab.lap} ${i}`;
    }
    singleLapColumn.append(singleLapTittle, singleLapItems[i]);
    statistic.singleLapsRowContainer.append(singleLapColumn);
  }

  if (getState("CONSOLE_DEBUG")) console.log("roundInfo---------------------", roundInfo);

  for (let i = 1; i < roundInfo.length; i++) {
    const pilotRoundInfo = roundInfo[i];
    const lapsQuantity = pilotRoundInfo.length - 2;
    const pilotName = pilotRoundInfo[pilotRoundInfo.length - 1];
    const pilotElement = document.createElement("div");
    const lapsAreaNameElement = document.createElement("div");
    // if(getState('CONSOLE_DEBUG'))console.log('PILOT ROUND', pilotRoundInfo);

    pilotElement.style.gridTemplateColumns = `repeat(${maxLaps},1fr) 2px`;

    pilotElement.classList.add("round__graph-area-pilot");
    lapsAreaNameElement.classList.add("round__graph-area-name", "_hidden-graph-area-name");
    lapsAreaNameElement.innerHTML = pilotName;
    view.pilots.append(pilotElement);
    pilotElement.append(lapsAreaNameElement);

    for (let i = 0; i <= lapsQuantity; i++) {
      const lapsAreaLapElement = document.createElement("div");
      if (i != lapsQuantity) {
        lapsAreaLapElement.classList.add("round__graph-area-lap");
      } else {
        lapsAreaLapElement.classList.add("round__graph-area-lap-final");
      }
      lapsAreaLapElement.innerHTML = `<span></span>`;
      pilotElement.append(lapsAreaLapElement);
    }

    const laps = getLapsByName(pilotName, roundHeat, true);
    const roundLaps = laps.filter((el) => el.roundId == roundRound && el.heatId == roundHeat);
    let bestLap;
    try {
      bestLap = roundLaps[0].lapTime;
    } catch (error) {
      bestLap = "-:--.---";
    }

    const consecutive = getConsecutivesByName(pilotName, roundHeat, true);
    const roundConsecutive = consecutive.filter((el) => el.roundId == roundRound && el.heatId == roundHeat);
    let bestConsecutive;

    try {
      bestConsecutive = roundConsecutive[0].lapTime;
    } catch (error) {
      bestConsecutive = "-:--.---";
    }
    let totalTimeFloat = 0;

    roundLaps.forEach((lap) => {
      const previousTime = totalTimeFloat;

      const time = lapTimeConverter(lap.lapTime, "float");
      // if(getState('CONSOLE_DEBUG'))console.log('curr time', time);
      totalTimeFloat = +previousTime + +time;
    });
    const totalTimeString = lapTimeConverter(+totalTimeFloat, "string");

    // if(getState('CONSOLE_DEBUG'))console.log('TOTAL TIME', totalTimeString);
    // if(getState('CONSOLE_DEBUG'))console.log('BEST', bestLap);
    // if(getState('CONSOLE_DEBUG'))console.log('CONST', bestConsecutive);

    const fullRoundPilot = {
      name: document.createElement("div"),
      laps: document.createElement("div"),
      bestLap: document.createElement("div"),
      consecutive: document.createElement("div"),
      totalTime: document.createElement("div"),
    };

    fullRoundPilot.name.classList.add("statistic__names-item", "statistic__stat");
    fullRoundPilot.laps.classList.add("statistic__laps-item", "statistic__stat");
    fullRoundPilot.bestLap.classList.add("statistic__best-lap-item", "statistic__stat");
    fullRoundPilot.consecutive.classList.add("statistic__consecutive-item", "statistic__stat");
    fullRoundPilot.totalTime.classList.add("statistic__total-time-item", "statistic__stat");

    fullRoundPilot.name.innerHTML = `${pilotName}<span></span>`;
    fullRoundPilot.laps.innerHTML = lapsQuantity;
    fullRoundPilot.bestLap.innerHTML = bestLap;
    fullRoundPilot.consecutive.innerHTML = bestConsecutive;
    fullRoundPilot.totalTime.innerHTML = totalTimeString;

    statistic.fullRoundNamesItems.append(fullRoundPilot.name);
    statistic.lapsItems.append(fullRoundPilot.laps);
    statistic.bestLapItems.append(fullRoundPilot.bestLap);
    statistic.consecutiveItems.append(fullRoundPilot.consecutive);
    statistic.totalTimeItems.append(fullRoundPilot.totalTime);

    const singleLapName = document.createElement("div");
    singleLapName.classList.add("statistic__names-item", "statistic__stat");
    singleLapName.innerHTML = `${pilotName}<span></span>`;
    statistic.singleLapNamesItems.append(singleLapName);
    const singleLaps = singleLapItems;
    if (getState("CONSOLE_DEBUG")) console.log("SingleLAPS", singleLaps);

    for (let i = 0; i <= maxLaps; i++) {
      const singleLapItem = document.createElement("div");
      singleLapItem.classList.add("statistic__single-laps-item", "statistic__stat");

      if (i == 0) {
        singleLapItem.innerHTML = pilotRoundInfo[i];
      } else {
        let time = null;
        try {
          time = pilotRoundInfo[i].lapTime;
        } catch (error) {
          time = "-:--.---";
        }
        if (time) {
          singleLapItem.innerHTML = time;
        } else {
          singleLapItem.innerHTML = "-:--.---";
        }
      }

      singleLapItems[i].append(singleLapItem);
    }
  }
  // for (let i = 1; i < roundInfo.length; i++) {
  // 	const roundArr = roundInfo[i];
  // 	const name = roundArr[roundArr.length - 1]
  // 	const nameItem = document.createElement('div')
  // 	nameItem.classList.add('statistic__names-item', 'statistic__stat')
  // 	nameItem.innerHTML = name;
  // 	statistic.fullRoundNamesItems.append(nameItem);
  // }

  round.round.append(round.container);
  round.container.append(round.tittle, round.buttons, round.tabs);

  round.tittle.append(round.tittleRound, round.exitBtn);
  round.buttons.append(round.viewBtn, round.statBtn);

  round.tabs.append(view.view, statistic.statistic);

  view.view.append(view.graphArea, view.speedSlider, view.playBtn);

  view.graphArea.append(view.lapsArea);
  view.lapsArea.append(view.pilots);

  view.speedSlider.append(view.sliderInput, view.speedText);
  view.speedText.append(view.speedTittle, view.speedValue);

  statistic.statistic.append(statistic.container);
  statistic.container.append(statistic.fullRoundTittle, statistic.fullRound, statistic.singleLapsTittle, statistic.singleLaps);

  statistic.fullRound.append(statistic.fullRoundNamesColumn, statistic.statsRow);
  statistic.fullRoundNamesColumn.append(statistic.fullRoundNamesTittle, statistic.fullRoundNamesItems);
  statistic.statsRow.append(statistic.statsRowContainer);
  statistic.statsRowContainer.append(statistic.lapsColumn, statistic.bestLapColumn, statistic.consecutiveColumn, statistic.totalTimeColumn);
  statistic.lapsColumn.append(statistic.lapsTittle, statistic.lapsItems);
  statistic.bestLapColumn.append(statistic.bestLapTittle, statistic.bestLapItems);
  statistic.consecutiveColumn.append(statistic.consecutiveTittle, statistic.consecutiveItems);
  statistic.totalTimeColumn.append(statistic.totalTimeTittle, statistic.totalTimeItems);

  statistic.singleLaps.append(statistic.singleLapNamesColumn, statistic.singleLapsRow);
  statistic.singleLapNamesColumn.append(statistic.singleLapNamesTittle, statistic.singleLapNamesItems);

  statistic.singleLapsRow.append(statistic.singleLapsRowContainer);

  if (getState("CONSOLE_DEBUG")) console.log("R O U N DDDD", round.round);
  return round.round;
}

export function writeInRoundHTML(lap, laps, name) {
  //Рисуем 'В каком раунде'. lap - круг какой нажали. laps - все круги пилота;
  const inRound = {
    inRound: document.createElement("div"),
    container: document.createElement("div"),
    tittle: document.createElement("div"),
    tittleName: document.createElement("div"),
    tittleRound: document.createElement("div"),
    exitBtn: document.createElement("div"),
    area: document.createElement("div"),
    areaLaps: document.createElement("div"),
    stats: document.createElement("div"),
    start: document.createElement("div"),
    startText: document.createElement("div"),
    startValue: document.createElement("div"),
    lapStart: document.createElement("div"),
    lapStartText: document.createElement("div"),
    lapStartValue: document.createElement("div"),

    lapEnd: document.createElement("div"),
    lapEndText: document.createElement("div"),
    lapEndValue: document.createElement("div"),

    lapTime: document.createElement("div"),
    lapCount: document.createElement("div"),
    lapCountText: document.createElement("div"),
    lapCountValue: document.createElement("div"),
    button: document.createElement("button"),
    heatNum: document.createElement("div"),
    roundNum: document.createElement("div"),
  };
  inRound.inRound.classList.add("in-round", "modal");
  inRound.container.classList.add("in-round__container", "_container", "_no-events", "modal__container");
  inRound.tittle.classList.add("in-round__tittle", "modal__tittle", "_hidden-tittle");
  inRound.tittleName.classList.add("in-round__tittle-name");
  inRound.tittleRound.classList.add("in-round__tittle-round");
  inRound.exitBtn.classList.add("in-round__exit-button", "_no-event", "_button-exit");
  inRound.area.classList.add("in-round__round-area", "graph-area", "_hidden-vertical-bar", "_hidden-horizontal-bar");
  inRound.areaLaps.classList.add("in-round__round-area-laps", "graph-area__elements");
  inRound.stats.classList.add("in-round__stats", "modal__stats", "_hidden-stats");
  inRound.start.classList.add("in-round__round-start", "modal__stat");
  inRound.startText.classList.add("in-round__round-start-text", "_stat-text");
  inRound.startValue.classList.add("in-round__round-start-value", "modal__stat-value", "_stat-value");
  inRound.lapStart.classList.add("in-round__lap-start", "modal__stat");
  inRound.lapStartText.classList.add("in-round__lap-start-text", "_stat-text");
  inRound.lapStartValue.classList.add("in-round__lap-start-value", "modal__stat-value", "_stat-value");
  inRound.lapEnd.classList.add("in-round__lap-end", "modal__stat");
  inRound.lapEndText.classList.add("in-round__lap-end-text", "_stat-text");
  inRound.lapEndValue.classList.add("in-round__lap-end-value", "modal__stat-value", "_stat-value");

  inRound.lapCount.classList.add("in-round__lap-count", "modal__stat");
  inRound.lapCountText.classList.add("in-round__lap-count-text", "_stat-text");
  inRound.lapCountValue.classList.add("in-round__lap-count-value", "modal__stat-value", "_stat-value");

  inRound.lapTime.classList.add("in-round__lap-time", "modal__stat");

  inRound.button.classList.add("in-round__to-round-button", "_no-event", "_button");

  inRound.roundNum.classList.add("in-round__roundNum");
  inRound.heatNum.classList.add("in-round__heatNum");

  inRound.tittleName.innerHTML = `<p>${name}</p>`; //Имя
  inRound.tittleRound.innerHTML = `<p>${lap.round}</p>`; //номер раунда

  inRound.roundNum.setAttribute("value", `${lap.roundId}`);
  inRound.heatNum.setAttribute("value", `${lap.heatId}`);

  inRound.exitBtn.innerHTML = "<span></span>";

  let lapHeights = [];
  let lapHeightsSort = [];
  const akcentLap = lap.lapIndex; //Круг, который выбрали

  laps.forEach((lap) => {
    //Считаем круги и вымеряем для Grid
    const intTime = [...lap.lapTime];
    const minute = intTime.shift();
    intTime.shift();
    intTime.splice(2, 4);
    const seconds = intTime.join("");

    const fullSeconds = +seconds + 60 * minute;
    lapHeights.push(fullSeconds);
    lapHeightsSort.push(fullSeconds);
  });

  lapHeightsSort.sort();

  const heightStep = 100 / lapHeightsSort[lapHeightsSort.length - 1];

  for (let i = 0; i <= lapHeights.length; i++) {
    //рисуем столбы 'круги', смотря сколько их
    if (i < lapHeights.length) {
      const roundLap = document.createElement("div");
      const roundColumn = document.createElement("div");
      const roundNode = document.createElement("div");

      roundLap.classList.add("in-round__lap", "_hidden-vertical-stroke", "_hidden-text");
      roundNode.classList.add("in-round__lap-node");
      roundColumn.classList.add("in-round__lap-column", "_hidden-columns");

      roundLap.innerHTML = `<span>${getState("textStrings").inRoundTab.lap} ${i + 1}</span>`;
      roundNode.innerHTML = laps[i].lapTime; //номер круга

      roundColumn.style.height = `${lapHeights[i] * heightStep - 10}%`;

      roundLap.append(roundColumn);
      inRound.areaLaps.append(roundLap, roundNode);
    } else if (i == lapHeights.length) {
      //Добавляем ещё один круг, для замыкающей полоски;
      const roundLap = document.createElement("div");
      roundLap.classList.add("in-round__lap", "_hidden-vertical-stroke", "_hidden-bars", "_hidden-text");
      inRound.areaLaps.append(roundLap);
    }
  }

  inRound.startText.innerHTML = getState("textStrings").inRoundTab.roundStart;
  inRound.startValue.innerHTML = lap.roundTimeStart;

  if (akcentLap.length == 1) {
    // выбрали один круг
    inRound.lapStartText.innerHTML = getState("textStrings").inRoundTab.lapStart;
    inRound.lapEndText.innerHTML = getState("textStrings").inRoundTab.lapEnd;
  } else if (akcentLap.length > 1) {
    //выбрали круги подряд
    inRound.lapStartText.innerHTML = getState("textStrings").inRoundTab.lapsStart;
    inRound.lapEndText.innerHTML = getState("textStrings").inRoundTab.lapsEnd;
  }
  inRound.lapStartValue.innerHTML = lap.lapTimeStart;
  inRound.lapEndValue.innerHTML = lap.lapTimeEnd;

  if (akcentLap.length == 1) {
    // выбрали один круг
    inRound.lapCountText.innerHTML = getState("textStrings").inRoundTab.lapNum;
    inRound.lapCountValue.innerHTML = +akcentLap[0];
    const timeText = document.createElement("div");
    const timeValue = document.createElement("div");
    timeText.classList.add("in-round__lap-time-text", "_stat-text");
    timeValue.classList.add("in-round__lap-time-value", "modal__stat-value", "_stat-value");
    timeText.innerHTML = getState("textStrings").inRoundTab.lapTime;
    timeValue.innerHTML = lap.lapTime;
    inRound.lapTime.append(timeText, timeValue);
  } else if (akcentLap.length > 1) {
    //выбрали круги подря
    inRound.lapCountText.innerHTML = getState("textStrings").inRoundTab.lapsNum;
    inRound.lapCountValue.innerHTML = `${+akcentLap[0]} -${+akcentLap[akcentLap.length - 1]}`;
    for (let i = 0; i < akcentLap.length; i++) {
      const timeText = document.createElement("div");
      const timeValue = document.createElement("div");
      timeText.classList.add("in-round__lap-time-text", "_stat-text");
      timeValue.classList.add("in-round__lap-time-value", "modal__stat-value", "_stat-value");
      timeText.innerHTML = `${getState("textStrings").inRoundTab.lapTime} ${i + 1} `;
      timeValue.innerHTML = lap.lapsData[i].lapTime;
      inRound.lapTime.append(timeText, timeValue);
    }
  }

  inRound.button.innerHTML = getState("textStrings").inRoundTab.goToRound;

  //ищем совпадение лучшего круга и лучших кругов

  const currentLapId = lap.lapId;

  try {
    const lapsData = getLapsByName(name, true);
    const consecutivesData = getConsecutivesByName(name, true);
    const bestLapId = lapsData[0].lapId;
    const bestConsecutiveId = consecutivesData[0].lapId;
    // if(getState('CONSOLE_DEBUG'))console.log('CURR ID', currentLapId);
    // if(getState('CONSOLE_DEBUG'))console.log('BEST LAP ID', bestLapId);
    // if(getState('CONSOLE_DEBUG'))console.log('BEST CONS ID', bestConsecutiveId);
  } catch (error) {
    if (getState("CONSOLE_DEBUG")) console.log("Чего-то нет", error);
  }

  inRound.inRound.append(inRound.container, inRound.roundNum, inRound.heatNum); //собираем HTML
  inRound.container.append(inRound.tittle, inRound.area, inRound.stats, inRound.button);
  inRound.tittle.append(inRound.tittleName, inRound.tittleRound, inRound.exitBtn);
  inRound.area.append(inRound.areaLaps);
  inRound.stats.append(inRound.start, inRound.lapStart, inRound.lapEnd, inRound.lapTime, inRound.lapCount);
  inRound.start.append(inRound.startText, inRound.startValue);
  inRound.lapEnd.append(inRound.lapEndText, inRound.lapEndValue);
  inRound.lapStart.append(inRound.lapStartText, inRound.lapStartValue);
  inRound.lapCount.append(inRound.lapCountText, inRound.lapCountValue);

  akcentLap.forEach((lap, index) => {
    // считаем, сколько ацентных кругов и добавляем акцетные классы
    setTimeout(() => {
      const laps = document.querySelectorAll(".in-round__lap");
      const nodes = document.querySelectorAll(".in-round__lap-node");
      const column = document.querySelectorAll(".in-round__lap-column");

      laps[lap - 1].classList.add("_akcent");
      nodes[lap - 1].classList.add("_akcent");
      column[lap - 1].classList.add("_akcent");
      setTimeout(() => {
        lapNodeShow(nodes[lap - 1], column[lap - 1], 666);
      }, 100 + 666 * index); /// появление времени поочереди, когда кугов много
    }, 1800);
  });

  inRound.areaLaps.style.gridTemplateColumns = `repeat(${lapHeights.length}, 1fr) 2px`; //2px для замыкающей полоски
  return inRound.inRound;
}

export function writeAllLapsHTML(name) {
  const allLaps = {
    allLaps: document.createElement("div"),
    container: document.createElement("div"),
    tittle: document.createElement("div"),
    tittleText: document.createElement("div"),
    exitBtn: document.createElement("div"),

    lapsArea: document.createElement("div"),
    laps: document.createElement("div"),
    solidAnimation: document.createElement("div"),
    slider: document.createElement("input"),

    averageLine: document.createElement("div"),
    maxLine: document.createElement("div"),
    pseudoLap: document.createElement("div"),

    buttons: document.createElement("div"),
    minus: document.createElement("button"),
    buttonsTittle: document.createElement("div"),
    plus: document.createElement("button"),

    stats: document.createElement("div"),
    roundCount: document.createElement("div"),
    roundCountText: document.createElement("div"),
    roundCountValue: document.createElement("div"),

    lapCount: document.createElement("div"),
    lapCountText: document.createElement("div"),
    lapCountValue: document.createElement("div"),

    lapStart: document.createElement("div"),
    lapStartText: document.createElement("div"),
    lapStartValue: document.createElement("div"),

    lapEnd: document.createElement("div"),
    lapEndText: document.createElement("div"),
    lapEndValue: document.createElement("div"),

    lapTime: document.createElement("div"),
    lapTimeText: document.createElement("div"),
    lapTimeValue: document.createElement("div"),
  };

  allLaps.allLaps.classList.add("all-laps", "modal");
  allLaps.container.classList.add("all-laps__container", "_container", "modal__container", "_no-event");
  allLaps.tittle.classList.add("all-laps__tittle", "modal__tittle", "_hidden-tittle");
  allLaps.tittleText.classList.add("all-laps__tittle-text");
  allLaps.exitBtn.classList.add("all-laps__exit-button", "_button-exit");

  allLaps.lapsArea.classList.add("all-laps__laps-area", "graph-area", "_hidden-vertical-stroke", "_lock");
  allLaps.laps.classList.add("all-laps__laps", "graph-area__elements");
  allLaps.solidAnimation.classList.add("all-laps__solid-animation", "_hidden-graph");
  allLaps.slider.classList.add("all-laps__slider", "_hidden-slider");
  allLaps.slider.setAttribute("name", "all-laps__slider");
  allLaps.slider.setAttribute("type", "range");
  allLaps.slider.setAttribute("min", "0");
  allLaps.slider.setAttribute("value", "0");
  allLaps.slider.setAttribute("step", "1");

  allLaps.averageLine.classList.add("all-laps__average-line", "_hidden-horizontal-stroke");
  allLaps.maxLine.classList.add("all-laps__max-line", "_hidden-horizontal-stroke");
  allLaps.pseudoLap.classList.add("all-laps__pseudo-lap");

  allLaps.buttons.classList.add("all-laps__buttons", "_hidden-buttons");
  allLaps.minus.classList.add("all-laps__minus", "_button");
  allLaps.buttonsTittle.classList.add("all-laps__buttons-tittle");
  allLaps.plus.classList.add("all-laps__plus", "_button");

  allLaps.stats.classList.add("all-laps__stats", "modal__stats", "_hidden-stats");

  allLaps.roundCount.classList.add("all-laps__round-count", "modal__stat");
  allLaps.roundCountText.classList.add("all-laps__round-count-text", "_stat-text");
  allLaps.roundCountValue.classList.add("all-laps__round-count-value", "_stat-value");

  allLaps.lapCount.classList.add("all-laps__lap-count", "modal__stat");
  allLaps.lapCountText.classList.add("all-laps__lap-count-text", "_stat-text");
  allLaps.lapCountValue.classList.add("all-laps__lap-count-value", "_stat-value");

  allLaps.lapStart.classList.add("all-laps__lap-start", "modal__stat");
  allLaps.lapStartText.classList.add("all-laps__lap-start-text", "_stat-text");
  allLaps.lapStartValue.classList.add("all-laps__lap-start-value", "_stat-value");

  allLaps.lapEnd.classList.add("all-laps__lap-end", "modal__stat");
  allLaps.lapEndText.classList.add("all-laps__lap-end-text", "_stat-text");
  allLaps.lapEndValue.classList.add("all-laps__lap-end-value", "_stat-value");

  allLaps.lapTime.classList.add("all-laps__lap-time", "modal__stat");
  allLaps.lapTimeText.classList.add("all-laps__lap-time-text", "_stat-text");
  allLaps.lapTimeValue.classList.add("all-laps__lap-time-value", "_stat-value");

  allLaps.tittleText.innerHTML = `<p>${name}</p>`; //Имя которое выбрали
  allLaps.exitBtn.innerHTML = `<span></span>`;
  allLaps.lapsArea.innerHTML = `<span></span>`;

  allLaps.minus.innerHTML = `- `;
  allLaps.buttonsTittle.innerHTML = getState("textStrings").allLapsTab.scale;
  allLaps.plus.innerHTML = `+ `;

  allLaps.roundCountText.innerHTML = getState("textStrings").allLapsTab.roundNum;
  allLaps.roundCountValue.innerHTML = `0`;

  allLaps.lapCountText.innerHTML = getState("textStrings").allLapsTab.lapNum;
  allLaps.lapCountValue.innerHTML = `0`;

  allLaps.lapStartText.innerHTML = getState("textStrings").allLapsTab.lapStart;
  allLaps.lapStartValue.innerHTML = `00:00:00`;

  allLaps.lapEndText.innerHTML = getState("textStrings").allLapsTab.lapEnd;
  allLaps.lapEndValue.innerHTML = `00:00:00`;

  allLaps.lapTimeText.innerHTML = getState("textStrings").allLapsTab.lapTime;
  allLaps.lapTimeValue.innerHTML = `0:00.000`;

  const pilots = getPilotsStats(); //список пилотов

  //   let heat;
  let averageLineValueString;

  pilots.forEach((element) => {
    //тут среди пилотов по имени ищем данные нужного нам
    if (element.name == name) {
      averageLineValueString = element.averageLap; //записываем средлний круг
      // heat = element.heat; //записываем heat пилота
      return;
    }
  });

  const lapsData = getLapsByName(name, false); //берем все круги

  allLaps.slider.setAttribute("max", `${lapsData.length - 1}`); //максимальные ползунковые движения
  allLaps.averageLine.innerHTML = `<span>${averageLineValueString}</span>`; //значение полоски среднего круга

  const lapsDataSorted = getLapsByName(name, true); //берем все круги сортированные, чтобы найти лучший
  const bestId = lapsDataSorted[0].lapId; //id лучшего круга

  let bestConsecutivesId = [];

  try {
    const consecutivesDataSorted = getConsecutivesByName(name, true); //берем все круги подряд сортированные, чтобы найти лучший
    bestConsecutivesId = consecutivesDataSorted[0].lapId; //id лучшего consecutives
  } catch (error) {
    if (getState("CONSOLE_DEBUG")) console.log("Нет подряд");
  }

  const maxLinefloat = lapTimeConverter(averageLineValueString, "float") * 2;
  const maxLineString = lapTimeConverter(maxLinefloat, "string");
  allLaps.maxLine.innerHTML = `<span>${maxLineString}</span>`; //значени полоски максимального круга. Не максимального, а 2x среднего

  const averageLineValueFloat = lapTimeConverter(averageLineValueString, "float"); //переводим среднее время во float

  const svgSecStep = 140 / averageLineValueFloat; //Тут считаем шаг секунды для svg графики

  allLaps.laps.append(allLaps.slider, allLaps.averageLine, allLaps.maxLine, allLaps.pseudoLap); //тут добавляем во все все круги слайдер, псевдо круг, и 2 полоски

  allLaps.slider.style.gridColumn = `span ${lapsData.length + 1} `; //тут делаем полоски и слайдер шириной во все колонки
  allLaps.averageLine.style.gridColumn = `span ${lapsData.length + 1} `;
  allLaps.maxLine.style.gridColumn = `span ${lapsData.length + 1} `;

  for (let i = 0; i <= lapsData.length - 1; i++) {
    //добавляем круги
    const currentTimeFloat = lapTimeConverter(lapsData[i].lapTime, "float"); //время данного круга во float

    const startSvg = currentTimeFloat * svgSecStep; //умножаем секунды на шаг для svg
    //тут записываем значения в svg разметку
    let color;
    if (lapsData[i].lapId == bestId) {
      color = "#66fcf1";
    } else if (bestConsecutivesId.indexOf(lapsData[i].lapId) != -1) {
      // color = '#ff0000'
      color = "#45a293";
    } else {
      // color = '#c5c6c7'
      color = "#324255";
    }

    const svg = `
		<span></span>
			<svg class=all-laps__lap-graph preserveAspectRatio="none" viewbox="0 0 8 280">
				<circle class=all-laps__lap-graph-obj fill=${color} r="4" cx="4" cy="${startSvg}" />
			</svg>
	`;

    const lapElement = document.createElement("div"); //создаем элемент круга
    lapElement.classList.add("all-laps__lap");

    lapElement.innerHTML = svg; //добавляем в него svg
    allLaps.laps.append(lapElement); //закидываем его во все все круги
  }

  allLaps.allLaps.append(allLaps.container);
  allLaps.container.append(allLaps.tittle, allLaps.lapsArea, allLaps.buttons, allLaps.stats);
  allLaps.tittle.append(allLaps.tittleText, allLaps.exitBtn);
  allLaps.lapsArea.append(allLaps.laps, allLaps.solidAnimation);
  allLaps.buttons.append(allLaps.minus, allLaps.buttonsTittle, allLaps.plus);
  allLaps.stats.append(allLaps.roundCount, allLaps.lapCount, allLaps.lapStart, allLaps.lapEnd, allLaps.lapTime);
  allLaps.roundCount.append(allLaps.roundCountText, allLaps.roundCountValue);
  allLaps.lapCount.append(allLaps.lapCountText, allLaps.lapCountValue);
  allLaps.lapStart.append(allLaps.lapStartText, allLaps.lapStartValue);
  allLaps.lapEnd.append(allLaps.lapEndText, allLaps.lapEndValue);

  allLaps.lapTime.append(allLaps.lapTimeText, allLaps.lapTimeValue);

  return allLaps.allLaps;
}

export function writePilotsVs(nameToVs1, nameToVs2) {
  const pilotsVs = {
    pilotsVs: document.createElement("div"),
    container: document.createElement("div"),
    tittle: document.createElement("div"),
    tittleText: document.createElement("div"),
    exitBtn: document.createElement("div"),

    tabsButtons: document.createElement("div"),
    allLapsButton: document.createElement("button"),
    statisticButton: document.createElement("button"),

    tabsWrapper: document.createElement("div"),
    allLapsTab: document.createElement("div"),
    allLapsTabContainer: document.createElement("div"),
    statisticTab: document.createElement("div"),
    statisticTabContainer: document.createElement("div"),
  };

  const pilotsVsAllLaps = {
    lapsArea: document.createElement("div"),
    laps: document.createElement("div"),
    solidAnimation: document.createElement("div"),
    slider: document.createElement("input"),

    averageLine: document.createElement("div"),
    maxLine: document.createElement("div"),
    pseudoLap: document.createElement("div"),

    buttons: document.createElement("div"),
    minus: document.createElement("button"),
    buttonsTittle: document.createElement("div"),
    plus: document.createElement("button"),

    stats: document.createElement("div"),
    roundCount: document.createElement("div"),
    roundCountText: document.createElement("div"),
    roundCountValue: document.createElement("div"),

    lapCount: document.createElement("div"),
    lapCountText: document.createElement("div"),
    lapCountValue: document.createElement("div"),

    lapStart: document.createElement("div"),
    lapStartText: document.createElement("div"),
    lapStartValue: document.createElement("div"),

    lapTime: document.createElement("div"),
    lapTimeText: document.createElement("div"),
    lapTimeValue: document.createElement("div"),
  };

  const pilotsVsStatistic = {
    names: document.createElement("div"),
    name1: document.createElement("div"),
    name2: document.createElement("div"),

    bestLap: document.createElement("div"),
    bestLapTittle: document.createElement("div"),
    bestLapSpoiler: document.createElement("div"),
    bestLapOther: document.createElement("div"),

    bestConsecutive: document.createElement("div"),
    bestConsecutiveTittle: document.createElement("div"),
    bestConsecutiveSpoiler: document.createElement("div"),
    bestConsecutiveOther: document.createElement("div"),

    average: document.createElement("div"),
    averageTittle: document.createElement("div"),

    totalLaps: document.createElement("div"),
    totalLapsTittle: document.createElement("div"),

    starts: document.createElement("div"),
    startsTittle: document.createElement("div"),

    totalTime: document.createElement("div"),
    totalTimeTittle: document.createElement("div"),
  };

  pilotsVs.pilotsVs.classList.add("pilots-vs", "modal");
  pilotsVs.container.classList.add("pilots-vs__container", "_container", "modal__container", "_no-event");
  pilotsVs.tittle.classList.add("pilots-vs__tittle", "modal__tittle", "_hidden-tittle");
  pilotsVs.tittleText.classList.add("pilots-vs__tittle-text");
  pilotsVs.exitBtn.classList.add("pilots-vs__exit-button", "_button-exit");
  pilotsVs.tabsButtons.classList.add("pilots-vs__buttons", "_buttons-wrapper");
  pilotsVs.allLapsButton.classList.add("pilots-vs__all-laps-button", "_button");
  pilotsVs.statisticButton.classList.add("pilots-vs__statistic-button", "_button");

  pilotsVs.tabsWrapper.classList.add("pilots-vs__tabs-wrapper");
  pilotsVs.allLapsTab.classList.add("pilots-vs__all-laps-tab");
  pilotsVs.allLapsTabContainer.classList.add("pilots-vs__all-laps-tab-container");
  pilotsVs.statisticTab.classList.add("pilots-vs__statistic-tab");
  pilotsVs.statisticTabContainer.classList.add("pilots-vs__statistic-tab-container");

  pilotsVsAllLaps.lapsArea.classList.add("pilots-vs__laps-area", "graph-area", "_hidden-vertical-stroke", "_lock");
  pilotsVsAllLaps.laps.classList.add("pilots-vs__laps", "graph-area__elements");
  pilotsVsAllLaps.solidAnimation.classList.add("pilots-vs__solid-animation", "_hidden-graph");
  pilotsVsAllLaps.slider.classList.add("pilots-vs__slider", "_hidden-slider");
  pilotsVsAllLaps.slider.setAttribute("name", "pilots-vs__slider");
  pilotsVsAllLaps.slider.setAttribute("type", "range");
  pilotsVsAllLaps.slider.setAttribute("min", "0");
  pilotsVsAllLaps.slider.setAttribute("value", "0");
  pilotsVsAllLaps.slider.setAttribute("step", 1);
  pilotsVsAllLaps.averageLine.classList.add("pilots-vs__average-line", "_hidden-horizontal-stroke");
  pilotsVsAllLaps.maxLine.classList.add("pilots-vs__max-line", "_hidden-horizontal-stroke");
  pilotsVsAllLaps.pseudoLap.classList.add("pilots-vs__pseudo-lap");
  pilotsVsAllLaps.buttons.classList.add("pilots-vs__scale-buttons", "_hidden-buttons");
  pilotsVsAllLaps.minus.classList.add("pilots-vs__minus", "_button");
  pilotsVsAllLaps.buttonsTittle.classList.add("pilots-vs__buttons-tittle");
  pilotsVsAllLaps.plus.classList.add("pilots-vs__plus", "_button");

  pilotsVsAllLaps.stats.classList.add("pilots-vs__stats", "modal__stats", "_hidden-stats");
  pilotsVsAllLaps.roundCount.classList.add("pilots-vs__round-count", "modal__stat");
  pilotsVsAllLaps.roundCountText.classList.add("pilots-vs__round-count-text", "_stat-text");
  pilotsVsAllLaps.roundCountValue.classList.add("pilots-vs__round-count-value", "_stat-value");
  pilotsVsAllLaps.lapCount.classList.add("pilots-vs__lap-count", "modal__stat");
  pilotsVsAllLaps.lapCountText.classList.add("pilots-vs__lap-count-text", "_stat-text");
  pilotsVsAllLaps.lapCountValue.classList.add("pilots-vs__lap-count-value", "_stat-value");
  pilotsVsAllLaps.lapStart.classList.add("pilots-vs__lap-start", "modal__stat");
  pilotsVsAllLaps.lapStartText.classList.add("pilots-vs__lap-start-text", "_stat-text");
  pilotsVsAllLaps.lapStartValue.classList.add("pilots-vs__lap-start-value", "_stat-value");

  pilotsVsAllLaps.lapTime.classList.add("pilots-vs__lap-time", "modal__stat");
  pilotsVsAllLaps.lapTimeText.classList.add("pilots-vs__lap-time-text", "_stat-text");
  pilotsVsAllLaps.lapTimeValue.classList.add("pilots-vs__lap-time-value", "_stat-value");

  pilotsVsStatistic.names.classList.add("pilots-vs__names");
  pilotsVsStatistic.name1.classList.add("pilots-vs__name", "pilots-vs__name-1");
  pilotsVsStatistic.name2.classList.add("pilots-vs__name", "pilots-vs__name-2");

  pilotsVsStatistic.bestLap.classList.add("pilots-vs__stat-stroke", "pilots-vs__stat-stroke_best-lap");
  pilotsVsStatistic.bestLapTittle.classList.add("pilots-vs__stat-stroke-tittle", "pilots-vs__stat-stroke-tittle_best-lap");
  pilotsVsStatistic.bestLapSpoiler.classList.add("pilots-vs__spoiler-button", "_button-spoiler");
  pilotsVsStatistic.bestLapOther.classList.add("pilots-vs__stat-stroke_best-lap-others");

  pilotsVsStatistic.bestConsecutive.classList.add("pilots-vs__stat-stroke", "pilots-vs__stat-stroke_best-consecutive");
  pilotsVsStatistic.bestConsecutiveTittle.classList.add("pilots-vs__stat-stroke-tittle", "pilots-vs__stat-stroke-tittle_best-consecutive");
  pilotsVsStatistic.bestConsecutiveSpoiler.classList.add("pilots-vs__spoiler-button", "_button-spoiler");
  pilotsVsStatistic.bestConsecutiveOther.classList.add("pilots-vs__stat-stroke_best-consecutive-others");

  pilotsVsStatistic.average.classList.add("pilots-vs__stat-stroke", "pilots-vs__stat-stroke_average");
  pilotsVsStatistic.averageTittle.classList.add("pilots-vs__stat-stroke-tittle", "pilots-vs__stat-stroke-tittle_average");

  pilotsVsStatistic.totalLaps.classList.add("pilots-vs__stat-stroke", "pilots-vs__stat-stroke_total-laps");
  pilotsVsStatistic.totalLapsTittle.classList.add("pilots-vs__stat-stroke-tittle", "pilots-vs__stat-stroke-tittle_total-laps");

  pilotsVsStatistic.starts.classList.add("pilots-vs__stat-stroke", "pilots-vs__stat-stroke_starts");
  pilotsVsStatistic.startsTittle.classList.add("pilots-vs__stat-stroke-tittle", "pilots-vs__stat-stroke-tittle_starts");

  pilotsVsStatistic.totalTime.classList.add("pilots-vs__stat-stroke", "pilots-vs__stat-stroke_total-time");
  pilotsVsStatistic.totalTimeTittle.classList.add("pilots-vs__stat-stroke-tittle", "pilots-vs__stat-stroke-tittle_total-time");

  pilotsVs.exitBtn.innerHTML = "<span></span>";
  pilotsVs.allLapsButton.innerHTML = getState("textStrings").vsTab.laps;
  pilotsVs.statisticButton.innerHTML = getState("textStrings").vsTab.statistic;

  pilotsVsAllLaps.buttonsTittle.innerHTML = getState("textStrings").vsTab.scale;
  pilotsVsAllLaps.plus.innerHTML = "+";
  pilotsVsAllLaps.minus.innerHTML = "-";
  pilotsVsAllLaps.roundCountText.innerHTML = getState("textStrings").vsTab.roundNum;
  pilotsVsAllLaps.lapCountText.innerHTML = getState("textStrings").vsTab.lapNum;
  pilotsVsAllLaps.lapStartText.innerHTML = getState("textStrings").vsTab.roundStart;
  pilotsVsAllLaps.lapTimeText.innerHTML = getState("textStrings").vsTab.lapTime;

  const pilotsAverages = [];
  const pilotsHeats = [];
  let bestConsecutivesIds = [];
  let bestIds = [];

  pilotsVsStatistic.bestLapTittle.innerHTML = getState("textStrings").vsTab.bestLap;
  pilotsVsStatistic.bestConsecutiveTittle.innerHTML =
    getState("language") == "ru" ? `${getState("consecutivesCount")} ${getState("textStrings").pilotsTab.bestConsecutive}` : `${getState("textStrings").pilotsTab.bestConsecutive}`;
  pilotsVsStatistic.averageTittle.innerHTML = getState("textStrings").vsTab.average;
  pilotsVsStatistic.totalLapsTittle.innerHTML = getState("textStrings").vsTab.totalLaps;
  pilotsVsStatistic.startsTittle.innerHTML = getState("textStrings").vsTab.starts;
  pilotsVsStatistic.totalTimeTittle.innerHTML = getState("textStrings").vsTab.totalTime;

  const bestLapOtherElements = [];
  const bestConsecutiveOtherElements = [];

  for (let i = 1; i < 5; i++) {
    const bestLapOtherElement = document.createElement("div");
    const bestConsecutiveOtherElement = document.createElement("div");
    bestLapOtherElement.classList.add("pilots-vs__stat-stroke_best-lap-others-item");
    bestConsecutiveOtherElement.classList.add("pilots-vs__stat-stroke_best-consecutive-others-item");
    bestLapOtherElements.push(bestLapOtherElement);
    bestConsecutiveOtherElements.push(bestConsecutiveOtherElement);

    pilotsVsStatistic.bestLapOther.append(bestLapOtherElements[`${i - 1}`]);
    pilotsVsStatistic.bestConsecutiveOther.append(bestConsecutiveOtherElements[`${i - 1}`]);
  }

  const pilotsVsArr = [nameToVs1, nameToVs2];

  pilotsVs.tittleText.innerHTML = `<p class="pilots-vs_name1">${pilotsVsArr[0]}</p>
	<p>vs</p>
	<p class="pilots-vs_name2">${pilotsVsArr[1]}</p>`;

  pilotsVsStatistic.name1.innerHTML = `${pilotsVsArr[0]}`;
  pilotsVsStatistic.name2.innerHTML = `${pilotsVsArr[1]}`;

  const pilotsFloatTimes = [];

  pilotsVsArr.forEach((pilot, index) => {
    const pilotFloatTimes = {};

    const laps = getLapsByName(pilot, true);
    if (getState("CONSOLE_DEBUG")) console.log("PilotsVSInfoLAPS", laps);

    let consecutives;
    try {
      consecutives = getConsecutivesByName(pilot, true);
    } catch (error) {
      consecutives = [];
      if (getState("CONSOLE_DEBUG")) console.log("Нет 3 Подряд");
    }
    const pilotsInfo = getPilotsStats();
    if (getState("CONSOLE_DEBUG")) console.log("PilotsVSInfoPilots", pilotsInfo);

    const pilotInfo = pilotsInfo.filter((element) => element.name == pilot);

    const bestLapElement = document.createElement("div");
    const bestConsecutiveElement = document.createElement("div");
    const averageElement = document.createElement("div");
    const totalLapsElement = document.createElement("div");
    const startsElement = document.createElement("div");
    const totalTimeElement = document.createElement("div");

    bestLapElement.classList.add("pilots-vs__stat-stroke-value", `pilots-vs__stat-stroke-value_best-lap-${index + 1}`);
    bestConsecutiveElement.classList.add("pilots-vs__stat-stroke-value", `pilots-vs__stat-stroke-value_best-consecutive-${index + 1}`);
    averageElement.classList.add("pilots-vs__stat-stroke-value", `pilots-vs__stat-stroke-value_average-${index + 1}`);
    totalLapsElement.classList.add("pilots-vs__stat-stroke-value", `pilots-vs__stat-stroke-value_total-laps-${index + 1}`);
    startsElement.classList.add("pilots-vs__stat-stroke-value", `pilots-vs__stat-stroke-value_starts-${index + 1}`);
    totalTimeElement.classList.add("pilots-vs__stat-stroke-value", `pilots-vs__stat-stroke-value_total-time-${index + 1}`);

    bestLapElement.innerHTML = laps[0].lapTime;
    pilotFloatTimes.lapTime = lapTimeConverter(laps[0].lapTime, "float");
    bestIds.push(laps[0].lapId);

    try {
      bestConsecutiveElement.innerHTML = consecutives[0].lapTime;
      pilotFloatTimes.consecutiveTime = lapTimeConverter(consecutives[0].lapTime, "float");
      bestConsecutivesIds.push(...consecutives[0].lapId);
    } catch (error) {
      bestConsecutiveElement.innerHTML = `-: --.--- `;
    }

    averageElement.innerHTML = pilotInfo[0].averageLap;
    pilotFloatTimes.average = lapTimeConverter(pilotInfo[0].averageLap, "float");
    pilotsAverages.push(pilotInfo[0].averageLap);

    totalLapsElement.innerHTML = pilotInfo[0].laps;
    pilotFloatTimes.totalLaps = pilotInfo[0].laps;

    pilotsFloatTimes.push(pilotFloatTimes);

    startsElement.innerHTML = pilotInfo[0].starts;
    totalTimeElement.innerHTML = pilotInfo[0].totalTime;

    pilotsVsStatistic.bestLap.append(bestLapElement);
    pilotsVsStatistic.bestConsecutive.append(bestConsecutiveElement);
    pilotsVsStatistic.average.append(averageElement);
    pilotsVsStatistic.totalLaps.append(totalLapsElement);
    pilotsVsStatistic.starts.append(startsElement);
    pilotsVsStatistic.totalTime.append(totalTimeElement);

    for (let i = 1; i < 5; i++) {
      const bestLapOtherItemElement = document.createElement("div");
      const bestConsecutiveOtherItemElement = document.createElement("div");

      bestLapOtherItemElement.classList.add("pilots-vs__stat-stroke-value", `pilots-vs__stat-stroke-value_best-lap-${index + 1}`);
      bestConsecutiveOtherItemElement.classList.add("pilots-vs__stat-stroke-value", `pilots-vs__stat-stroke-value_best-consecutive-${index + 1}`);
      try {
        bestLapOtherItemElement.innerHTML = `${laps[i].lapTime} `;
      } catch (error) {
        bestLapOtherItemElement.innerHTML = `-: --.--- `;
      }
      try {
        bestConsecutiveOtherItemElement.innerHTML = `${consecutives[i].lapTime} `;
      } catch (error) {
        bestConsecutiveOtherItemElement.innerHTML = `-: --.--- `;
      }

      bestLapOtherElements[`${i - 1}`].append(bestLapOtherItemElement);
      bestConsecutiveOtherElements[`${i - 1}`].append(bestConsecutiveOtherItemElement);
    }
  });

  setAkcent(0, 1);
  setAkcent(1, 1);
  setAkcent(2, 1);
  setAkcent(3, 1);

  let floatCounter = 0;

  for (let floatTimeName in pilotsFloatTimes[0]) {
    if (floatCounter < 3) {
      const pilot1Time = pilotsFloatTimes[0][floatTimeName];
      const pilot2Time = pilotsFloatTimes[1][floatTimeName];
      if (pilot1Time > pilot2Time) setAkcent(floatCounter, 2);
      floatCounter++;
      if (getState("CONSOLE_DEBUG")) console.log("floatTime", pilotsFloatTimes[0][floatTimeName]);
    } else {
      const pilot1Time = pilotsFloatTimes[0][floatTimeName];
      const pilot2Time = pilotsFloatTimes[1][floatTimeName];
      if (pilot1Time < pilot2Time) setAkcent(floatCounter, 2);
    }
  }

  const lapsPilot1 = getLapsByName(pilotsVsArr[0], false);
  const lapsPilot2 = getLapsByName(pilotsVsArr[1], false);

  const averageLineFloat = (+lapTimeConverter(pilotsAverages[0], "float") + +lapTimeConverter(pilotsAverages[1], "float")) / 2;
  const averageLineString = lapTimeConverter(averageLineFloat, "string");
  const maxLinefloat = averageLineFloat * 2;
  const maxLineString = lapTimeConverter(maxLinefloat, "string");

  const svgSecStep = 140 / averageLineFloat; //Тут считаем шаг секунды для svg графики

  /*			Тут счётчик раундов, теперь надо счётчик по Heatам.
		const roundByHeat = [];
		pilotsHeats.forEach(heat => {
			try {
				roundByHeat.push(getState("mainObj").heats[heat].rounds.length)
			} catch (error) {
				roundByHeat.push(getState("mainObj").Results.heats[heat].rounds.length)
	
			}
		})
		const roundsCount = Math.max(...roundByHeat);
	
		if(getState('CONSOLE_DEBUG'))console.log('roundByHeat', roundByHeat);
	
		if(getState('CONSOLE_DEBUG'))console.log('roundsCount', roundsCount);
	*/

  /* здесь пробовал сделать пары по хитам, но не получилось как-то, пото понял что не надо
	let checkedHeats1 = [];
	let checkedHeats2 = [];
	
	let heatsArr = [];
	
	
	
	if(getState('CONSOLE_DEBUG'))console.log('classHeats', classHeats);
	
	
	
	for (let i = 0; i < classHeats.length; i++) {
	
		let pilot1Heat = [];
		let pilot2Heat = [];
	
		let heatArr = [];
	
	
		if(getState('CONSOLE_DEBUG'))console.log('checkedHeats1', checkedHeats1);
	
		classHeats.forEach(function (heat) {
			lapsPilot1.forEach(function (lap) {
				if ((lap.heatId == heat) & (pilot1Heat.length != 1) & (!checkedHeats1.includes(heat))) {
					pilot1Heat.push(heat);
					checkedHeats1.push(heat);
				}
			})
		})
	
	
		classHeats.forEach(function (heat) {
			lapsPilot2.forEach(function (lap) {
				if ((lap.heatId == heat) & (pilot2Heat.length != 1) & (!checkedHeats2.includes(heat))) {
					pilot2Heat.push(heat);
					checkedHeats2.push(heat);
				}
			})
		})
	
		const twoPilotsHeat = [...pilot1Heat, ...pilot2Heat]
	
	
	
		heatsArr.push(twoPilotsHeat);
		if(getState('CONSOLE_DEBUG'))console.log('twoPilotsHeat', heatsArr);
	
	}
	
*/

  const classHeats = getState("mainObj").heats_by_class[getState("currentClass")];

  let lapsTimeData = [];
  let roundsInAllHeats1 = {};
  let roundsInAllHeats2 = {};
  let allRoundsInHeats = [];

  classHeats.forEach(function (heatNum) {
    // здесь узнаем, в каком Heatе сколько Roundов;
    const lapsInHeatDataPilot1 = lapsPilot1.filter((lap) => lap.heatId == heatNum);
    const lapsInHeatDataPilot2 = lapsPilot2.filter((lap) => lap.heatId == heatNum);
    let roundsInHeats1;
    let roundsInHeats2;
    try {
      roundsInHeats1 = lapsInHeatDataPilot1[lapsInHeatDataPilot1.length - 1].roundId;
    } catch (error) {
      roundsInHeats1 = 0;
    }

    try {
      roundsInHeats2 = lapsInHeatDataPilot2[lapsInHeatDataPilot2.length - 1].roundId;
    } catch (error) {
      roundsInHeats2 = 0;
    }

    roundsInAllHeats1[heatNum] = roundsInHeats1;
    roundsInAllHeats2[heatNum] = roundsInHeats2;
    allRoundsInHeats.push(roundsInHeats1, roundsInHeats2);
  });

  if (getState("CONSOLE_DEBUG")) console.log("roundsInAllHeats1roundsInAllHeats1", roundsInAllHeats1);
  if (getState("CONSOLE_DEBUG")) console.log("roundsInAllHeats2roundsInAllHeats2", roundsInAllHeats2);

  const maxRoundsInHeats = Math.max(...allRoundsInHeats);

  for (let i = 1; i <= maxRoundsInHeats; i++) {
    classHeats.forEach(function (heatNum) {
      let heatTimeData = [];
      let heatIdData = [];

      const lapsInHeatDataPilot1 = lapsPilot1.filter((lap) => lap.heatId == heatNum && lap.roundId == i);
      const lapsInHeatDataPilot2 = lapsPilot2.filter((lap) => lap.heatId == heatNum && lap.roundId == i);

      const maxLapsInRound = Math.max(lapsInHeatDataPilot1.length, lapsInHeatDataPilot2.length);

      for (let b = 0; b < maxLapsInRound; b++) {
        const lapTimeData = [];
        const lapIdData = [];
        let lapTime1;
        let lapTime2;
        let lapId1;
        let lapId2;

        try {
          lapTime1 = lapTimeConverter(lapsInHeatDataPilot1[b].lapTime, "float");
          lapId1 = lapsInHeatDataPilot1[b].lapId;
        } catch (error) {
          lapTime1 = 0;
          lapId1 = "-";
        }
        try {
          lapTime2 = lapTimeConverter(lapsInHeatDataPilot2[b].lapTime, "float");
          lapId2 = lapsInHeatDataPilot2[b].lapId;
        } catch (error) {
          lapTime2 = 0;
          lapId2 = "-";
        }

        lapTimeData.push(lapTime1, lapTime2);
        lapIdData.push(lapId1, lapId2);

        heatTimeData.push(lapTimeData);
        heatIdData.push(lapIdData);
      }

      lapsTimeData.push(...heatTimeData);
      setState("lapsIdData", [...getState("lapsIdData"), ...heatIdData]);
    });
  }

  pilotsVsAllLaps.slider.style.gridColumn = `span ${lapsTimeData.length + 1}`;
  pilotsVsAllLaps.averageLine.style.gridColumn = `span ${lapsTimeData.length + 1}`;
  pilotsVsAllLaps.maxLine.style.gridColumn = `span ${lapsTimeData.length + 1}`;

  pilotsVsAllLaps.averageLine.innerHTML = `<span>${averageLineString}</span>`;
  pilotsVsAllLaps.maxLine.innerHTML = `<span>${maxLineString}</span>`;

  pilotsVsAllLaps.laps.append(pilotsVsAllLaps.slider, pilotsVsAllLaps.averageLine, pilotsVsAllLaps.maxLine, pilotsVsAllLaps.pseudoLap);

  for (let i = 0; i <= lapsTimeData.length - 1; i++) {
    const lapTimes = lapsTimeData[i];

    const lapElement = document.createElement("div");
    lapElement.classList.add("pilots-vs__lap");
    lapElement.innerHTML = "<span></span>";

    let svg;
    let colors = ["#9445a2", "#66fcf1"];
    let svgPostitions = [lapTimes[0] * svgSecStep, lapTimes[1] * svgSecStep];
    let bestDotRadius = [0, 0];
    let circleRadius = [4, 4];

    lapTimes.forEach((value, index) => {
      if (value == 0) {
        colors[index] = "#0b0c10";
      } else if (bestIds.indexOf(getState("lapsIdData")[i][index]) != -1 || bestConsecutivesIds.indexOf(getState("lapsIdData")[i][index]) != -1) {
        bestDotRadius[index] = 3;
        circleRadius[index] = 4;
      }
    });

    svg = `
		<span></span>
			<svg class=pilots-vs__lap-graph preserveAspectRatio="none" viewbox="0 0 8 280">
				<circle class=pilots-vs__lap-graph-obj fill=${colors[0]} r="${circleRadius[0]}" cx="4" cy="${svgPostitions[0]}" />
				<circle class=pilots-vs__lap-graph-obj fill=${colors[1]} r="${circleRadius[1]}" cx="4" cy="${svgPostitions[1]}" />
				<circle class=pilots-vs__lap-graph-obj fill="#0b0c10" r="${bestDotRadius[0]}" cx="4" cy="${svgPostitions[0]}" />
				<circle class=pilots-vs__lap-graph-obj fill="#0b0c10" r="${bestDotRadius[1]}" cx="4" cy="${svgPostitions[1]}" />

			</svg>
	`;

    lapElement.innerHTML = svg;

    pilotsVsAllLaps.laps.append(lapElement);

    //не работает/////////////////////////////////

    /*const lapGraphCircle = document.createElement('svg');
		lapGraphCircle.classList.add('pilots-vs__lap-graph');
		lapGraphCircle.setAttribute(`preserveAspectRatio`, "none");
		lapGraphCircle.setAttribute("viewbox", "0 0 8 280");
		
		const svgHtml = document.createElement('circle');
		svgHtml.classList.add('pilots-vs__lap-graph-obj')
		svgHtml.setAttribute('fill', `${ '#f00' } `)
		svgHtml.setAttribute('r', `4`)
		svgHtml.setAttribute('cx', `4`)
		svgHtml.setAttribute('cy', `${ 111 } `)
		
		
			lapTimes.forEach((value, index) => {
		
				const startSvg = value * svgSecStep;
				let color;
				if (index) {
					color = '#66fcf1';
				} else {
					color = '#f00';
				}
		
				const svgHtml = document.createElement('circle');
				svgHtml.classList.add('pilots-vs__lap-graph-obj')
				svgHtml.setAttribute('fill', `${ color } `)
				svgHtml.setAttribute('r', `4`)
				svgHtml.setAttribute('cx', `4`)
				svgHtml.setAttribute('cy', `${ startSvg } `)
		
		
				lapGraphCircle.append(svgHtml)
			})*/
    //не работает/////////////////////////////////
  }

  pilotsVs.pilotsVs.append(pilotsVs.container);
  pilotsVs.container.append(pilotsVs.tittle, pilotsVs.tabsButtons, pilotsVs.tabsWrapper);

  pilotsVs.tittle.append(pilotsVs.tittleText, pilotsVs.exitBtn);
  pilotsVs.tabsButtons.append(pilotsVs.allLapsButton, pilotsVs.statisticButton);
  pilotsVs.tabsWrapper.append(pilotsVs.allLapsTab, pilotsVs.statisticTab);

  pilotsVs.allLapsTab.append(pilotsVs.allLapsTabContainer);
  pilotsVs.allLapsTabContainer.append(pilotsVsAllLaps.lapsArea, pilotsVsAllLaps.buttons, pilotsVsAllLaps.stats);
  pilotsVsAllLaps.lapsArea.append(pilotsVsAllLaps.laps, pilotsVsAllLaps.solidAnimation);
  pilotsVsAllLaps.buttons.append(pilotsVsAllLaps.minus, pilotsVsAllLaps.buttonsTittle, pilotsVsAllLaps.plus);
  pilotsVsAllLaps.stats.append(pilotsVsAllLaps.roundCount, pilotsVsAllLaps.lapCount, pilotsVsAllLaps.lapStart, pilotsVsAllLaps.lapTime);

  pilotsVsAllLaps.roundCount.append(pilotsVsAllLaps.roundCountText, pilotsVsAllLaps.roundCountValue);
  pilotsVsAllLaps.lapCount.append(pilotsVsAllLaps.lapCountText, pilotsVsAllLaps.lapCountValue);
  pilotsVsAllLaps.lapStart.append(pilotsVsAllLaps.lapStartText, pilotsVsAllLaps.lapStartValue);
  pilotsVsAllLaps.lapTime.append(pilotsVsAllLaps.lapTimeText, pilotsVsAllLaps.lapTimeValue);

  pilotsVs.statisticTab.append(pilotsVs.statisticTabContainer);
  pilotsVs.statisticTabContainer.append(
    pilotsVsStatistic.names,
    pilotsVsStatistic.bestLap,
    pilotsVsStatistic.bestLapOther,
    pilotsVsStatistic.bestConsecutive,
    pilotsVsStatistic.bestConsecutiveOther,
    pilotsVsStatistic.average,
    pilotsVsStatistic.totalLaps,
    pilotsVsStatistic.starts,
    pilotsVsStatistic.totalTime
  );
  pilotsVsStatistic.names.append(pilotsVsStatistic.name1, pilotsVsStatistic.name2);
  pilotsVsStatistic.bestLap.append(pilotsVsStatistic.bestLapTittle, pilotsVsStatistic.bestLapSpoiler);
  pilotsVsStatistic.bestConsecutive.append(pilotsVsStatistic.bestConsecutiveTittle, pilotsVsStatistic.bestConsecutiveSpoiler);
  pilotsVsStatistic.average.append(pilotsVsStatistic.averageTittle);
  pilotsVsStatistic.totalLaps.append(pilotsVsStatistic.totalLapsTittle);
  pilotsVsStatistic.starts.append(pilotsVsStatistic.startsTittle);
  pilotsVsStatistic.totalTime.append(pilotsVsStatistic.totalTimeTittle);

  return pilotsVs.pilotsVs;
}

export function calendarRender(filesloaded) {
  const daysElement = document.querySelector(".calendar__days");
  const firstDay = new Date(getState("currentMonth").getFullYear(), getState("currentMonth").getMonth(), 1);
  const lastDay = new Date(getState("currentMonth").getFullYear(), getState("currentMonth").getMonth() + 1, 0);

  const monthHeaderElement = document.querySelector(".calendar__current-month");

  monthHeaderElement.innerHTML = `${getState("textStrings").monthsNames[getState("currentMonth").getMonth()]} ${getState("currentMonth").getFullYear()}`;

  const prevMonthDays = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

  const totalDays = 42;
  const nextMonthDays = totalDays - lastDay.getDate() - prevMonthDays;

  const today = new Date();

  daysElement.innerHTML = "";

  for (let i = 1; i <= totalDays; i++) {
    const dayElement = document.createElement("button");
    dayElement.classList.add("calendar__day");

    let dayNumber, isCurrentMonth;

    if (i <= prevMonthDays) {
      dayNumber = new Date(getState("currentMonth").getFullYear(), getState("currentMonth").getMonth(), 0).getDate() - prevMonthDays + i;
      isCurrentMonth = false;
    } else if (i > prevMonthDays + lastDay.getDate()) {
      dayNumber = i - (prevMonthDays + lastDay.getDate());
      isCurrentMonth = false;
    } else {
      dayNumber = i - prevMonthDays;
      isCurrentMonth = true;
    }

    if (getState("currentMonth").getFullYear() == today.getFullYear() && getState("currentMonth").getMonth() == today.getMonth() && dayNumber == today.getDate() && isCurrentMonth) {
      dayElement.classList.add("_day__today");
    }

    let isHaveFiles;
    getState("filesList").forEach((file) => {
      if (file.year == getState("currentMonth").getFullYear() && file.month == getState("currentMonth").getMonth() && file.day == dayNumber && isCurrentMonth) {
        isHaveFiles = true;
        dayElement.classList.add("_day__file");
        if (!file.isFinished) {
          dayElement.classList.add("_live");
        }
      }
    });

    const dateStr = `${getState("currentMonth").getFullYear()}-${getState("currentMonth").getMonth()}-${dayNumber}`;

    if (isHaveFiles) dayElement.id = dateStr;

    if (!isCurrentMonth) {
      dayElement.classList.add("_day__other-month");
    }
    dayElement.innerHTML = dayNumber;

    if (!filesloaded) {
      dayElement.classList.add("_no-files");
    } else {
      const calendarHeaderElement = document.querySelector(".calendar__header");
      calendarHeaderElement.classList.remove("_no-files");
    }
    daysElement.append(dayElement);
  }
}

export function makeRaceClassButtons() {
  //Делаем кнопки Классов
  const classButtonsContainer = document.querySelector(".class-switch-buttons__container");
  const raceClasses = getState("mainObj").classes;

  const raceClassesId = [];
  const raceClassesNames = [];

  //проверяем классы в results и в raceClassesWithFinals
  for (let raceClass in raceClasses) {
    if ((getState("mainObj").heats_by_class[raceClass].length != 0 && raceClasses[raceClass].leaderboard) || getState("raceClassesWithFinals")?.includes(raceClasses[raceClass].id)) {
      raceClassesId.push(raceClasses[raceClass].id);
      raceClassesNames.push({ id: raceClasses[raceClass].id, name: raceClasses[raceClass].name, key: raceClass });
    }
  }

  if (arraysEqual(getState("allRaceClassesId"), raceClassesId)) {
    console.log("Нет новых классов");
    return;
  } else {
    setState("allRaceClassesId", raceClassesId);

    if (document.querySelectorAll(".class-switch-buttons__button").length > 0) {
      document.querySelectorAll(".class-switch-buttons__button").forEach((raceClass) => {
        raceClass.remove();
      });
    }

    raceClassesNames.forEach((raceClass) => {
      const classSwitchButton = document.createElement("button");
      classSwitchButton.classList.add(`class-switch-buttons__class-${raceClass.id}`, "_button", "class-switch-buttons__button");
      classSwitchButton.innerHTML = raceClass.name;
      classButtonsContainer.append(classSwitchButton);
      classSwitchButton.setAttribute("value", `${raceClass.id}`);
      classSwitchButton.addEventListener("click", classSwitch);
    });

    const classSwitchButtons = document.querySelectorAll(".class-switch-buttons__button");

    const url = new URL(window.location);
    const raceclassParam = url.searchParams.get("raceclass");

    if (raceclassParam) {
      classSwitchButtons.forEach((button) => {
        if (button.getAttribute("value") == raceclassParam) {
          button.classList.add("_active", "_no-event");
        }
      });
      setState("currentClass", raceclassParam);
    } else {
      const lastClassButtonSwitch = classSwitchButtons[classSwitchButtons.length - 1];
      lastClassButtonSwitch.classList.add("_active", "_no-event");
      setState("currentClass", lastClassButtonSwitch.getAttribute("value"));
      updateUrl("raceclass", lastClassButtonSwitch.getAttribute("value"));
    }
  }
}

export function newLiveDataHTML() {
  const newDataButton = document.createElement("button");
  newDataButton.classList.add("_button", "new-live-data-button");
  newDataButton.innerHTML = getState("textStrings").newLiveData;
  return newDataButton;
}

export function emptyEventHTML() {
  const emptyModal = document.createElement("div");
  const emptyModalContainer = document.createElement("div");
  const emptyModalTittle = document.createElement("div");
  const emptyModalText = document.createElement("div");
  const emptyModalButtonContainer = document.createElement("div");
  const emptyModalButton = document.createElement("a");

  emptyModal.classList.add("modal", "_active");
  emptyModalContainer.classList.add("modal__container", "_active", "_container", "empty-container");
  emptyModalTittle.classList.add("empty__tittle");
  emptyModalButtonContainer.classList.add("empty__button-container");
  emptyModalText.classList.add("empty__text");
  emptyModalButton.classList.add("_button", "empty__button");

  const nomeButton = document.createElement("div");
  nomeButton.innerHTML = `
          <div class="home _empty">
          <a href="./index.html">
            <img src="/icons/home.svg" alt="" />
          </a>
        </div>`;

  emptyModalTittle.innerHTML = getState("textStrings").emptyTittle;
  emptyModalText.innerHTML = getState("textStrings").emptyText;
  emptyModalButton.innerHTML = getState("textStrings").emptyButton;

  emptyModal.append(emptyModalContainer);
  emptyModalContainer.append(emptyModalTittle, emptyModalText, emptyModalButtonContainer, nomeButton);
  emptyModalButtonContainer.append(emptyModalButton);

  const eventUrl = new URL(window.location.href);
  eventUrl.searchParams.set("uuid", `${getState("isUuid")}`);
  emptyModalButton.href = eventUrl.href;

  return emptyModal;
}

export async function tournamentRender(isTournament, isEmptyHeats, fileType) {
  if (isTournament && !getState("isTournamentTab")) {
    //Добавляем турнирную вкладку, если он есть
    const tournamentTab = document.createElement("div");
    tournamentTab.setAttribute("id", "tournamentTab");
    tournamentTab.classList.add("tournament", "tab");
    document.querySelector(".tabs-wrapper").append(tournamentTab);
    const mainTabs = getTab("main") ? getTab("main") : [{}, {}, {}];
    setTab("main", [...mainTabs, { name: "tournament", opened: false, element: document.querySelector(".tournament") }]);

    //Рендерим её

    setState("reactRoot", createRoot(tournamentTab));

    getState("reactRoot").render(<Tournament fullRHData={getState("fullRHData")} currentClass={getState("currentClass")} />);


    //добавляем кнопку, если ещё нет
    if (!document.querySelector(".buttons__tournament")) {
      const tournamentButton = document.createElement("button");
      tournamentButton.classList.add("buttons__tournament", "_button");
      tournamentButton.innerHTML = "Турнир";
      document.querySelector(".buttons__container").append(tournamentButton);
      addButton("tournament", tournamentButton);

      //добавляем клик по кнопки вкладки
      getButton("tournament").addEventListener("click", function () {

        tabSwitch(getTab("main")[3].name, getTab("main"), "main");
      });
    }
    setState("isTournamentTab", true);
  } else if (getState("isTournamentTab") && isTournament) {
    setTab("main", [
      ...getTab("main"),
      { name: "tournament", opened: document.querySelector(".tournament").classList.contains("_active") ? true : false, element: document.querySelector(".tournament") },
    ]);
  } else if (getState("isTournamentTab") && !isTournament) {
    setState("isTournamentTab", false);
    document.querySelector(".buttons__tournament")?.remove();
    console.log('getState("reactRoot")getState("reactRoot")', getState("reactRoot"));

    getState("reactRoot").unmount();
    setState("reactRoot", null);
    document.getElementById("tournamentTab")?.remove();

    //  unsubscribe("fullRHData", handleUpdate);
    //  unsubscribe("currentClass", raceClassUpdate);
  }

  if (isEmptyHeats) {
    //ДУБЛИРОВАНИЕ КОДА __надо бы переделать StartView
    if (fileType != "classSwitch") {
      //Кнопка поделиться
      const shareElement = document.querySelector(".author__share");

      shareElement.classList.remove("_hide");

      shareElement.addEventListener("click", async function () {
        const urlToCopy = document.querySelector(".author__share-url").textContent;
        try {
          await navigator.clipboard.writeText(urlToCopy);
          shareElement.classList.add("_success");
          const timer = setTimeout(() => {
            shareElement.classList.remove("_success");
            clearTimeout(timer);
          }, 1000);
        } catch (error) {
          console.log("error", error);

          shareElement.classList.add("_error");
          const timer = setTimeout(() => {
            shareElement.classList.remove("_error");
            clearTimeout(timer);
          }, 1000);
        }
      });

      if (fileType == "uuid") {
        const wrapperElement = document.querySelector(".wrapper");
        wrapperElement.classList.add("_loading-hide");

        await new Promise((resolve) => {
          wrapperElement.addEventListener("transitionend", function (e) {
            if (e.target == wrapperElement && e.propertyName == "opacity") {
              resolve();
            }
          });
        });
        document.querySelector(".main").classList.remove("_hide");
        wrapperElement.classList.remove("_loading-hide");
        wrapperElement.classList.remove("_hide");
      } else if (fileType == "last") {
        const lastFileButton = document.querySelector(".last-file__item");
        lastFileButton.classList.remove("_loading");
        lastFileButton.classList.add("_move");

        await new Promise((resolve) => {
          lastFileButton.addEventListener("transitionend", function (e) {
            if (e.propertyName === "transform") {
              resolve();
            }
          });
        });
      } else if (fileType == "date") {
        const fileItemElement = document.querySelector("._uploading-file");
        fileItemElement.classList.add("_hidden");

        await new Promise((resolve) => {
          fileItemElement.addEventListener("transitionend", function (e) {
            if (e.propertyName == "opacity") {
              resolve();
            }
          });
        });
        window.scrollTo({
          top: 0,
        });
      } else if (fileType == "local") {
        getLocalFileElement("button").style.transition = "all 1s ease";
        getLocalFileElement("button").style.transform = `translate(${window.innerWidth / 2 + getLocalFileElement("button").offsetWidth}px, 0px)`; //едем
        getLocalFileElement("label").style.transition = "all 1s ease";
        getLocalFileElement("label").style.transform = `translate(-${window.innerWidth / 2 + getLocalFileElement("label").offsetWidth}px, 0px)`; //едем
        await new Promise((resolve) => {
          getLocalFileElement("button").addEventListener("transitionend", function (e) {
            if (e.propertyName == "transform") {
              resolve();
            }
          });
        });
        window.scrollTo({
          top: 0,
        });
      }

      //Удаляем лишнее из html
      document.querySelector(".last-file").remove();
      document.querySelector(".date-files").remove();
      document.querySelector(".calendar").remove();
      getLocalFileElement("button").remove();
      getLocalFileElement("form").remove();
      getLocalFileElement("tittle").remove();

      //Удаляем классы hidden для нужного
      document.querySelector(".main-tittle").classList.remove("_hidden");
      getButton("container").classList.add("_active");
      document.querySelector(".class-switch-buttons__container").classList.add("_active");
      document.querySelector(".home").classList.remove("_hidden");

      // tabSwitch(getTab("main")[1].name, getTab("main")); //открываем вкладку LEaderboard сразу
    } else {
      //Смена классов
      document.querySelector(".class-switch-buttons__container").classList.remove("_no-event");

      // tabSwitch(getTab("main")[1].name, getTab("main")); //открываем вкладку LEaderboard сразу
    }
  }
}
