import { getState } from "./sharedStates";
import { timeSumer, lapTimeSumer, fromFloatToString, lapTimeConverter } from "./utils";

export function getLapsByName(name, sorted) {
  // const data = mainObj.heats[heat].rounds;			//Когда искали в Heat, ниже будем искать во всех Heatах

  const heatsData = getState("mainObj").heats;

  //Тут будет переменная для Heatов класса;
  const classHeats = getState("mainObj").heats_by_class[getState("currentClass")];

  let allLapsFloat = [];
  let allLapsTime = [];
  let allLapsData = [];
  let allLapsDataSorted = [];

  let allRoundsData = []; //Вместо раундов в одном Heatе, найдем все все раунды из всех heatов.

  for (const heat in heatsData) {
    if (classHeats.includes(+heat)) {
      const heatName = heatsData[heat].displayname;
      const rounds = heatsData[heat].rounds;
      rounds.forEach(function (round) {
        round.heatName = heatName;
        round.heatId = heat;
        allRoundsData.push(round);
      });
    }
  }
  if (getState("CONSOLE_DEBUG")) console.log("allRounsData", allRoundsData);

  allRoundsData.forEach(function (round) {
    //Заходим в каждый раунд
    const node = round.nodes;
    const roundStartTime = round.start_time_formatted;
    const roundStartTimeSpread = [...roundStartTime];
    roundStartTimeSpread.splice(0, 11);
    roundStartTimeSpread.splice(8, 4);
    const roundStartTimeFormated = roundStartTimeSpread.join("");

    let currentRound;
    if (round.heatName.includes("Round") || round.heatName.includes("Раунд") || round.heatName.includes("round") || round.heatName.includes("раунд")) {
      currentRound = round.heatName;
    } else {
      currentRound = `${round.heatName} / ${getState("textStrings").roundsTab.round} ${round.id}`;
    }
    node.forEach(function (node) {
      // Находим там ноду
      if (node.callsign == name) {
        // в Ноде ищем определенного пилота

        const laps = node.laps; // и ищем его круги

        let lapCount; //переменная чтобы считать круги
        let holeShotStatus = false; //Переменная, чтобы знать, был ли holeShot(Он может быть не только под index=0)
        let firstNotDeletedLap = false;
        let previousLapTime; //Переменная для хранения предыдущего времени круга
        let previousLapTimeStart; //переменная для хранения старта предущего круга
        laps.forEach(function (lap, index) {
          const lapDataObj = {};
          if (index == 0) lapCount = 0; //Начинаем считать круги заново, как только индекс круга 0
          if (!lap.deleted && index == 0) firstNotDeletedLap = true;
          if (!lap.deleted && index > 0 && !firstNotDeletedLap) firstNotDeletedLap = true;

          if (firstNotDeletedLap && !holeShotStatus) {
            const lapTimeSpread = [...lap.lap_time_formatted];
            lapTimeSpread.splice(0, 2);
            const lapFloat = parseFloat(lapTimeSpread.join(""));
            previousLapTime = lapFloat.toFixed(3); //здесь начинаем брать Hole Shot за время предыдущего круга
            previousLapTimeStart = roundStartTimeFormated;
            holeShotStatus = true;
          } else if (!lap.deleted && index > 0 && holeShotStatus) {
            // отсекаем  Hole Shot и удаленные круги.
            lapDataObj.round = currentRound; //Название раунда, который строка в роторхазарде
            lapDataObj.roundId = round.id; //Id раунда
            lapDataObj.heatId = round.heatId;
            lapDataObj.roundTimeStart = roundStartTimeFormated;
            lapDataObj.lapId = lap.id; //Добавляем ID круга в глобальный объект по кругам
            const lapIndex = [++lapCount]; //Делаем массив из одного, чтобы одинаково считать 1 и подряд
            lapDataObj.lapIndex = lapIndex; //Добавляем Номер круга в раунде в глобальный объект по кругам
            lapDataObj.lapTimeStart = timeSumer(previousLapTimeStart, previousLapTime); //Выставляем время старта круга
            lapDataObj.lapTime = lap.lap_time_formatted; //Берем время
            const lapTimeSpread = [...lapDataObj.lapTime]; //Делим цифру на знаки
            const minute = lapTimeSpread.shift(); //Первую цифру времени удаляем, и записываем как минуту

            lapTimeSpread.shift(); //Тут удаляем двоеточие

            const lapFloat = parseFloat(lapTimeSpread.join("")); //Здесь воссоединяем цифры без минут
            let fullLapFixed;
            if (minute > 0) {
              const fullLap = lapFloat + 60 * minute;
              fullLapFixed = fullLap.toFixed(3);
              allLapsFloat.push(fullLapFixed); // Записываем с минутами
            } else {
              const fullLap = lapFloat;
              fullLapFixed = fullLap.toFixed(3);
              allLapsFloat.push(fullLapFixed); //Записываем без минут
            }
            lapDataObj.lapTimeEnd = timeSumer(lapDataObj.lapTimeStart, fullLapFixed);

            allLapsData.push(lapDataObj); //добавляем созданый в этой итерации объект в массив
            previousLapTime = allLapsFloat[allLapsFloat.length - 1]; //Берем последние значения времени круга и старта круга из массива, как предыдущие значения
            previousLapTimeStart = allLapsData[allLapsData.length - 1].lapTimeStart;
          }
        });
      }
    });
  });

  if (sorted == false) {
    if (getState("CONSOLE_DEBUG")) console.log("allLapsData", allLapsData);

    return allLapsData; //Возвращаем сортировкой по раундам
  } else {
    allLapsFloat.sort((a, b) => a - b); //Сортировка по лучшим кругам, значения Float

    allLapsTime = fromFloatToString(allLapsFloat); //превращаем Float в человечиские цифры в виде String

    let previousLapId = [];
    allLapsTime.forEach((element) => {
      //Тут перебираем массив, где лежит сортированное человеческое время
      const currentLapTime = element;

      allLapsData.forEach((element) => {
        //тут перебираем массив, где лежат объекты кругов

        if (element.lapTime == currentLapTime && previousLapId.indexOf(element.lapId) == -1) {
          //ждём, когда в массиве объектов найдётся элемент, где совпадает сортированное время и смотрим, чтобы не совпадал Id;
          allLapsDataSorted.push(element); //найденный массив записыаем в новый массив
          previousLapId.push(element.lapId); // сюда добавляем LapId, чтобы знать, какие круги уже есть в массиве;
          return;
        }
      });
    });

    return allLapsDataSorted; //Возвращаем сортировкой по времени
  }
}

export function getConsecutivesByName(name, sorted) {
  //   let consecutivesCount;
  //   if (mainObj.consecutives_count) {
  //     consecutivesCount = mainObj.consecutives_count;
  //   } else {
  //     consecutivesCount = 3;
  //   }

  const consecutivesCount = getState("consecutivesCount") ? getState("consecutivesCount") : 3;

  const allLapsData = getLapsByName(name, false);
  let allConsecutivesFloat = [];
  let allConsecutivesTime = [];
  let allConsecutivesData = []; //Переменная с конечным массивом всех 3 кругов
  let allConsecutivesDataSorted = []; //А это сортированный
  let consecutiveId = 0;
  allLapsData.forEach((element, index) => {
    let consecutiveDataObj = {}; //Создаем объект, в котором будет хранится инфа по 3 кругам

    if (element.lapIndex >= consecutivesCount) {
      //если номер круга больше чем количество Consecutives, значит сработали круги подряд;

      const lapsIndexArr = [];
      const lapsIdArr = [];
      const lapsData = [];
      const lapsTime = [];
      for (let i = 0; i < consecutivesCount; i++) {
        lapsIndexArr.unshift(allLapsData[index - i].lapIndex);
        lapsData.unshift(allLapsData[index - i]);
        lapsTime.unshift(allLapsData[index - i].lapTime);
        lapsIdArr.unshift(allLapsData[index - i].lapId);
      }

      consecutiveDataObj.consecutiveId = consecutiveId; //Новое значение - уникальный номер подряд кругов
      consecutiveDataObj.round = element.round; //Раунд, в котором произошел consecutives
      consecutiveDataObj.roundId = element.roundId;
      consecutiveDataObj.heatId = element.heatId;

      consecutiveDataObj.lapIndex = lapsIndexArr; //Номера кругов в раунде
      consecutiveDataObj.lapId = lapsIdArr; //номер Id кругов
      consecutiveDataObj.roundTimeStart = element.roundTimeStart;
      consecutiveDataObj.lapTimeStart = allLapsData[index - (consecutivesCount - 1)].lapTimeStart; //Начало consecutives
      consecutiveDataObj.lapTime = lapTimeSumer(lapsTime, true); //Записываем форматированное время в объект
      const float = lapTimeSumer(lapsTime, false); //Берем Float время
      consecutiveDataObj.lapTimeEnd = timeSumer(consecutiveDataObj.lapTimeStart, float.toFixed(3));
      allConsecutivesFloat.push(float.toFixed(3)); //и записываем его в формате строки, чтобы 3 знака
      consecutiveDataObj.lapsData = lapsData;

      allConsecutivesData.push(consecutiveDataObj);
      consecutiveId++;
    }
  });

  if (sorted == false) {
    return allConsecutivesData; //Возварщаем сортировкой по раундам
  } else {
    allConsecutivesFloat.sort((a, b) => a - b); //Сортировка по лучшим кругам, значения Float

    allConsecutivesTime = fromFloatToString(allConsecutivesFloat); //превращаем Float в человечиские цифры в виде String

    let previousLapsId = [];

    allConsecutivesTime.forEach((element) => {
      //Тут перебираем массив, где лежит сортированное человеческое время
      const currentLapTime = element;
      allConsecutivesData.forEach((element, index) => {
        //тут перебираем массив, где лежат объекты кругов
        if (element.lapTime == currentLapTime && previousLapsId.indexOf(element.consecutiveId) == -1) {
          //ждём, когда в массиве объектов найдётся элемент, где совпадает сортированное время
          allConsecutivesDataSorted.push(element); //найденный массив записываем в новый массив
          previousLapsId.push(element.consecutiveId);
          return;
        }
      });
    });
    return allConsecutivesDataSorted; //Возвращаем сортировкой по времени;
  }
}

export function getRound(roundNum, heatNum) {
  let roundPilotsLaps = []; //массив пилотов, где хранятся объекты с кругами по пилотам
  let lapsCount = []; //тут количество кругов каждого пилота, чтобы найти максимальные круги за раунд
  const allPilots = getPilotsStats(); //инфа по пилотам

  const currentRoundNodes = getState("mainObj").heats[heatNum].rounds[roundNum - 1].nodes; //Ищем записи данного раунда

  const currentRoundPilotsCallsigns = []; //вытащим из записей имена пилотов
  currentRoundNodes.forEach(function (node) {
    currentRoundPilotsCallsigns.push(node.callsign);
  });

  const roundInfo = {}; //инфа раунда
  roundPilotsLaps.push(roundInfo); //добавялем инфу раунда в массив

  let heatPilots = []; // выбираем пилотов нужной группы
  currentRoundPilotsCallsigns.forEach(function (name) {
    allPilots.forEach(function (pilot) {
      if (pilot.name == name) heatPilots.push(pilot);
    });
  });

  heatPilots.forEach((element) => {
    //проходимся по каждому пилоту
    const allLapsData = getLapsByName(element.name, false);
    // if(getState('CONSOLE_DEBUG'))console.log('allLapsData---allLapsData', allLapsData);

    const roundLaps = allLapsData.filter((element) => {
      //избираем круги только нужного раунда
      return element.roundId == roundNum && element.heatId == heatNum;
    });
    if (getState("CONSOLE_DEBUG")) console.log("roundLapsroundLaps--------===============================", roundLaps);

    if (roundLaps.length > 0) {
      //Если круги есть в этом раунде у этого пилота, то....
      let currentRound;
      if (roundLaps[0].round.includes("Round") || roundLaps[0].round.includes("Раунд") || roundLaps[0].round.includes("round") || roundLaps[0].round.includes("раунд")) {
        currentRound = roundLaps[0].round;
      } else {
        currentRound = `${roundLaps[0].round} / Раунд ${roundLaps[0].roundId}`;
      }
      roundInfo.round = currentRound;
      roundInfo.roundStart = roundLaps[0].roundTimeStart; //добавляем в инфу раунда время начало раунда

      const holeSHot = getRoundHoleShot(element.name, heatNum, roundNum); //ищем круг до старта
      roundLaps.unshift(holeSHot); //добавляем пустой круг в начало массива
      roundLaps.push(element.name); //добавляем имя пилота в конец массива
      roundPilotsLaps.push(roundLaps); //добавляем получившийся массив в общий массив по раунду

      lapsCount.push(roundLaps.length - 2); //добавляем количество кругов в массив количества кругов
    }
  });

  roundInfo.maxLaps = Math.max(...lapsCount); //ищем максимальное количество кругов и добавляем в инфу по раунду;

  //тут будем сортировать по 3 лучшим кругам + holeshot

  let roundPilotsLapsSortedNames = [];
  let fullTimePilots = []; //сюда добавим фулл время и имена пилотов;
  let fullTimes = []; //сюда добавим только фулл время;
  roundPilotsLaps.forEach(function (pilot, index) {
    if (index != 0) {
      let lapsTimeFloat = []; //Массив, где все времена во float 1 пилот;
      lapsTimeFloat.push(+lapTimeConverter(pilot[0], "float")); //Добавляем Hole shot

      for (let i = 1; i <= getState("consecutivesCount"); i++) {
        //Добавляем 3 круга (3 через consecutivesCount)
        try {
          lapsTimeFloat.push(+lapTimeConverter(pilot[i].lapTime, "float"));
        } catch (error) {
          //Если нет 3х кругов, то добавялем 1000 секунд
          lapsTimeFloat.push(1000);
        }
      }

      let pilotFullTimeArr = []; //Здесь будет фулл время и имя пилота;
      let pilotFullTimeFloat = 0; //переменная для фулл время, добавится в массив;

      lapsTimeFloat.forEach(function (lapTime) {
        //складываем все времена в массиве;
        pilotFullTimeFloat += lapTime;
      });

      pilotFullTimeArr.push(pilotFullTimeFloat, pilot[pilot.length - 1]); //добавляем фулл время и имя;

      fullTimePilots.push(pilotFullTimeArr);
      fullTimes.push(pilotFullTimeFloat);
    }
  });

  const fullTimesSorted = fullTimes.sort((a, b) => a - b); //Сортируем время;

  fullTimesSorted.forEach(function (time) {
    //Проходимся по каждому времени и находим совпадение другом массиве с именем
    fullTimePilots.forEach(function (pilot) {
      if (pilot[0] == time) roundPilotsLapsSortedNames.push(pilot[1]); //Записываем найденое имя в новый массив;
    });
  });

  let roundPilotsLapsSorted = [];

  roundPilotsLapsSorted.push(roundPilotsLaps[0]);

  roundPilotsLapsSortedNames.forEach(function (name) {
    roundPilotsLaps.forEach(function (pilot, index) {
      if (index != 0) {
        if (pilot[pilot.length - 1] == name) roundPilotsLapsSorted.push(pilot);
      }
    });
  });

  if (getState("CONSOLE_DEBUG")) console.log("roundPilotsLapsSortedroundPilotsLapsSortedroundPilotsLapsSortedroundPilotsLapsSorted", roundPilotsLapsSorted);

  return roundPilotsLapsSorted;
}

export function getRoundHoleShot(name, heat, round) {
  if (getState("CONSOLE_DEBUG")) console.log("ИМЯяяя", name);

  const fullData = getState("mainObj");

  const roundInfo = fullData.heats[heat].rounds[round - 1].nodes;
  const roundByName = roundInfo.find((element) => element.callsign == name);
  const notDeletedLap = roundByName.laps.find((lap) => lap.deleted == false);
  const holeShot = notDeletedLap.lap_time_formatted;
  return holeShot;
}

export function getLapData(targetTime, lapOrConsecutive, name, getLap) {
  //находим выбранный круг getLap=current, или все круги раунда по выбранному кругу getLap=other;
  //lapOrConsecutive - выбранный один или подряд
  //targetTime - выбранный круг
  let lapData;
  let lapsData;
  let otherLapData = [];
  const singleLapsData = getLapsByName(name, true); //находим все круги по имени для дальнейшего отбора otherLaps
  if (lapOrConsecutive == "lap") {
    lapsData = singleLapsData; //находим все круги для сравнение с выбранным(когда выбранный 'один круг' - это тоже самое, что все круги для отбора otherLaps)
  } else if (lapOrConsecutive == "consecutive") {
    lapsData = getConsecutivesByName(name, true); //находим все круги для сравнение с выбранным(круги подряд)
  }
  lapsData.forEach((lap) => {
    if (lap.lapTime == targetTime) {
      //перебирая все круги ищем совпадение по времени;
      lapData = lap; //объект выбранного круга
      // if(getState('CONSOLE_DEBUG'))console.log('N A S H E L');
      if (getLap == "current") return; //если нам нужно вернуть выбранный круг - уходим

      singleLapsData.forEach((lap) => {
        //перебираем все круги и ищем совпадение по round с выбранным для otherLap
        if (getState("CONSOLE_DEBUG")) console.log("O T H E R L A P S");
        if (lap.round == lapData.round) {
          otherLapData.push(lap); //добавляем найденный в массив otherLap
        }
      });
      if (getState("CONSOLE_DEBUG")) console.log("L A P = NE LAP");
    }
    if (getState("CONSOLE_DEBUG")) console.log("L A P D A T A");
  });
  if (getState("CONSOLE_DEBUG")) console.log("F I N A L R E T U R N");

  if (getLap == "current") {
    //возвращаем нужные значение
    return lapData;
  } else {
    otherLapData.sort((a, b) => (a.lapIndex > b.lapIndex ? 1 : -1));
    return otherLapData;
  }

  // на потом придумать как сделать остановку, когда находится нужный круг
}

export function getPilotsStats() {
  //здесь список пилотов
  const fullData = getState("mainObj");

  const classes = fullData.classes;

  const data = fullData.classes[getState("currentClass")].leaderboard.by_race_time;

  if (getState("CONSOLE_DEBUG")) console.log("datadatadata", data);

  let pilots = [];
  data.forEach(function (pilot) {
    const pilotInfo = {};

    pilotInfo.averageLap = pilot.average_lap;
    pilotInfo.laps = pilot.laps;
    pilotInfo.starts = pilot.starts;
    pilotInfo.totalTime = pilot.total_time_laps;

    pilotInfo.name = pilot.callsign;
    if (pilotInfo.laps) {
      pilots.push(pilotInfo);
    }
  });

  return pilots;
}

export function getHeatTabsRounds() {
  const heatObj = getRoundsByHeats();
  const tabsRounds = [];

  for (let heat in heatObj) {
    const tabObj = {};
    tabObj.name = `heat-${heat} `;
    tabObj.opened = false;
    tabObj.element = document.querySelector(`.rounds__rounds-heat-${heat}`);

    tabsRounds.push(tabObj);
  }

  return tabsRounds;
}

export function getRoundsByHeats() {
  const heatsObj = {};

  const classHeats = getState("mainObj").heats_by_class[getState("currentClass")];
  const heats = getState("mainObj").heats;

  for (let heat in heats) {
    if (classHeats.includes(+heat)) {
      const rounds = [];
      const heatNum = heat;
      const heatRounds = heats[heat].rounds;
      heatRounds.forEach((round) => {
        rounds.push(round.id);
      });
      heatsObj[heatNum] = rounds;
    }
  }

  return heatsObj;
}

export function getDateinfo(dateOrTime) {
  // Может больше и не нужна
  //берем дату для заголовка
  try {
    //try catch для момета, если даты там не будет...

    let dateString;

    const fullData = getState("mainObj");
    for (const objStroke in fullData) {
      if (objStroke == "heats") {
        const heatsStroke = fullData[objStroke];
        dateString = heatsStroke[1].rounds[0].start_time_formatted;
      } else if (fullData[objStroke].heats) {
        const heatsStroke = fullData[objStroke].heats;
        dateString = heatsStroke[1].rounds[0].start_time_formatted;
      }
    }

    let year;
    let mounth;
    let day;
    let time;

    if (dateString) {
      //Если дату нашли
      year = `${[...dateString].splice(0, 4).join("")} года`; //Год первые 4 цифры и слово 'года'
      const monthNum = [...dateString].splice(5, 2).join(""); //номер месяца
      day = [...dateString].splice(8, 2).join(""); //число
      time = `${[...dateString].splice(11, 2).join("")}:00`; //Час времени

      mounth = getState("textStrings").monthsNames[parseInt(monthNum) - 1]; //меняем номер месяца на название
    } else {
      //Если врдуг мы нашли дату, но она undefined;
      day = "Дата ";
      mounth = "не определена";
      year = "";
      time = "Время не определено";
    }

    if (dateOrTime == "day") {
      //вовзрааем строку дня и месяца, или же 'Не определена'
      const date = `${day} ${mounth} `;
      return date;
    }
    if (dateOrTime == "year") {
      //возвращаем строку года или пустую строку
      const yearString = `${year} `;
      return yearString;
    }

    if (dateOrTime == "time") {
      //Возвращаем время или 'не определено'
      return time;
    }
  } catch (error) {
    if (getState("CONSOLE_DEBUG")) console.log("Ошибка при формировании даты", error);
  }
}

export function getDayFiles(date) {
  const dayButtons = document.querySelectorAll(".calendar__day");
  dayButtons.forEach((button) => {
    if (button.classList.contains("_active")) button.classList.remove("_active");
  });

  const dateFilesElement = document.querySelector(".date-files__items");
  if (!dateFilesElement.classList.contains("_hidden")) dateFilesElement.classList.add("_hidden");

  setTimeout(() => {
    dateFilesElement.innerHTML = "";

    getState("filesList").forEach((file) => {
      const fileDateArr = `${file.year}-${file.month}-${file.day}`;

      if (date == fileDateArr) {
        const fileItemElement = {
          item: document.createElement("div"),
          name: document.createElement("div"),
          nameTittle: document.createElement("div"),
          nameValue: document.createElement("div"),
          date: document.createElement("div"),
          dateTittle: document.createElement("div"),
          dateValue: document.createElement("div"),
          time: document.createElement("div"),
          timeTittle: document.createElement("div"),
          timeValue: document.createElement("div"),
        };

        fileItemElement.item.classList.add("file__item", "pseudo-button");
        fileItemElement.item.id = file.uuid;
        fileItemElement.name.classList.add("file__file-name");
        fileItemElement.nameTittle.classList.add("file__file-name-tittle");
        fileItemElement.nameValue.classList.add("file__file-name-value");
        fileItemElement.date.classList.add("file__date");
        fileItemElement.dateTittle.classList.add("file__date-tittle");
        fileItemElement.dateValue.classList.add("file__date-value");
        fileItemElement.time.classList.add("file__time");
        fileItemElement.timeTittle.classList.add("file__time-tittle");
        fileItemElement.timeValue.classList.add("file__time-value");
        if (!file.isFinished) fileItemElement.timeValue.classList.add("_live");

        fileItemElement.nameTittle.innerHTML = `${getState("textStrings").event}:`;
        fileItemElement.nameValue.innerHTML = file.eventName;

        fileItemElement.dateTittle.innerHTML = `${getState("textStrings").date}:`;
        fileItemElement.dateValue.innerHTML = `${file.day} ${file.monthName} ${file.year}`;

        fileItemElement.timeTittle.innerHTML = `${getState("textStrings").time}:`;
        fileItemElement.timeValue.innerHTML = `${file.hours}:${file.minutes}`;

        fileItemElement.item.append(fileItemElement.name, fileItemElement.date, fileItemElement.time);
        fileItemElement.name.append(fileItemElement.nameTittle, fileItemElement.nameValue);
        fileItemElement.date.append(fileItemElement.dateTittle, fileItemElement.dateValue);
        fileItemElement.time.append(fileItemElement.timeTittle, fileItemElement.timeValue);

        dateFilesElement.append(fileItemElement.item);
      }
    });
    setTimeout(() => {
      dateFilesElement.classList.remove("_hidden");
    }, 20);
  }, 310);
}

export function updateLiveData() {
  classSwitch(getState());
  document.querySelector(".new-live-data-button").remove();
}
