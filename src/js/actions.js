import { getState, getTab, setTab, getButton, setState, getDuel, setDuel, getAkcent, addButton } from "./sharedStates.js";
import { writeInRoundHTML, writeAllLapsHTML, writePilotsVs } from "./htmlWriters.jsx";
import { tabSwitch, tabHeightChange, spoilerOnOff, modalOnOff, lapNodeShow, allLapsGraphScale, pilotsVsGraphScale, allLapsGraphChoosing, pilotsVsGraphChoosing, setAkcentValues } from "./uiChange";
import { spoilerButtonAnimation, inRoundShow, allLapsShow, pilotsVsShow } from "./animations";
import { getLapData, getHeatTabsRounds } from "./getDatas";
import { getNumFromText } from "./utils";
import { goToRoundAction } from "./playRound";

export function pilotTabAction(e) {
  //Это события вкладки Pilots

  if (e.target.closest(".pilots__pilot-name")) {
    //если нажата с именем делаем spoilerOn;
    const pilotItem = e.target.parentNode;
    const stats = e.target.nextElementSibling;
    const statsChildren = stats.children;
    if (getState("CONSOLE_DEBUG")) console.log(statsChildren);

    for (let i = 2; i < statsChildren.length - 2; i++) {
      statsChildren[i].classList.toggle("_active");
    }
    e.target.classList.toggle("_active");
    pilotItem.classList.toggle("_active");
    spoilerOnOff(stats, e.target);
  }

  if (e.target.closest("._button-spoiler")) {
    //если нажат спойлер, делам spoilerOn и анимация спойлера
    const parentElement = e.target.parentNode;

    const statsToOpen = e.target.nextElementSibling;
    const allStats = statsToOpen.querySelectorAll("._stat-item");
    const bestTimes = parentElement.querySelectorAll(".pilots__best-lap-time-value");
    const bestConsecutives = parentElement.querySelectorAll(".pilots__best-consecutives-time-value");

    if (getState("CONSOLE_DEBUG")) console.log("STAT", statsToOpen);

    let mainTime;
    const firstTime = allStats[0];
    const firstTimePosition = firstTime.offsetTop;
    let mainTimePosition;

    if (statsToOpen.classList.contains("pilots__best-lap-items")) {
      mainTime = bestTimes[0];
      mainTimePosition = mainTime.offsetTop;
    } else if (statsToOpen.classList.contains("pilots__best-consecutives-items")) {
      mainTime = bestConsecutives[0];
      mainTimePosition = mainTime.offsetTop;
    }

    if (statsToOpen.classList.contains("_active")) {
      mainTime.style.top = null;
    } else {
      if (getState("CONSOLE_DEBUG")) console.log(mainTime);

      if (getState("CONSOLE_DEBUG")) console.log("top", firstTimePosition - mainTimePosition + 10 + 5);

      mainTime.style.top = `${firstTimePosition - mainTimePosition + 10 + 5}px`;
    }

    spoilerButtonAnimation(e.target);
    spoilerOnOff(statsToOpen, e.target);
    const statsTittle = statsToOpen.querySelector(".stats-tittles");
    statsTittle.classList.toggle("_active");
    allStats.forEach((stat, index) => {
      if (index != allStats.length - 1) {
        stat.classList.toggle("_active");
      }
    });
  }

  if (e.target.closest(".pilots__all-laps-button")) {
    //если нажата все круги
    const parent = e.target.closest(".pilots__item");
    const nameElement = parent.querySelector(".pilots__pilot-name");
    const name = nameElement.innerHTML; //ищем имя

    const tabWrapper = document.querySelector(".tabs-wrapper");
    tabWrapper.after(writeAllLapsHTML(name)); //добавляем HTML все круги

    const allLapsElement = document.querySelector(".all-laps");
    const exitButton = document.querySelector(".all-laps__exit-button");
    const allLapsArea = document.querySelector(".all-laps__laps-area");
    const allLapsLaps = document.querySelector(".all-laps__laps");
    const allLapsLap = document.querySelectorAll(".all-laps__lap");
    const pseudoLap = document.querySelector(".all-laps__pseudo-lap");
    const plusBtn = document.querySelector(".all-laps__plus");
    const minusBtn = document.querySelector(".all-laps__minus");
    const slider = document.querySelector(".all-laps__slider");

    //Здесь считаем начальную ширину графика, чтобы влез в контейнер.
    //величину области показа, минус псевдо круг и финальный круг и падинги делим на количество кругов
    //получаем ширину одног круга для Grid
    allLapsLaps.style.gridTemplateColumns = `7px repeat(${allLapsLap.length - 1},${
      (allLapsArea.offsetWidth - pseudoLap.offsetWidth - allLapsLap[allLapsLap.length - 1].offsetWidth - parseInt(getComputedStyle(allLapsArea).paddingLeft) * 2 - 10) / (allLapsLap.length - 1)
    }px)7px`;

    setTimeout(() => {
      //небольшая задержка для подстраховки, чтоб отрисовался html, а потом показывать
      modalOnOff(allLapsElement, true); //Показываем контейнеры
      allLapsShow(allLapsElement, e.target, name);
    }, 10);

    minusBtn.classList.add("_no-event"); //Запрещаем кнопку МИНУС, так как это самый маленький масштаб

    plusBtn.addEventListener("click", () => allLapsGraphScale("plus"));
    minusBtn.addEventListener("click", () => allLapsGraphScale("minus"));
    slider.addEventListener("input", () => allLapsGraphChoosing(name, "_active"));

    allLapsArea.addEventListener("scroll", function () {
      //при скролле двигаются цифры... сомнительно
      const averageLine = document.querySelector(".all-laps__average-line");
      const maxLine = document.querySelector(".all-laps__max-line");
      const averageValue = averageLine.querySelector("span");
      const maxValue = maxLine.querySelector("span");
      averageValue.style.transform = `translate(${allLapsArea.scrollLeft}px, 0)`;
      maxValue.style.transform = `translate(${allLapsArea.scrollLeft}px, 0)`;
    });

    allLapsArea.addEventListener("click", function (e) {
      //клик по графику
      const laps = document.querySelectorAll(".all-laps__lap");
      if (e.target.closest(".all-laps__lap-graph") || e.target.closest(".all-laps__lap-graph-obj")) {
        const currentLap = e.target.closest(".all-laps__lap");
        let currentIndex;
        laps.forEach((element, index) => {
          if (element == currentLap) {
            currentIndex = index;
            return;
          }
        });
        slider.value = currentIndex;
        allLapsGraphChoosing(name, "_active");
      }
    });

    allLapsArea.addEventListener("touchstart", function (e) {
      //старт перетаскивания ползунка
      const currentLap = e.target.closest(".all-laps__lap");
      if (currentLap.classList.contains("_choosed")) {
        currentLap.classList.add("_hold");
        const allLapsAreaHeight = allLapsArea.offsetHeight;
        const allLapsAreaHeightScroll = allLapsArea.clientHeight;
        allLapsArea.style.paddingBottom = `${allLapsAreaHeight - allLapsAreaHeightScroll}px`;
        allLapsArea.classList.add("_lock");
        setState("graphTouchFlag", true);
      }
    });

    allLapsArea.addEventListener("touchend", function (e) {
      //отпустили ползунок
      const allLaps = document.querySelectorAll(".all-laps__lap");
      allLaps.forEach((element) => {
        element.classList.remove("_choosed");
        element.classList.remove("_hold");

        if (element.classList.contains("_active") || element.classList.contains("_active-permanent")) {
          element.classList.add("_choosed");
        }
      });
      allLapsArea.classList.remove("_lock");
      allLapsArea.style.paddingBottom = null;
      setState("graphTouchFlag", false);
    });

    allLapsArea.addEventListener("touchmove", function (e) {
      //тащим ползунок
      const allLapsAreaPosition = allLapsArea.offsetTop;
      const allLapsAreaHalfHeight = allLapsArea.offsetHeight / 2;
      const elem = document.elementFromPoint(e.touches[0].clientX, allLapsAreaPosition + allLapsAreaHalfHeight);
      if (getState("graphTouchFlag")) {
        if (getState("CONSOLE_DEBUG")) console.log("ELEM", elem);

        const laps = document.querySelectorAll(".all-laps__lap");
        const currentLap = elem.closest(".all-laps__lap");
        let currentIndex;
        laps.forEach((element, index) => {
          if (element == currentLap) {
            currentIndex = index;
            return;
          }
        });
        slider.value = currentIndex;
        allLapsGraphChoosing(name, "_active-permanent");
      }
    });

    exitButton.addEventListener("click", function () {
      //Нажимае на крест - выходим
      modalOnOff(allLapsElement, false);
      setTimeout(() => {
        allLapsElement.remove();
      }, 500);
    });
  }

  if (e.target.closest("._button-time")) {
    // Нажатие кнопки времени, готовимся отрисовать inRound

    const parent = e.target.closest(".pilots__item"); //Собираем  информацию о раунде
    const nameElement = parent.querySelector(".pilots__pilot-name");
    const name = nameElement.innerHTML;

    let lapData; //выбраный круг
    let otherLapData; //круги в раунде выбранного

    //Проверяем, круг или подряд
    if (e.target.classList.contains("pilots__best-lap-time-value")) {
      lapData = getLapData(e.target.innerHTML, "lap", name, "current"); //получаем выбранный кргу
      if (getState("CONSOLE_DEBUG")) console.log("LAP DATA", e.target.innerHTML);

      otherLapData = getLapData(e.target.innerHTML, "lap", name, "other"); //получаем отсальные круги раунда

      if (getState("CONSOLE_DEBUG")) console.log("G E T L A P", lapData);
      if (getState("CONSOLE_DEBUG")) console.log("G E T O T H E R", otherLapData);
    }

    //Проверяем, круг или подряд
    if (e.target.classList.contains("pilots__best-consecutives-time-value")) {
      lapData = getLapData(e.target.innerHTML, "consecutive", name, "current"); //получаем выбранные круги подряд
      otherLapData = getLapData(e.target.innerHTML, "consecutive", name, "other"); //получаем остальные круги раунда

      if (getState("CONSOLE_DEBUG")) console.log("G E T C O N S", lapData);
      if (getState("CONSOLE_DEBUG")) console.log("G E T O T H E R", otherLapData);
    }
    if (getState("CONSOLE_DEBUG")) console.log("NAME BEFORE INROUND", lapData);

    getButton("element").after(writeInRoundHTML(lapData, otherLapData, name)); //Отрисовываем inRound

    const inRoundElement = document.querySelector(".in-round");

    setTimeout(() => {
      // таймаут 10мс, чтобы HTML успел отрисоваться, а потом пошла анимация появления
      modalOnOff(inRoundElement, true);
      inRoundShow(inRoundElement, e.target);
    }, 10);

    const exitButton = inRoundElement.querySelector("._button-exit");
    const inRoundArea = inRoundElement.querySelector(".in-round__round-area-laps");

    inRoundArea.addEventListener("click", function (e) {
      //Нажимае на круг - показывается время
      if (e.target.closest(".in-round__lap-column")) {
        const column = e.target;
        const lap = e.target.parentNode;
        const lapNode = lap.nextElementSibling;

        lapNodeShow(lapNode, column, 3000);
      }
    });

    exitButton.addEventListener("click", function () {
      //Нажимае на крест - выходим
      modalOnOff(inRoundElement, false);
      setTimeout(() => {
        inRoundElement.remove();
      }, 500);
    });

    const addButton = document.querySelector(".in-round__to-round-button");

    addButton.addEventListener("click", function () {
      fromInRoundToRoundAction(addButton);
    });
  }

  if (e.target.classList.contains("label__span")) {
    const labelSpan = e.target;
    const labelElement = e.target.parentNode;
    const InputElement = labelElement.nextElementSibling;

    labelElement.classList.toggle("_active");
    InputElement.checked = !InputElement.checked;
    if (getState("CONSOLE_DEBUG")) console.log("labelSpan", labelSpan);
    if (getState("CONSOLE_DEBUG")) console.log("labelElement", labelElement);
    if (getState("CONSOLE_DEBUG")) console.log("InputElement", InputElement.name);
    if (getState("CONSOLE_DEBUG")) console.log("InputElementCheck", InputElement.checked);

    const pilotsVsLabels = document.querySelectorAll(".pilots-vs-form-input__label");
    const pilotsVsInputs = document.querySelectorAll(".pilots-vs-form-input");

    pilotsVsInputs.forEach((value, key) => {
      if (pilotsVsInputs[key].checked && pilotsVsInputs[key].name != getDuel()[0]) {
        setDuel(value.name);
      } else if (!pilotsVsInputs[key].checked && pilotsVsInputs[key].name == InputElement.name) {
        setDuel([]);
      }
    });

    if (getDuel().length == 2) {
      console.log(getDuel()[0]);
      console.log(getDuel()[1]);

      console.log("pilotsVsDuel[0], pilotsVsDuel[1]", getDuel()[0], getDuel()[1]);

      pilotsVsActions(getDuel()[0], getDuel()[1]);

      setTimeout(() => {
        pilotsVsLabels.forEach((label) => {
          label.classList.remove("_active");
        });
        pilotsVsInputs.forEach((value, key) => {
          pilotsVsInputs[key].checked = false;
          setDuel([]);
        });
      }, 500);
    }
  }
}

export function fromInRoundToRoundAction(buttonPressed) {
  // const tittleName = document.querySelector('.in-round__tittle-name')
  // const tittleRound = document.querySelector('.in-round__tittle-round')
  // const nameText = tittleName.firstElementChild.innerHTML;
  // const roundText = tittleRound.firstElementChild.innerHTML;

  // const heatNum = getHeat(nameText)
  // const roundNum = getNumFromText(roundText)

  // if(getState('CONSOLE_DEBUG'))console.log('tittleName', heatNum);
  // if(getState('CONSOLE_DEBUG'))console.log('tittleRound', roundNum);

  const heatNumElement = document.querySelector(".in-round__heatNum");
  const roundNumElement = document.querySelector(".in-round__roundNum");

  if (getState("CONSOLE_DEBUG")) console.log("VALLLLLLLLUW-123123-1-23-12-312", heatNumElement.getAttribute("value"));
  const roundNum = roundNumElement.getAttribute("value");
  const heatNum = heatNumElement.getAttribute("value");

  goToRoundAction(roundNum, heatNum, buttonPressed);

  //Если надо убрать

  // setTimeout(() => {
  // 	const inRoundElement = document.querySelector('.in-round')
  // 	modalOnOff(inRoundElement, false);
  // 	setTimeout(() => {
  // 		inRoundElement.remove();
  // 	}, 50);
  // }, 500);
}

export function leaderboardTabAction(e) {
  const itemsElement = document.querySelector(".leaderboard__items");
  if (e.target.closest(".leaderboard__lap-button")) {
    tabSwitch(getTab("leaderboard")[0].name, getTab("leaderboard"),'leaderboard');

    tabHeightChange(getTab("leaderboard")[0].element, itemsElement, false);

    // setTimeout(() => {
    // 	const tabWidth = tabsLeader[0].element.offsetHeight;
    // 	const itemElementWidth = itemsElement.offsetHeight;

    // 	if (tabWidth > itemElementWidth) itemsElement.style.height = `${ tabWidth + 20 } px`

    // }, getTransitionDurationTime(tabsLeader[0].element));
  }
  if (e.target.closest(".leaderboard__consecutive-button")) {
    tabSwitch(getTab("leaderboard")[1].name, getTab("leaderboard"),'leaderboard');

    tabHeightChange(getTab("leaderboard")[1].element, itemsElement, false);

    // setTimeout(() => {
    // 	const tabWidth = tabsLeader[1].element.offsetHeight;
    // 	const itemElementWidth = itemsElement.offsetHeight;

    // 	if (tabWidth > itemElementWidth) itemsElement.style.height = `${ tabWidth + 20 } px`

    // }, getTransitionDurationTime(tabsLeader[1].element));
  }
  if (e.target.closest(".leaderboard__count-button")) {
    tabSwitch(getTab("leaderboard")[2].name, getTab("leaderboard"),'leaderboard');

    tabHeightChange(getTab("leaderboard")[2].element, itemsElement, false);

    // setTimeout(() => {
    // 	const tabWidth = tabsLeader[2].element.offsetHeight;
    // 	const itemElementWidth = itemsElement.offsetHeight;

    // 	if (tabWidth > itemElementWidth) itemsElement.style.height = `${ tabWidth + 20 } px`
    // }, getTransitionDurationTime(tabsLeader[2].element));
  }
  if (e.target.closest(".leaderboard__average-button")) {
    tabSwitch(getTab("leaderboard")[3].name, getTab("leaderboard"),'leaderboard');

    tabHeightChange(getTab("leaderboard")[3].element, itemsElement, false);

    // setTimeout(() => {
    // 	const tabWidth = tabsLeader[3].element.offsetHeight;
    // 	const itemElementWidth = itemsElement.offsetHeight;

    // 	if (tabWidth > itemElementWidth) itemsElement.style.height = `${ tabWidth + 20 } px`

    // }, getTransitionDurationTime(tabsLeader[3].element));
  }

  if (e.target.closest("._button-time")) {
    const parent = e.target.parentNode; //Собираем  информацию о раунде
    const nameElement = parent.firstElementChild;
    const name = nameElement.children[1].innerHTML;
    // if(getState('CONSOLE_DEBUG'))console.log(name);

    let lapData; //выбраный круг
    let otherLapData; //круги в раунде выбранного

    //Проверяем, круг или подряд
    if (e.target.classList.contains("leaderboard-lap__time")) {
      lapData = getLapData(e.target.innerHTML, "lap", name, "current"); //получаем выбранный кргу
      if (getState("CONSOLE_DEBUG")) console.log("LAP DATA", e.target.innerHTML);

      otherLapData = getLapData(e.target.innerHTML, "lap", name, "other"); //получаем отсальные круги раунда

      if (getState("CONSOLE_DEBUG")) console.log("G E T L A P", lapData);
      if (getState("CONSOLE_DEBUG")) console.log("G E T O T H E R", otherLapData);
    }

    //Проверяем, круг или подряд
    if (e.target.classList.contains("leaderboard-consecutive__time")) {
      lapData = getLapData(e.target.innerHTML, "consecutive", name, "current"); //получаем выбранные круги подряд
      otherLapData = getLapData(e.target.innerHTML, "consecutive", name, "other"); //получаем остальные круги раунда

      if (getState("CONSOLE_DEBUG")) console.log("G E T C O N S", lapData);
      if (getState("CONSOLE_DEBUG")) console.log("G E T O T H E R", otherLapData);
    }

    if (getState("CONSOLE_DEBUG")) console.log("NAME BEFORE INROUND", lapData);

    getButton("element").after(writeInRoundHTML(lapData, otherLapData, name)); //Отрисовываем inRound

    const inRoundElement = document.querySelector(".in-round");

    setTimeout(() => {
      // таймаут 10мс, чтобы HTML успел отрисоваться, а потом пошла анимация появления
      modalOnOff(inRoundElement, true);
      inRoundShow(inRoundElement, e.target);
    }, 10);

    const exitButton = inRoundElement.querySelector("._button-exit");
    const inRoundArea = inRoundElement.querySelector(".in-round__round-area-laps");

    inRoundArea.addEventListener("click", function (e) {
      //Нажимае на круг - показывается время
      if (e.target.closest(".in-round__lap-column")) {
        const column = e.target;
        const lap = e.target.parentNode;
        const lapNode = lap.nextElementSibling;
        lapNodeShow(lapNode, column, 3000);
      }
    });

    exitButton.addEventListener("click", function () {
      //Нажимае на крест - выходим
      modalOnOff(inRoundElement, false);
      setTimeout(() => {
        inRoundElement.remove();
      }, 500);
    });

    const addButton = document.querySelector(".in-round__to-round-button");

    addButton.addEventListener("click", function () {
      fromInRoundToRoundAction(addButton);
    });
  }
}

export function roundsTabAction(e) {
  const itemsElement = document.querySelector(".rounds__items");

  const heatTabs = getHeatTabsRounds();

  heatTabs.forEach((heat, index) => {
    if (e.target.closest(`.rounds__${heat.name} `)) {
      if (getState("CONSOLE_DEBUG")) console.log(`${getState("textStrings").roundsTab.heat} ${heat.name} `);
      tabSwitch(getTab("rounds")[index].name, getTab("rounds"));
      tabHeightChange(getTab("rounds")[index].element, itemsElement, false);
    }
  });

  if (e.target.closest(".rounds__item")) {
    // let roundNum;
    // let heatNum;

    const roundText = e.target.innerHTML;
    let heatText;
    heatTabs.forEach((heat) => {
      if (heat.element.classList.contains("_active")) {
        // const tabName = heat.name;
        // heatText = buttons[tabName].innerHTML;
        heatText = heat.name;
      }
    });

    const roundNum = getNumFromText(roundText);
    const heatNum = getNumFromText(heatText);

    // const heatArr = [...heatText]
    // const heatNums = []
    // heatArr.forEach((el, index) => {
    // 	if (el == el.match(/\d+/g)) {
    // 		heatNums.push(el)
    // 	}
    // 	if (index == heatArr.length - 1) {
    // 		heatNum = heatNums.join('')
    // 	}
    // })

    if (getState("CONSOLE_DEBUG")) console.log(heatNum);
    if (getState("CONSOLE_DEBUG")) console.log(roundNum);

    goToRoundAction(roundNum, heatNum, e.target);
  }
}

export function pilotsVsActions(nameForFunctions1, nameForFunctions2) {
  const html = writePilotsVs(nameForFunctions1, nameForFunctions2);
  const tabwrap = document.querySelector(".tabs-wrapper");
  tabwrap.after(html);
  setAkcentValues(getAkcent());

  const pilotsVsElement = document.querySelector(".pilots-vs");
  const pilotsVsPseudoLap = document.querySelector(".pilots-vs__pseudo-lap");
  const pilotsVsAllLapsArea = document.querySelector(".pilots-vs__laps-area");
  const pilotsVsAllLapsLaps = document.querySelector(".pilots-vs__laps");
  const pilotsVsAllLapsLap = document.querySelectorAll(".pilots-vs__lap");
  const pilotsVsExitBtn = document.querySelector(".pilots-vs__exit-button");
  addButton("pilotsVsAllLaps", document.querySelector(".pilots-vs__all-laps-button"));
  addButton("pilotsVsStatistic", document.querySelector(".pilots-vs__statistic-button"));
  const name1 = document.querySelector(".pilots-vs_name1");
  const name2 = document.querySelector(".pilots-vs_name2");

  pilotsVsAllLapsLaps.style.gridTemplateColumns = `7px repeat(${pilotsVsAllLapsLap.length - 1},${
    (pilotsVsAllLapsArea.offsetWidth -
      pilotsVsPseudoLap.offsetWidth -
      pilotsVsAllLapsLap[pilotsVsAllLapsLap.length - 1].offsetWidth -
      parseInt(getComputedStyle(pilotsVsAllLapsArea).paddingLeft) * 2 -
      10) /
    (pilotsVsAllLapsLap.length - 1)
  }px)7px`;
  setTimeout(() => {
    //небольшая задержка для подстраховки, чтоб отрисовался html, а потом показывать
    modalOnOff(pilotsVsElement, true); //Показываем контейнеры
    pilotsVsShow(pilotsVsElement);
  }, 10);

  setTab("tabsPilotsVs", [
    { name: "pilotsVsAllLaps", opened: false, element: document.querySelector(".pilots-vs__all-laps-tab") },
    { name: "pilotsVsStatistic", opened: false, element: document.querySelector(".pilots-vs__statistic-tab") },
  ]);

  tabSwitch(getTab("tabsPilotsVs")[0].name, getTab("tabsPilotsVs"));
  name1.classList.add("_active");
  name2.classList.add("_active");

  getButton("pilotsVsAllLaps").addEventListener("click", () => {
    tabSwitch(getTab("tabsPilotsVs")[0].name, getTab("tabsPilotsVs"));
    name1.classList.add("_active");
    name2.classList.add("_active");
  });
  getButton("pilotsVsStatistic").addEventListener("click", () => {
    tabSwitch(getTab("tabsPilotsVs")[1].name, getTab("tabsPilotsVs"));
    name1.classList.remove("_active");
    name2.classList.remove("_active");
  });

  const otherLaps = document.querySelector(".pilots-vs__stat-stroke_best-lap-others");
  const otherCons = document.querySelector(".pilots-vs__stat-stroke_best-consecutive-others");
  const spoilerPilotsVs = document.querySelectorAll(".pilots-vs__spoiler-button");

  spoilerPilotsVs[0].addEventListener("click", () => {
    spoilerPilotsVs[0].classList.toggle("_active");
    spoilerOnOff(otherLaps, spoilerPilotsVs[0]);
  });
  spoilerPilotsVs[1].addEventListener("click", () => {
    spoilerPilotsVs[1].classList.toggle("_active");
    spoilerOnOff(otherCons, spoilerPilotsVs[1]);
  });

  pilotsVsGraphChoosing(nameForFunctions1, nameForFunctions2, "_active");

  const pilotsVsPlusBtn = document.querySelector(".pilots-vs__plus");
  const pilotsVsMinusBtn = document.querySelector(".pilots-vs__minus");
  const sliderPilotsVs = document.querySelector(".pilots-vs__slider");

  pilotsVsMinusBtn.classList.add("_no-event");

  pilotsVsPlusBtn.addEventListener("click", () => pilotsVsGraphScale("plus"));
  pilotsVsMinusBtn.addEventListener("click", () => pilotsVsGraphScale("minus"));
  sliderPilotsVs.addEventListener("input", () => pilotsVsGraphChoosing(nameForFunctions1, nameForFunctions2, "_active"));

  pilotsVsAllLapsArea.addEventListener("scroll", function () {
    //при скролле двигаются цифры... сомнительно
    const averageLine = document.querySelector(".pilots-vs__average-line");
    const maxLine = document.querySelector(".pilots-vs__max-line");
    const averageValue = averageLine.querySelector("span");
    const maxValue = maxLine.querySelector("span");
    averageValue.style.transform = `translate(${pilotsVsAllLapsArea.scrollLeft}px, 0)`;
    maxValue.style.transform = `translate(${pilotsVsAllLapsArea.scrollLeft}px, 0)`;
  });

  pilotsVsAllLapsArea.addEventListener("click", function (e) {
    //клик по графику
    const laps = document.querySelectorAll(".pilots-vs__lap");

    if (e.target.closest(".pilots-vs__lap-graph") || e.target.closest(".pilots-vs__lap-graph-obj")) {
      const currentLap = e.target.closest(".pilots-vs__lap");
      let currentIndex;
      laps.forEach((element, index) => {
        if (element == currentLap) {
          currentIndex = index;
          return;
        }
      });
      sliderPilotsVs.value = currentIndex;
      if (getState("CONSOLE_DEBUG")) console.log("sliderPilotsVs.value", sliderPilotsVs.value);

      pilotsVsGraphChoosing(nameForFunctions1, nameForFunctions2, "_active");
    }
  });

  pilotsVsAllLapsArea.addEventListener("touchstart", function (e) {
    //старт перетаскивания ползунка
    const currentLap = e.target.closest(".pilots-vs__lap");
    if (currentLap.classList.contains("_choosed")) {
      currentLap.classList.add("_hold");
      const allLapsAreaHeight = pilotsVsAllLapsArea.offsetHeight;
      const allLapsAreaHeightScroll = pilotsVsAllLapsArea.clientHeight;
      pilotsVsAllLapsArea.style.paddingBottom = `${allLapsAreaHeight - allLapsAreaHeightScroll}px`;
      pilotsVsAllLapsArea.classList.add("_lock");
      setState("graphTouchFlag", true);
    }
  });

  pilotsVsAllLapsArea.addEventListener("touchend", function (e) {
    //отпустили ползунок
    const allLaps = document.querySelectorAll(".pilots-vs__lap");

    allLaps.forEach((element) => {
      element.classList.remove("_hold");
      element.classList.remove("_choosed");
      if (element.classList.contains("_active") || element.classList.contains("_active-permanent")) {
        element.classList.add("_choosed");
      }
    });

    pilotsVsAllLapsArea.classList.remove("_lock");
    pilotsVsAllLapsArea.style.paddingBottom = null;
    setState("graphTouchFlag", false);
  });

  pilotsVsAllLapsArea.addEventListener("touchmove", function (e) {
    //тащим ползунок

    // const pilotsVsAreaPosition = pilotsVsAllLapsArea.offsetTop;
    // const pilotsVsAreaHalfHeight = pilotsVsAllLapsArea.offsetHeight / 2;
    const tabContainer = document.querySelector(".pilots-vs__statistic-tab-container");

    const pilotsVsAreaPosition = tabContainer.offsetTop;
    const pilotsVsAreaHalfHeight = tabContainer.offsetHeight / 2;

    const elem = document.elementFromPoint(e.touches[0].clientX, pilotsVsAreaPosition + pilotsVsAreaHalfHeight);
    if (getState("graphTouchFlag")) {
      if (getState("CONSOLE_DEBUG")) console.log("ELEM", elem);

      const laps = document.querySelectorAll(".pilots-vs__lap");
      const currentLap = elem.closest(".pilots-vs__lap");

      let currentIndex;
      laps.forEach((element, index) => {
        if (element == currentLap) {
          currentIndex = index;
          return;
        }
      });
      sliderPilotsVs.value = currentIndex;
      pilotsVsGraphChoosing(nameForFunctions1, nameForFunctions2, "_active-permanent");
    }
  });

  pilotsVsExitBtn.addEventListener("click", function () {
    //Нажимае на крест - выходим
    modalOnOff(pilotsVsElement, false);
    setTimeout(() => {
      setState("lapsIdData", []);
      pilotsVsElement.remove();
    }, 500);
  });
}
