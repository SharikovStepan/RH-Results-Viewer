import { modalOnOff, tabSwitch, roundStatsStrokeWidthChange, textChange } from "./uiChange";
// import { roundShow } from "./animations";
import { getRound } from "./getDatas";
import { writeRound } from "./htmlWriters.jsx";
import { lapTimeConverter } from "./utils";
import { getState, addButton, setTab, getTab } from "./sharedStates.js";
import { SPEED_NAMES, SPEED_VALUES } from "./consts";

let lastHoleShot;
let pilotsName = [];
let lapsByPilot = {};
let intervals = {};
let lapTimeStep = {};
let lapState = {};
let holeShots = {};
let pilotsIntervalCount = {};
let currentRoundInfo = null;
let roundSpeed = 1.5;
let roundPlayState = "pause";
let intervalButtonsAccept = null;

export function goToRoundAction(round, heat, buttonPressed) {
  const tabWrap = document.querySelector(".tabs-wrapper");
  currentRoundInfo = getRound(+round, +heat);
  tabWrap.after(writeRound(+round, +heat));
  const roundElement = document.querySelector(".round");
  const exitButton = document.querySelector(".round__exit-button");

  setTimeout(() => {
    modalOnOff(roundElement, true);
    roundShow(roundElement, buttonPressed);
  }, 10);
  const pilotsElement = document.querySelector(".round__graph-area-pilots");
  const pilotsPadding = parseInt(getComputedStyle(pilotsElement).paddingRight);
  const scrollWidth = pilotsElement.offsetWidth - pilotsElement.clientWidth;

  pilotsElement.style.paddingRight = `${pilotsPadding - scrollWidth}px`;

  const pilots = document.querySelectorAll(".round__graph-area-pilot");

  pilots.forEach((pilotElement) => {
    const pilotName = pilotElement.querySelector(".round__graph-area-name").innerHTML;
    const pilotLaps = pilotElement.querySelectorAll(".round__graph-area-lap");
    intervals[pilotName] = [];
    lapState[pilotName] = [];
    pilotsIntervalCount[pilotName] = [];
    pilotsName.push(pilotName);
    if (getState("CONSOLE_DEBUG")) console.log(pilotName);
    if (getState("CONSOLE_DEBUG")) console.log(pilotLaps);
    let pilotLapsArr = [];

    pilotLaps.forEach((element, index) => {
      pilotLapsArr.push(element);
      intervals[pilotName].push(null);
      if (index == 0) {
        lapState[pilotName].push(false);
      } else {
        lapState[pilotName].push(false);
      }

      if (index == pilotLaps.length - 1) {
        lapsByPilot[pilotName] = pilotLapsArr;
      }
    });

    currentRoundInfo.forEach((element) => {
      if (element[element.length - 1] == pilotName) {
        const lapQuantity = element.length - 2;
        const times = [];
        for (let i = 0; i <= lapQuantity; i++) {
          if (i == 0) {
            const holeFloat = lapTimeConverter(element[i], "float");
            const holeStep = +holeFloat;
            holeShots[pilotName] = {};
            holeShots[pilotName].timeout = +holeStep.toFixed(0) * 100;
            holeShots[pilotName].state = false;
            holeShots[pilotName].state = null;
          } else {
            const lapTimeFloat = lapTimeConverter(element[i].lapTime, "float");
            const timeStep = +lapTimeFloat;
            if (getState("CONSOLE_DEBUG")) console.log("LAP TIMEEEEEEE", lapTimeFloat);

            times.push(+timeStep.toFixed(0));
            pilotsIntervalCount[pilotName].push(1);
          }
        }
        lapTimeStep[pilotName] = times;
      }
    });
  });

  const slider = document.querySelector(".round__slider");
  slider.oninput = () => speedChange(slider);

  speedChange(slider);

  setTab("round", [
    { name: "view", opened: false, element: document.querySelector(".round__view") },
    { name: "statistic", opened: false, element: document.querySelector(".round__statistic") },
  ]);

  addButton("rounds", document.querySelector(".buttons__rounds"));
  addButton("statistic", document.querySelector(".round__statistic-button"));
  addButton("view", document.querySelector(".round__view-button"));

  const roundButtons = document.querySelector(".round__buttons");
  const roundPlayButton = document.querySelector(".round__play-button");

  roundButtons.addEventListener("click", function (e) {
    const viewButton = roundButtons.querySelector(".round__view-button");
    const statisticButton = roundButtons.querySelector(".round__statistic-button");
    if (e.target == viewButton) {
      tabSwitch(getTab("round")[0].name, getTab("round"));
    }
    if (e.target == statisticButton) {
      tabSwitch(getTab("round")[1].name, getTab("round"));
    }
  });

  roundPlayButton.addEventListener("click", function (e) {
    const paragraph = roundPlayButton.firstElementChild;
    if (roundPlayState == "play") {
      textChange(paragraph, `<p>${getState("textStrings").roundsTab.play}</p>`, 150);
      pauseRound();
      roundPlayState = "pause";
    } else if (roundPlayState == "pause") {
      textChange(paragraph, `<p>${getState("textStrings").roundsTab.pause}</p>`, 150);
      startRound();
      roundPlayState = "play";
    } else if (roundPlayState == "end") {
      for (const nameForLap in lapsByPilot) {
        const laps = lapsByPilot[nameForLap];
        laps.forEach((lap) => {
          lap.style.transition = `all 0.8s ease`;
          lap.style.width = `0%`;
          lap.classList.remove("_akcent");
          setTimeout(() => {
            lap.style.transition = null;
          }, 800);
        });
      }

      const roundPlayButton = document.querySelector(".round__play-button");
      const slider = document.querySelector(".round__slider");
      roundPlayButton.classList.add("_no-event");
      slider.classList.add("_no-event");

      setTimeout(() => {
        textChange(paragraph, `<p>${getState("textStrings").roundsTab.pause}</p>`, 250);
      }, 300);
      setTimeout(() => {
        startRound();
      }, 800);
      roundPlayState = "play";
    }
  });

  exitButton.addEventListener("click", function () {
    //Нажимае на крест - выходим
    pauseRound();
    modalOnOff(roundElement, false);
    setTimeout(() => {
      clearInterval(intervalButtonsAccept);
      for (const holeNames in holeShots) {
        const holeObj = holeShots[holeNames];
        clearInterval(holeObj.interval);
        if (getState("CONSOLE_DEBUG")) console.log("holeObj", holeObj);
      }

      lastHoleShot = false;
      setTab("round", []);
      pilotsName = [];
      lapsByPilot = {};
      intervals = {};
      lapTimeStep = {};
      lapState = {};
      holeShots = {};
      pilotsIntervalCount = {};
      currentRoundInfo = null;
      roundPlayState = "pause";
    }, 400);

    setTimeout(() => {
      roundElement.remove();
    }, 500);
  });

  tabSwitch(getTab("round")[0].name, getTab("round"));
  roundStatsStrokeWidthChange();
}
export function startRound() {
  if (getState("CONSOLE_DEBUG")) console.log("NAMES", pilotsName);
  if (getState("CONSOLE_DEBUG")) console.log("lapsByPilot", lapsByPilot);
  if (getState("CONSOLE_DEBUG")) console.log("intervals", intervals);
  if (getState("CONSOLE_DEBUG")) console.log("lapTimeStep", lapTimeStep);
  if (getState("CONSOLE_DEBUG")) console.log("holeShots", holeShots);
  if (getState("CONSOLE_DEBUG")) console.log("pilotsIntervalCount", pilotsIntervalCount);
  if (getState("CONSOLE_DEBUG")) console.log("lapState", lapState);
  if (getState("CONSOLE_DEBUG")) console.log("roundSpeed", roundSpeed);
  if (getState("CONSOLE_DEBUG")) console.log("playState", roundPlayState);

  if (!lastHoleShot) {
    intervalButtonsAccept = setInterval(() => {
      let holeFullArr = [];
      let holeTruedArr = [];

      pilotsName.forEach((name) => {
        holeFullArr.push(lapState[name][0]);
        holeTruedArr = holeFullArr.filter((el) => el == true);
      });

      if (holeFullArr.length == holeTruedArr.length) {
        lastHoleShot = true;
      }

      if (lastHoleShot == true) {
        if (getState("CONSOLE_DEBUG")) console.log("RJYTWWWWW");
        const roundPlayButton = document.querySelector(".round__play-button");
        const slider = document.querySelector(".round__slider");
        roundPlayButton.classList.remove("_no-event");
        slider.classList.remove("_no-event");
        clearInterval(intervalButtonsAccept);
      }
    }, 100);
  }
  pilotsName.forEach((pilotName) => {
    const laps = lapsByPilot[pilotName];

    laps.forEach((lap, lapIndex) => {
      const fixedRoundSpeed = roundSpeed.toFixed(2);
      const floatLapTimeStep = lapTimeStep[pilotName][lapIndex];
      const fixedLapTimeStep = floatLapTimeStep.toFixed(2);
      const floatIntervalTime = +fixedRoundSpeed * +fixedLapTimeStep;

      const preFixedIntervalTime = +floatIntervalTime.toFixed(2);

      let fixedIntervalTime;
      if (preFixedIntervalTime < 10) {
        const fixedFullNum = preFixedIntervalTime.toFixed(0);
        fixedIntervalTime = `10.${fixedFullNum}`;
      } else {
        fixedIntervalTime = +preFixedIntervalTime.toFixed(2);
      }

      if (!holeShots[pilotName].state) {
        if (getState("CONSOLE_DEBUG")) console.log("HOLESHOTTTTTTTTTT", pilotName);
        holeShots[pilotName].state = true;

        let timeoutMultiplier;
        if (roundSpeed == 1) {
          timeoutMultiplier = 0.5;
        } else {
          timeoutMultiplier = 1;
        }

        holeShots[pilotName].interval = setTimeout(() => {
          lapState[pilotName][0] = true;
          // holeShots[pilotName].state = false;
          if (getState("CONSOLE_DEBUG")) console.log("SETT TIME");
        }, holeShots[pilotName].timeout * +fixedRoundSpeed * timeoutMultiplier);
      }

      // let currentCount = 0;
      // const maxCount = element.laps.length;
      // const intervalTime = 100;

      intervals[pilotName][lapIndex] = setInterval(() => {
			
        // if (pilotName == 'BeeHolder') if(getState('CONSOLE_DEBUG'))console.log('INTERVALLLL', lapIndex);

        if (lapState[pilotName][lapIndex]) {
          let pecrentMultiplaer;
          if (roundSpeed == 1) {
            pecrentMultiplaer = 2;
          } else {
            pecrentMultiplaer = 1;
          }

          if (pilotsIntervalCount[pilotName][lapIndex] * 1 < 100) {
            lap.style.width = `${pilotsIntervalCount[pilotName][lapIndex] * 1}%`;
            pilotsIntervalCount[pilotName][lapIndex] += 1 * pecrentMultiplaer;
          } else {
            lap.style.width = "100%";
            pilotsIntervalCount[pilotName][lapIndex] = 100;
            clearInterval(intervals[pilotName][lapIndex]);

            lapState[pilotName][lapIndex + 1] = true;

            const allLapsState = [];

            for (const counts in pilotsIntervalCount) {
              const pilotCounts = pilotsIntervalCount[counts];
              pilotCounts.forEach((count) => {
                allLapsState.push(count);
              });
            }
            const fullWidthLaps = allLapsState.filter((el) => el == 100);

            if (allLapsState.length == fullWidthLaps.length) {
              // if(getState('CONSOLE_DEBUG'))console.log('В С Ё!!!!');
              endRound();
              roundPlayState = "end";
            }
          }
        }
        // if(getState('CONSOLE_DEBUG'))console.log('fixedIntervalTime', fixedIntervalTime);
      }, +fixedIntervalTime);
    });
  });
}

export function pauseRound() {
  pilotsName.forEach((pilotName) => {
    const intervalArr = intervals[pilotName];
    intervalArr.forEach((inter) => {
      clearInterval(inter);
    });
  });
}

export function endRound() {
  pauseRound();
  const roundPlayButton = document.querySelector(".round__play-button");
  const paragraph = roundPlayButton.firstElementChild;

  textChange(paragraph, `<p>${getState("textStrings").roundsTab.again}</p>`, 150);

  for (const lapp in lapsByPilot) {
    const laps = lapsByPilot[lapp];
    laps.forEach((lapp, index) => {
      laps[index].classList.add("_akcent");
    });
  }

  for (const counts in pilotsIntervalCount) {
    const pilotCounts = pilotsIntervalCount[counts];
    pilotCounts.forEach((count, index) => {
      pilotCounts[index] = 0;
    });
  }

  for (const lap in lapState) {
    const lapsStates = lapState[lap];
    lapsStates.forEach((states, index) => {
      lapsStates[index] = false;
    });
  }

  for (const holeName in holeShots) {
    const holeObj = holeShots[holeName];
    holeObj.state = false;
  }

  lastHoleShot = false;
  clearInterval(intervalButtonsAccept);
}

export function speedChange(sliderElement) {
  pauseRound();
  const speedValue = document.querySelector(".round__speed-value");
  const sliderValue = sliderElement.value;
  roundSpeed = SPEED_VALUES[sliderValue];
  if (getState("CONSOLE_DEBUG")) console.log("LOGG", roundSpeed);

  speedValue.innerHTML = `x${SPEED_NAMES[roundSpeed]}`;

  if (roundPlayState == "play") startRound();
}

export function roundShow(round, buttonRound) {
  const element = {
    container: round.firstElementChild,
    tittle: round.querySelector(".round__tittle"),
    graphArea: round.querySelector(".round__graph-area"),
    buttons: round.querySelector(".round__buttons"),
    exitBtn: round.querySelector(".round__exit-button"),
    slider: round.querySelector(".round__speed-slider"),

    playButton: round.querySelector(".round__play-button"),
    laps: round.querySelectorAll(".round__graph-area-lap-node"),
    names: round.querySelectorAll(".round__graph-area-name"),
  };

  buttonRound.classList.add("_no-event"); //запрещаем кнопку, где время

  setTimeout(() => {
    //удаляем классы 'скрыто'
    element.buttons.classList.remove("_hidden-buttons");
    element.tittle.classList.remove("_hidden-tittle");
    element.graphArea.classList.remove("_hidden-graph-area");
    element.slider.classList.remove("_hidden-slider");
  }, 500);

  setTimeout(() => {
    element.names.forEach((name) => {
      name.classList.remove("_hidden-graph-area-name");
    });
  }, 500);

  setTimeout(() => {
    let currentCount = 0;
    const maxCount = element.laps.length;
    const intervalTime = 80;
    let intervalFunction = setInterval(() => {
      //полоски 'круги' Интервал чтобы поочереди
      element.laps[currentCount].classList.remove("_hidden-graph-area-lap-node");
      currentCount++;
      if (currentCount == maxCount) clearInterval(intervalFunction);
    }, intervalTime);
  }, 500);

  setTimeout(() => {
    element.container.classList.remove("_no-events");
    buttonRound.classList.remove("_no-event");
    element.buttons.classList.remove("_no-event");
    element.exitBtn.classList.remove("_no-event");
    element.playButton.classList.remove("_hidden-play-button");

    const paragraph = element.playButton.firstElementChild;
    textChange(paragraph, `<p>${getState("textStrings").roundsTab.pause}</p>`, 150);
    startRound();
    roundPlayState = "play";
  }, 1100);
}
