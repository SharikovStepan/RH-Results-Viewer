import { getTransitionDurationTime, getMinutesSinceUpload, updateUrl, getParamTabIndex } from "./utils.js";
import { getLapsByName, getHeatTabsRounds, getDateinfo } from "./getDatas.js";
import { pilotTabAction, roundsTabAction, leaderboardTabAction } from "./actions.js";
import { writePilotsHTML, writeLeaderboardHTML, writeRoundsHTML, calendarRender, emptyEventHTML, tournamentRender } from "./htmlWriters.jsx";
import { getButton, getState, setState, addButton, getLocalFileElement, setTab, getTab } from "./sharedStates.js";

export async function startFileView(fileType) {
  try {
    setState("consecutivesCount", getState("mainObj").consecutives_count);
  } catch (error) {
    if (getState("CONSOLE_DEBUG")) console.log("Не найдена информация о consecutives count");
  }

  const heatsNum = getState("mainObj")["heats_by_class"][getState("currentClass")];

  const heatsData =
    Object.entries(getState("mainObj")["heats"])
      .filter(([key]) => heatsNum.includes(+key))
      .map(([, value]) => value) || [];

  //  Object.keys(getState("mainObj").heats).length
  if (heatsData.length == 0 && !getState("raceClassesWithFinals")?.includes(+getState("currentClass"))) {
    //Проверяем, есть ли вообще круги, или только создали
    console.log("ПУСТО!");

    document.querySelector(".main").classList.remove("_hide");
    document.querySelector(".main").append(emptyEventHTML());
  } else if (!heatsData.length && getState("raceClassesWithFinals")?.includes(+getState("currentClass"))) {
    console.log("EMPTY BUT FINAL!!!!");
    document.querySelector(".buttons__pilots").classList.add("_disabled");
    document.querySelector(".buttons__leaderboard").classList.add("_disabled");
    document.querySelector(".buttons__rounds").classList.add("_disabled");

    tournamentRender(true, true, fileType);
  } else {
    document.querySelector(".buttons__pilots").classList.remove("_disabled");
    document.querySelector(".buttons__leaderboard").classList.remove("_disabled");
    document.querySelector(".buttons__rounds").classList.remove("_disabled");

    document.querySelector(".tabs-wrapper").append(writePilotsHTML(), writeLeaderboardHTML(), writeRoundsHTML()); //добавляем HTML пилоты, круги, подряд и раунды

    console.log("StartViewFile", getState("mainObj"));

    //определяем вкладки, чтобы навесить на них событие, тут же информация для tabSwitch функции
    setTab("main", [
      { name: "pilots", opened: false, element: document.querySelector(".pilots") },
      { name: "leaderboard", opened: false, element: document.querySelector(".leaderboard") },
      { name: "rounds", opened: false, element: document.querySelector(".rounds") },
    ]);
   //  const isTournament = getState("raceClassesWithFinals")?.includes(+getState("currentClass")) ? true : false;
	 const isTournament = true

    tournamentRender(isTournament, false, fileType);

    setTab("leaderboard", [
      { name: "lap", opened: false, element: document.querySelector(".leaderboard-lap") },
      { name: "consecutive", opened: false, element: document.querySelector(".leaderboard-consecutive") },
      { name: "count", opened: false, element: document.querySelector(".leaderboard-count") },
      { name: "average", opened: false, element: document.querySelector(".leaderboard-average") },
    ]);
    //Кнопки для Leaderboadr
    addButton("lap", document.querySelector(".leaderboard__lap-button"));
    addButton("consecutive", document.querySelector(".leaderboard__consecutive-button"));
    addButton("count", document.querySelector(".leaderboard__count-button"));
    addButton("average", document.querySelector(".leaderboard__average-button"));

    setTab("rounds", getHeatTabsRounds()); //Получаем 'Вкладки'Heatы для вкладки Rounds
    getTab("rounds").forEach((tab) => addButton(tab.name, document.querySelector(`.rounds__${tab.name}`))); //Добавляем кнопку каждому Heatу

    getTab("main")[0].element.addEventListener("click", pilotTabAction); //открываем события вкладки Pilots
    getTab("main")[1].element.addEventListener("click", leaderboardTabAction); //открываем события вкладки Leaderboard
    getTab("main")[2].element.addEventListener("click", roundsTabAction); //открываем события вкладки Rounds

    const mainTabParam = getParamTabIndex("main");
    console.log("mainTabParammainTabParammainTabParammainTabParam", mainTabParam);

    //переключаемся на вкладку турнира
    if (mainTabParam == -1) {
      updateUrl("main", "pilot");
      tabSwitch(getTab("main")[0].name, getTab("main"), "main", true);
    } else if (mainTabParam != 3) {
      tabSwitch(getTab("main")[getParamTabIndex("main")].name, getTab("main"), "main", true);
    }

    tabSwitch(getTab("leaderboard")[getParamTabIndex("leaderboard")].name, getTab("leaderboard"), "leaderboard", true);

    tabHeightChange(getTab("leaderboard")[0].element, document.querySelector(".leaderboard__items"), true); //динамическая высота окна для Leaderboard

    tabSwitch(getTab("rounds")[0].name, getTab("rounds"));
    tabHeightChange(getTab("rounds")[0].element, document.querySelector(".rounds__items"), true); //динамическая высота окна для Rounds

    ////
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
////////////////////////////////////////////////////////////

export function classSwitch(e) {
  //   console.log(e);

  const curentButton = e.target;
  const allButtons = document.querySelectorAll(".class-switch-buttons__button");
  const buttonsContainer = document.querySelector(".class-switch-buttons__container");
  const raceClassNum = curentButton.getAttribute("value");
  buttonsContainer.classList.add("_no-event");

  allButtons.forEach((button) => {
    if (getState("CONSOLE_DEBUG")) console.log("button", button);
    button.classList.remove("_active", "_no-event");
  });
  curentButton.classList.add("_active", "_no-event");

  tabSwitch("closeAll", getTab("main"));
  setState("currentClass", raceClassNum);

  updateUrl("raceclass", raceClassNum);

  const mainTabParam = getParamTabIndex("main");
  //переключаемся на вкладку турнира
  if (getState("raceClassesWithFinals").includes(+raceClassNum) && mainTabParam == 3) {
    tabSwitch(getTab("main")[mainTabParam].name, getTab("main"), "main", true);
  }

  setTimeout(() => {
    const pilotsTab = document.querySelector(".pilots");
    const leaderboardTab = document.querySelector(".leaderboard");
    const roundsTab = document.querySelector(".rounds");
    pilotsTab?.remove();
    leaderboardTab?.remove();
    roundsTab?.remove();
  }, 50);

  setTimeout(() => {
    startFileView("classSwitch");
  }, 150);
}

export function tabSwitch(toOpen, tabss, tabsName = "none", replace = false) {
  //функция смены вкладок
  let closingtime = 0; //время смены вкладок - перед открытием первой ровна нулю

  const buttonsWrapper = document.querySelectorAll("._buttons-wrapper");
  buttonsWrapper.forEach((btn) => {
    //запрещаем нажатия кнопок, чтобы не открыть 2 вкладки
    btn.classList.add("_no-event");
  });

  tabss.forEach((tab) => {
    if (getButton([tab.name])?.classList.contains("_ready")) {
      if (getState("CONSOLE_DEBUG")) console.log("TRUUUUUE");
      getButton([tab.name]).classList.remove("_ready");
    }
  });

  tabss.forEach((tab) => {
    if (tab.opened) {
      //ищем открытую вкладку, чтобы закрыть
      const tabItems = tab.element.firstElementChild;
      tab.element.classList.remove("_active");
      tabItems.classList.remove("_active");

      closingtime = getTransitionDurationTime(tab.element) / 1.5; //берем время на открытие следующей
      tab.opened = false; //закрыта
      getButton([tab.name]).classList.remove("_active", "_no-event"); //отжимаем кнопку вкладки и позволяем нажиматься

      if (getState("CONSOLE_DEBUG")) console.log("T A B C L O S I N G", tab.element);
    }
  });

  tabss.forEach((tab) => {
    if (toOpen == tab.name) {
      //ищем вкладку, которую открыть'
      getButton([tab.name]).classList.add("_active", "_no-event"); //сразу красим кнопку и запрещаем нажиматься

      const tabItems = tab.element.firstElementChild;
      setTimeout(() => {
        tab.element.classList.add("_active");
        tabItems.classList.add("_active");
        tab.opened = true;

        buttonsWrapper.forEach((btn) => {
          //возвращаем кнопки
          btn.classList.remove("_no-event");
        });
        if (getState("CONSOLE_DEBUG")) console.log("T A B O P E N", tab);
      }, closingtime);

      if (tabsName != "none") {
        updateUrl(tabsName, tab.name, replace);
      }
    }
  });

  if (toOpen == "closeAll") {
    setTimeout(() => {
      buttonsWrapper.forEach((btn) => {
        //возвращаем кнопки
        btn.classList.remove("_no-event");
      });
    }, 500);
  }
}

export function tabHeightChange(tabElement, tabItemsElement, firstState) {
  setTimeout(() => {
    const tabWidth = tabElement.offsetHeight;
    const itemElementWidth = tabItemsElement.offsetHeight;

    if (tabWidth > itemElementWidth || firstState) tabItemsElement.style.height = `${tabWidth + 20}px`;
  }, getTransitionDurationTime(tabElement));
}

export function modalOnOff(element, flag) {
  //включение и отключение модальных окон
  const container = element.firstElementChild;
  const bodyElement = document.body;

  const fullwidth = window.innerWidth;
  const bodyWidth = bodyElement.clientWidth;

  const modalOpened = document.querySelectorAll(".modal");

  if (flag) {
    element.classList.add("_active");
    container.classList.add("_active");
    bodyElement.classList.add("_lock");

    if (modalOpened.length == 1) {
      bodyElement.style.paddingRight = `${fullwidth - bodyWidth}px`;
    }
  } else {
    element.classList.remove("_active");
    container.classList.remove("_active");
    if (modalOpened.length == 1) {
      setTimeout(() => {
        bodyElement.style.paddingRight = null;
        bodyElement.classList.remove("_lock");
      }, getTransitionDurationTime(element));
    }
  }
}

export function spoilerOnOff(elementToOpen, buttonPushed) {
  //открывание и закрывание спойлера
  buttonPushed.classList.add("_no-event"); //запрещаем нажатие кнопки
  if (elementToOpen.classList.contains("_active")) {
    const ElementHeight = elementToOpen.scrollHeight; //считаем высоту открытого спойлера
    elementToOpen.style.maxHeight = `${ElementHeight}px`; //добавляем его в Style
    elementToOpen.classList.remove("_active-height"); //тут удаляем fit-content, но из-за Style ничего не меняется
    setTimeout(() => {
      elementToOpen.style.maxHeight = null; // а тут удаляем style, и он скрывается
      elementToOpen.classList.remove("_active"); //прозрачность добавляем
    }, 10);
  } else {
    elementToOpen.classList.add("_active"); //убираем прозрачность
    const ElementHeight = elementToOpen.scrollHeight; //считаем скрытую высоту
    elementToOpen.style.maxHeight = `${ElementHeight}px`; //добавялем её
    setTimeout(() => {
      elementToOpen.classList.add("_active-height"); //а тут добавляем fit-content, чтобы была адаптивная высота
    }, 520);
  }
  setTimeout(() => {
    buttonPushed.classList.remove("_no-event"); //разрешаем нажатие кнопки
  }, 520);
}

export function lapNodeShow(node, column, time) {
  //появление времени круга в 'inRound'
  let zIndex = 40;
  const allNode = document.querySelectorAll(".in-round__lap-node");
  const lap = column.parentNode;
  const lapLeft = lap.offsetLeft;
  const lapWidth = lap.offsetWidth;
  const columnHeight = column.offsetTop;
  if (getState("CONSOLE_DEBUG")) console.log(columnHeight);

  node.style.left = `${lapLeft + lapWidth / 2}px`;
  node.style.top = `${columnHeight}px`;

  allNode.forEach((node) => {
    if (node.classList.contains("_active")) {
      zIndex++;
    }
  });

  node.classList.add("_active");
  node.style.zIndex = zIndex;
  setTimeout(() => {
    node.classList.remove("_active");
    node.style.zIndex = null;
  }, time);
}

export function allLapsGraphScale(minusPlus) {
  //масштабирование не самое удачое
  const buttons = {
    //кнопки для блокирования нажатий
    all: document.querySelector(".all-laps__buttons"),
    minus: document.querySelector(".all-laps__minus"),
    plus: document.querySelector(".all-laps__plus"),
  };

  const averageLine = document.querySelector(".all-laps__average-line"); //цифры кругов
  const maxLine = document.querySelector(".all-laps__max-line");
  const averageValue = averageLine.querySelector("span");
  const maxValue = maxLine.querySelector("span");

  const laps = document.querySelectorAll(".all-laps__lap"); //каждый круг
  const allLaps = document.querySelector(".all-laps__laps"); //все все круги
  const allLapsArea = document.querySelector(".all-laps__laps-area"); //контейнер для всех всех кругов
  const pseudoLap = document.querySelector(".all-laps__pseudo-lap"); //пустой круг в начале - нужен для того, чтобы слайдер стоял ровно...
  const pseudoLapWidth = pseudoLap.offsetWidth;
  const finalLap = laps[laps.length - 1]; //последний круг, его ширина - ширина полоски span
  const finalLapWidth = finalLap.offsetWidth;
  const padding = parseInt(getComputedStyle(allLapsArea).paddingRight); //отступ для контейнера
  const fullWidth = allLapsArea.offsetWidth - padding * 2; //ширина контейнера
  let lapWidth = laps[0].offsetWidth; //текущая ширина одного круга
  const scroll = allLapsArea.scrollLeft; //текущее положение скроллла
  if (minusPlus == "minus") {
    //уменьшение масштаба
    const scaleStep = lapWidth / 3; //шаг уменьшения масштаба
    buttons.plus.classList.remove("_no-event"); //открываем кнопку ПЛЮС. иногда она может быть закрыта

    if (lapWidth * (laps.length - 1) - scaleStep * (laps.length - 1) > fullWidth) {
      //если это уменьшение всё ещё больше, чем ширина контейнера

      let paddingScroll; //переменные отступа и пустого круга, чтобы при 0 скролле никуда не перемещать
      let pseudoScroll;

      if (scroll) {
        paddingScroll = padding;
        pseudoScroll = pseudoLapWidth;
        averageValue.classList.add("_scroll"); //цифры кругов исчезают
        maxValue.classList.add("_scroll");
      } else {
        //Если нет скролла, то отступы не считаем;
        paddingScroll = 0;
        pseudoScroll = 0;
      }

      const lapsHide = scroll / lapWidth; //считаем сколько кругов скрыто слева
      const scrollTo = scaleStep * lapsHide + paddingScroll + pseudoScroll; //считаем увеличение ширины скрытых кругов слева, и плюс падинг и пустой круг
      buttons.all.classList.add("_no-event"); //блокируем кнопки

      allLaps.style.gridTemplateColumns = `7px repeat(${laps.length - 1},${lapWidth - scaleStep}px)7px`; //уменьшаем все все круги

      averageValue.style.transform = `translate(${scrollTo}px,0)`; //цифры кругов уходят влево
      maxValue.style.transform = `translate(${scrollTo}px,0)`;
      allLaps.style.transform = `translate(${scrollTo}px,0)`; //перемещаем все все круги, чтобы они остались так же, как были

      setTimeout(() => {
        //после анимации...
        allLaps.classList.add("_scroll"); //делаем transition 0s

        const scrollRightCompenstaion = allLaps.scrollWidth - allLapsArea.scrollLeft - allLaps.clientWidth; //Если величина скролла больше, чем можно скролить - это вычтем

        allLaps.style.transform = null; //удаляем перемещение

        if (scrollRightCompenstaion > 0) {
          allLapsArea.scrollBy(`-${scrollTo}`, 0); //скроллим на величину перемещения
        } else {
          allLapsArea.scrollBy(`-${scrollTo + scrollRightCompenstaion}`, 0); //скроллим на величину перемещения с вычетом компенсации
        }

        setTimeout(() => {
          averageValue.classList.remove("_scroll"); //цифры кругов появляются
          maxValue.classList.remove("_scroll");
          allLaps.classList.remove("_scroll"); //возвращаем transition time с небольшой задержкой для страховки
          buttons.all.classList.remove("_no-event"); //открывает возможность нажимать кнопки
        }, 25);
      }, 500);
    } else {
      //если это уменьшение станет меньше, чем ширина контейнера, то...
      //делаем все все круги шириной контейнера,
      allLaps.style.gridTemplateColumns = `7px repeat(${laps.length - 1},${(fullWidth - pseudoLapWidth - finalLapWidth) / (laps.length - 1)}px)7px`;
      buttons.minus.classList.add("_no-event"); //блокируем кнопку МИНУС, так как это финальное уменьшение
    }
  }

  if (minusPlus == "plus") {
    //увеличение масштаба
    const scaleStep = lapWidth / 2; //шаг увеличения
    buttons.minus.classList.remove("_no-event"); //открываем кнопку МИНУС. Иногда она может быть блокирована

    const slider = document.querySelector(".all-laps__slider");
    const lapsShow = fullWidth / (lapWidth + scaleStep); //вычисляем, сколько сейчас влезает кругов в контейнер
    const lapChoosed = slider.value; //круг, который выбран ползунком

    allLaps.style.gridTemplateColumns = `7px repeat(${laps.length - 1},${lapWidth + scaleStep}px)7px`; //увеличиваем все все круги
    let paddingScroll;
    let pseudoScroll;
    if (scroll) {
      paddingScroll = padding;
      pseudoScroll = pseudoLapWidth;
      averageValue.classList.add("_scroll");
      maxValue.classList.add("_scroll");
    } else {
      //Если нет скролла, то отступы не считаем;
      paddingScroll = 0;
      pseudoScroll = 0;
    }

    //вычисляем перемещение - берем новую ширину круга и умножаем её круг, который выбран. Выбраный круг будет в начале.
    //Вычитаем из этого половину кругов, которые влезут в контейнер, чтобы выбранный был посередине.
    //плюсуем падинг и пустой круг
    const translateWidth = (lapWidth + scaleStep) * lapChoosed - (lapWidth + scaleStep) * (lapsShow / 2) + paddingScroll + pseudoScroll;

    if (translateWidth > scroll) {
      //делаем это, когда полученная ширина больше, чем ширина, которую уже проскролили. Иначе скролл будет меньше 0
      buttons.all.classList.add("_no-event"); //блокируем кнопки

      allLaps.style.transform = `translate(-${translateWidth - scroll}px,0)`; //перемещаем на величину, вычитая проскроленную величину

      setTimeout(() => {
        //после анимации...
        allLaps.classList.add("_scroll"); //делаем transition 0s

        allLaps.style.transform = null; //убираем перемещение
        allLapsArea.scrollBy(translateWidth - scroll, 0); //скроллим на величину перемещения
        setTimeout(() => {
          averageValue.classList.remove("_scroll"); //цифры кругов появляются
          maxValue.classList.remove("_scroll");
          allLaps.classList.remove("_scroll"); //возвращаем transition time
          buttons.all.classList.remove("_no-event"); //открываем кнопки
        }, 50);
      }, 500);
    }

    if ((lapWidth + scaleStep) * 3 > fullWidth - finalLapWidth) {
      //если после увеличения кругов влезает только больше трех..
      buttons.plus.classList.add("_no-event"); //..то блокируем кнопку ПЛЮС. Последнее увеличение
    }
  }
}

//ДВЕ ОДИНАКОВЫЕ ФУНКЦИИ
export function pilotsVsGraphScale(minusPlus) {
  //масштабирование не самое удачое
  const buttons = {
    //кнопки для блокирования нажатий
    all: document.querySelector(".pilots-vs__scale-buttons"),
    minus: document.querySelector(".pilots-vs__minus"),
    plus: document.querySelector(".pilots-vs__plus"),
  };

  const averageLine = document.querySelector(".pilots-vs__average-line"); //цифры кругов
  const maxLine = document.querySelector(".pilots-vs__max-line");
  const averageValue = averageLine.querySelector("span");
  const maxValue = maxLine.querySelector("span");

  const laps = document.querySelectorAll(".pilots-vs__lap"); //каждый круг
  const allLaps = document.querySelector(".pilots-vs__laps"); //все все круги
  const allLapsArea = document.querySelector(".pilots-vs__laps-area"); //контейнер для всех всех кругов
  const pseudoLap = document.querySelector(".pilots-vs__pseudo-lap"); //пустой круг в начале - нужен для того, чтобы слайдер стоял ровно...
  const pseudoLapWidth = pseudoLap.offsetWidth;
  const finalLap = laps[laps.length - 1]; //последний круг, его ширина - ширина полоски span
  const finalLapWidth = finalLap.offsetWidth;
  const padding = parseInt(getComputedStyle(allLapsArea).paddingRight); //отступ для контейнера
  const fullWidth = allLapsArea.offsetWidth - padding * 2; //ширина контейнера
  let lapWidth = laps[0].offsetWidth; //текущая ширина одного круга
  if (getState("CONSOLE_DEBUG")) console.log("laps", laps[0]);

  const scroll = allLapsArea.scrollLeft; //текущее положение скроллла
  if (minusPlus == "minus") {
    //уменьшение масштаба
    const scaleStep = lapWidth / 3; //шаг уменьшения масштаба
    buttons.plus.classList.remove("_no-event"); //открываем кнопку ПЛЮС. иногда она может быть закрыта

    if (lapWidth * (laps.length - 1) - scaleStep * (laps.length - 1) > fullWidth) {
      //если это уменьшение всё ещё больше, чем ширина контейнера

      let paddingScroll; //переменные отступа и пустого круга, чтобы при 0 скролле никуда не перемещать
      let pseudoScroll;

      if (scroll) {
        paddingScroll = padding;
        pseudoScroll = pseudoLapWidth;
        averageValue.classList.add("_scroll"); //цифры кругов исчезают
        maxValue.classList.add("_scroll");
      } else {
        //Если нет скролла, то отступы не считаем;
        paddingScroll = 0;
        pseudoScroll = 0;
      }

      const lapsHide = scroll / lapWidth; //считаем сколько кругов скрыто слева
      const scrollTo = scaleStep * lapsHide + paddingScroll + pseudoScroll; //считаем увеличение ширины скрытых кругов слева, и плюс падинг и пустой круг
      buttons.all.classList.add("_no-event"); //блокируем кнопки

      allLaps.style.gridTemplateColumns = `7px repeat(${laps.length - 1},${lapWidth - scaleStep}px)7px`; //уменьшаем все все круги

      averageValue.style.transform = `translate(${scrollTo}px,0)`; //цифры кругов уходят влево
      maxValue.style.transform = `translate(${scrollTo}px,0)`;
      allLaps.style.transform = `translate(${scrollTo}px,0)`; //перемещаем все все круги, чтобы они остались так же, как были

      setTimeout(() => {
        //после анимации...
        allLaps.classList.add("_scroll"); //делаем transition 0s

        const scrollRightCompenstaion = allLaps.scrollWidth - allLapsArea.scrollLeft - allLaps.clientWidth; //Если величина скролла больше, чем можно скролить - это вычтем

        allLaps.style.transform = null; //удаляем перемещение

        if (scrollRightCompenstaion > 0) {
          allLapsArea.scrollBy(`-${scrollTo}`, 0); //скроллим на величину перемещения
        } else {
          allLapsArea.scrollBy(`-${scrollTo + scrollRightCompenstaion}`, 0); //скроллим на величину перемещения с вычетом компенсации
        }

        setTimeout(() => {
          averageValue.classList.remove("_scroll"); //цифры кругов появляются
          maxValue.classList.remove("_scroll");
          allLaps.classList.remove("_scroll"); //возвращаем transition time с небольшой задержкой для страховки
          buttons.all.classList.remove("_no-event"); //открывает возможность нажимать кнопки
        }, 25);
      }, 500);
    } else {
      //если это уменьшение станет меньше, чем ширина контейнера, то...
      //делаем все все круги шириной контейнера,
      allLaps.style.gridTemplateColumns = `7px repeat(${laps.length - 1},${(fullWidth - pseudoLapWidth - finalLapWidth) / (laps.length - 1)}px)7px`;
      buttons.minus.classList.add("_no-event"); //блокируем кнопку МИНУС, так как это финальное уменьшение
    }
  }

  if (minusPlus == "plus") {
    //увеличение масштаба
    const scaleStep = lapWidth / 2; //шаг увеличения
    buttons.minus.classList.remove("_no-event"); //открываем кнопку МИНУС. Иногда она может быть блокирована
    if (getState("CONSOLE_DEBUG")) console.log("lapWidth", lapWidth);

    if (getState("CONSOLE_DEBUG")) console.log("scaleStep", scaleStep);

    const slider = document.querySelector(".pilots-vs__slider");
    const lapsShow = fullWidth / (lapWidth + scaleStep); //вычисляем, сколько сейчас влезает кругов в контейнер
    const lapChoosed = slider.value; //круг, который выбран ползунком
    if (getState("CONSOLE_DEBUG")) console.log("lapChoosed", lapChoosed);

    allLaps.style.gridTemplateColumns = `7px repeat(${laps.length - 1},${lapWidth + scaleStep}px)7px`; //увеличиваем все все круги
    let paddingScroll;
    let pseudoScroll;

    if (scroll) {
      paddingScroll = padding;
      pseudoScroll = pseudoLapWidth;
      averageValue.classList.add("_scroll");
      maxValue.classList.add("_scroll");
    } else {
      //Если нет скролла, то отступы не считаем;
      paddingScroll = 0;
      pseudoScroll = 0;
    }

    //вычисляем перемещение - берем новую ширину круга и умножаем её круг, который выбран. Выбраный круг будет в начале.
    //Вычитаем из этого половину кругов, которые влезут в контейнер, чтобы выбранный был посередине.
    //плюсуем падинг и пустой круг
    const translateWidth = (lapWidth + scaleStep) * lapChoosed - (lapWidth + scaleStep) * (lapsShow / 2) + paddingScroll + pseudoScroll;

    if (translateWidth > scroll) {
      //делаем это, когда полученная ширина больше, чем ширина, которую уже проскролили. Иначе скролл будет меньше 0
      buttons.all.classList.add("_no-event"); //блокируем кнопки

      allLaps.style.transform = `translate(-${translateWidth - scroll}px,0)`; //перемещаем на величину, вычитая проскроленную величину

      setTimeout(() => {
        //после анимации...
        allLaps.classList.add("_scroll"); //делаем transition 0s

        allLaps.style.transform = null; //убираем перемещение
        allLapsArea.scrollBy(translateWidth - scroll, 0); //скроллим на величину перемещения
        setTimeout(() => {
          averageValue.classList.remove("_scroll"); //цифры кругов появляются
          maxValue.classList.remove("_scroll");
          allLaps.classList.remove("_scroll"); //возвращаем transition time
          buttons.all.classList.remove("_no-event"); //открываем кнопки
        }, 50);
      }, 500);
    }

    if ((lapWidth + scaleStep) * 3 > fullWidth - finalLapWidth) {
      //если после увеличения кругов влезает только больше трех..
      buttons.plus.classList.add("_no-event"); //..то блокируем кнопку ПЛЮС. Последнее увеличение
    }
  }
}

export function allLapsGraphChoosing(name, classForSpan) {
  const laps = document.querySelectorAll(".all-laps__lap");
  const slider = document.querySelector(".all-laps__slider");

  //   const heat = getHeat(name);
  const lapsData = getLapsByName(name, false);

  const stat = {
    roundCount: document.querySelector(".all-laps__round-count-value"),
    lapCount: document.querySelector(".all-laps__lap-count-value"),
    lapStart: document.querySelector(".all-laps__lap-start-value"),
    lapEnd: document.querySelector(".all-laps__lap-end-value"),
    lapTime: document.querySelector(".all-laps__lap-time-value"),
  };

  const roundCount = lapsData[slider.value].round;
  const lapCount = lapsData[slider.value].lapIndex;
  const lapStart = lapsData[slider.value].lapTimeStart;
  const lapEnd = lapsData[slider.value].lapTimeEnd;
  const lapTime = lapsData[slider.value].lapTime;

  stat.roundCount.innerHTML = roundCount;
  stat.lapCount.innerHTML = lapCount;
  stat.lapStart.innerHTML = lapStart;
  stat.lapEnd.innerHTML = lapEnd;
  stat.lapTime.innerHTML = lapTime;

  laps[slider.value].classList.add(classForSpan);
  laps.forEach((lap, index) => {
    if (index != slider.value) {
      lap.classList.remove("_active");
      lap.classList.remove("_active-permanent");
    }
  });
}
//ЕЩЁ ДВЕ ОДИНАКОВЫЕ ФУНКЦИИ
export function pilotsVsGraphChoosing(name1, name2, classForSpan) {
  const laps = document.querySelectorAll(".pilots-vs__lap");
  const vsSlider = document.querySelector(".pilots-vs__slider");

  const lapsDatas = [getLapsByName(name1, false), getLapsByName(name2, false)];

  const stat = {
    roundCount: document.querySelector(".pilots-vs__round-count-value"),
    lapCount: document.querySelector(".pilots-vs__lap-count-value"),
    lapStart: document.querySelector(".pilots-vs__lap-start-value"),
    lapTime: document.querySelector(".pilots-vs__lap-time-value"),
  };

  const currentLapsId = getState("lapsIdData")[vsSlider.value];

  const currentLapsData = [];

  lapsDatas.forEach((arr, index) => {
    let lapData = arr.filter((el) => el.lapId == currentLapsId[index]);
    // if(getState('CONSOLE_DEBUG'))console.log('LAPPPPDATA', ...lapData);
    if (lapData == "") {
      lapData = ["-"];
    }
    currentLapsData.push(...lapData);
  });

  // let roundCount;			Тут раунд был один и тот же у двух пилотов;
  // currentLapsData.forEach(lapData => {
  // 	const round = lapData.round
  // 	if (round) {
  // 		roundCount = round
  // 	}
  // })

  const roundCounts = {};
  currentLapsData.forEach((lapData, index) => {
    const roundCount = lapData.round;
    if (getState("CONSOLE_DEBUG")) console.log("lapData.round", lapData.round);

    if (roundCount) {
      roundCounts[index] = roundCount;
    } else {
      roundCounts[index] = "-";
    }
  });

  const lapCounts = {};
  currentLapsData.forEach((lapData, index) => {
    const lapCount = lapData.lapIndex;
    if (lapCount) {
      lapCounts[index] = lapCount[0];
    } else {
      lapCounts[index] = "-";
    }
  });

  const lapStarts = {};
  currentLapsData.forEach((lapData, index) => {
    const lapStart = lapData.lapTimeStart;
    if (lapStart) {
      lapStarts[index] = lapStart;
    } else {
      lapStarts[index] = "--:--:--";
    }
  });

  const lapTimes = {};
  currentLapsData.forEach((lapData, index) => {
    const lapTime = lapData.lapTime;
    if (lapTime) {
      lapTimes[index] = lapTime;
    } else {
      lapTimes[index] = "-:--.---";
    }
  });

  // if(getState('CONSOLE_DEBUG'))console.log('roundCount', roundCount);

  // if(getState('CONSOLE_DEBUG'))console.log('lapTimes', lapTimes);
  // if(getState('CONSOLE_DEBUG'))console.log('lapStarts', lapStarts);
  // if(getState('CONSOLE_DEBUG'))console.log('lapCounts', lapCounts);

  // stat.roundCount.innerHTML = roundCount   Это когда раунд был один для двух пилотов
  stat.roundCount.innerHTML = `<p>${roundCounts[0]}</p><p>${roundCounts[1]}</p>`;
  stat.lapCount.innerHTML = `<p>${lapCounts[0]}</p><p>${lapCounts[1]}</p>`;
  stat.lapStart.innerHTML = `<p>${lapStarts[0]}</p><p>${lapStarts[1]}</p>`;
  stat.lapTime.innerHTML = `<p>${lapTimes[0]}</p><p>${lapTimes[1]}</p>`;

  laps[vsSlider.value].classList.add(classForSpan);
  if (getState("CONSOLE_DEBUG")) console.log("vsSlider.value", vsSlider.value);

  laps.forEach((lap, index) => {
    if (index != vsSlider.value) {
      lap.classList.remove("_active");
      lap.classList.remove("_active-permanent");
    }
  });
}

export function roundStatsStrokeWidthChange() {
  const statWindow = document.querySelector(".statistic__full-round");

  if (statWindow) {
    const allNames = document.querySelectorAll(".statistic__names-item");
    const statWindowWidth = statWindow.clientWidth;

    if (getState("CONSOLE_DEBUG")) console.log("statWindowWidth", statWindowWidth);

    const padding = parseInt(getComputedStyle(statWindow).paddingLeft);

    allNames.forEach((stroke) => {
      const span = stroke.firstElementChild;
      span.style.width = `${statWindowWidth - padding * 2}px`;
      if (getState("CONSOLE_DEBUG")) console.log("span", span);
    });
  }
}

export function smoothTextChange(elementToChange, text) {
  // исчезновление и появление текста
  elementToChange.style.color = "rgba(255,255,255,0.0)";
  setTimeout(() => {
    elementToChange.innerHTML = text;
    elementToChange.style.color = null;
  }, getTransitionDurationTime(elementToChange));
}

export function textChange(elementWithText, textToChange, time) {
  elementWithText.style.opacity = 0;
  elementWithText.style.transform = `scale(0.9)`;
  elementWithText.style.transition = `opacity ${time}ms ease ${time / 2}ms,transform ${time}ms ease 0ms`;
  setTimeout(() => {
    elementWithText.innerHTML = `${textToChange}`;
    elementWithText.style.opacity = 1;
    elementWithText.style.transform = `scale(1.0)`;
    elementWithText.style.transition = `opacity ${time}ms ease 0ms,transform ${time}ms ease ${time / 2}ms`;

    setTimeout(() => {
      elementWithText.style.opacity = null;
      elementWithText.style.transform = null;
      elementWithText.style.transition = null;
    }, time);
  }, time);
}

export function setAkcentValues(akcentArrHere) {
  const akcentElements = {
    bestLap1: document.querySelector(".pilots-vs__stat-stroke-value_best-lap-1"),
    bestLap2: document.querySelector(".pilots-vs__stat-stroke-value_best-lap-2"),

    bestConsecutive1: document.querySelector(".pilots-vs__stat-stroke-value_best-consecutive-1"),
    bestConsecutive2: document.querySelector(".pilots-vs__stat-stroke-value_best-consecutive-2"),

    average1: document.querySelector(".pilots-vs__stat-stroke-value_average-1"),
    average2: document.querySelector(".pilots-vs__stat-stroke-value_average-2"),

    totalLaps1: document.querySelector(".pilots-vs__stat-stroke-value_total-laps-1"),
    totalLaps2: document.querySelector(".pilots-vs__stat-stroke-value_total-laps-2"),
  };

  if (getState("CONSOLE_DEBUG")) console.log("akcentElements", akcentArrHere[2]);
  // if(getState('CONSOLE_DEBUG'))console.log('');

  akcentElements[`bestLap${akcentArrHere[0]}`].classList.add("_akcent");
  akcentElements[`bestConsecutive${akcentArrHere[1]}`].classList.add("_akcent");
  akcentElements[`average${akcentArrHere[2]}`].classList.add("_akcent");
  akcentElements[`totalLaps${akcentArrHere[3]}`].classList.add("_akcent");
}

export async function moveMonth(start, stop) {
  const daysElement = document.querySelector(".calendar__days");
  const prevButton = document.querySelector(".calendar__prev-month");
  const nextButton = document.querySelector(".calendar__next-month");

  prevButton.classList.remove("_disabled");
  nextButton.classList.remove("_disabled");
  prevButton.classList.add("_no-event");
  nextButton.classList.add("_no-event");

  const dateFilesElement = document.querySelector(".date-files__items");
  dateFilesElement.classList.add("_hidden");

  const monthHeaderElement = document.querySelector(".calendar__current-month");

  monthHeaderElement.classList.add(`_hidden-${start}`);
  daysElement.classList.add(`_hidden-${start}`);

  await new Promise((resolve) => {
    daysElement.addEventListener("transitionend", resolve, { once: true });
  });

  daysElement.style.transition = "none";
  monthHeaderElement.style.transition = "none";
  daysElement.classList.remove(`_hidden-${start}`);
  monthHeaderElement.classList.remove(`_hidden-${start}`);
  monthHeaderElement.classList.add(`_hidden-${stop}`);
  daysElement.classList.add(`_hidden-${stop}`);

  await new Promise((resolve) => requestAnimationFrame(resolve));

  if (start == "right") {
    getState("currentMonth").setMonth(getState("currentMonth").getMonth() - 1);
  } else if (start == "left") {
    getState("currentMonth").setMonth(getState("currentMonth").getMonth() + 1);
  }
  calendarRender(true);

  await new Promise((resolve) => requestAnimationFrame(resolve));

  dateFilesElement.innerHTML = "";
  daysElement.style.transition = "";
  monthHeaderElement.style.transition = "";
  monthHeaderElement.classList.remove(`_hidden-${stop}`);
  daysElement.classList.remove(`_hidden-${stop}`);
  prevButton.classList.remove("_no-event");
  nextButton.classList.remove("_no-event");
  const present = new Date();

  if (getState("currentMonth").getMonth() - present.getMonth() >= 0 && present.getFullYear() == getState("currentMonth").getFullYear()) {
    nextButton.classList.add("_disabled");
  }
}

export async function setTittle(fileUuid) {
  const mainDisplayName = document.querySelector(".main-tittle__display-name");
  const mainDate = document.querySelector(".main-tittle__date");
  const mainTime = document.querySelector(".main-tittle__time");
  if (fileUuid) {
    if (getState("filesListLoaded") == false) {
      await getState("fileListPending");
    }
    const fileInfo = getState("filesList").find((file) => {
      return file.uuid == fileUuid;
    });
    //  console.log("fileInfofileInfo", getState("filesList"));

    mainDisplayName.innerHTML = fileInfo.eventName;
    mainDate.innerHTML = `${fileInfo.day} ${getState("textStrings").monthsNames[fileInfo.month]} ${fileInfo.year}`;
    mainTime.innerHTML = `${fileInfo.hours}:${fileInfo.minutes}`;
  } else {
    const day = getDateinfo("day");
    const year = getDateinfo("year");
    const time = getDateinfo("time");
    mainDate.innerHTML = `${day} ${year}`;
    mainTime.innerHTML = `${time}`;
    mainDisplayName.remove();
  }
}
