import { getState, getTab } from "./sharedStates";

export function timeSumer(previouseDate, previousLapTime) {
  //посчитать время по дате и время круга;

  const previouseDateHour = +[...previouseDate].splice(0, 2).join("");
  const previouseDateMinutes = +[...previouseDate].splice(3, 2).join("");
  const previouseDateSecundes = +[...previouseDate].splice(6, 2).join("");

  let currentHour = previouseDateHour;
  let currentMinutes = previouseDateMinutes;
  let currentSecundes = Math.round(previouseDateSecundes + +previousLapTime);

  if (currentSecundes >= 60 && currentSecundes < 120) {
    currentMinutes += 1;
    currentSecundes = parseInt(currentSecundes - 60);
  } else if (currentSecundes >= 120 && currentSecundes < 180) {
    currentMinutes += 2;
    currentSecundes = parseInt(currentSecundes - 120);
  } else if (currentSecundes >= 180 && currentSecundes < 240) {
    currentMinutes += 3;
    currentSecundes = parseInt(currentSecundes - 180);
  }

  if (currentMinutes >= 60) {
    currentHour += 1;
    currentMinutes = parseInt(currentMinutes - 60);
  }
  if (currentHour >= 24) {
    currentHour = 0;
  }

  let hourString = currentHour;
  let minutesString = currentMinutes;
  let secundesString = currentSecundes;

  if (hourString < 10) hourString = `0${hourString}`;
  if (minutesString < 10) minutesString = `0${minutesString}`;
  if (secundesString < 10) secundesString = `0${secundesString}`;

  const lapStart = `${hourString}:${minutesString}:${secundesString}`;

  return lapStart;
}

export function lapTimeSumer(data = [], formfated) {
  //посчитать несколько время кругов - для кругов подряд
  const lapsTime = data;
  const lapsTimeFloat = [];
  lapsTime.forEach((element) => {
    //В этом forEach записывает Float время в новый массив

    const lapTimeSpread = [...element]; //Делим цифру на знаки
    const minute = lapTimeSpread.shift(); //Первую цифру времени удаляем, и записываем как минуту

    lapTimeSpread.shift(); //Тут удаляем двоеточие

    const lapFloat = parseFloat(lapTimeSpread.join("")); //Здесь воссоединяем цифры без минут

    if (minute > 0) {
      const fullLap = lapFloat + 60 * minute;
      const fullLapFixed = fullLap.toFixed(3);
      lapsTimeFloat.push(fullLapFixed); // Записываем с минутами
    } else {
      const fullLap = lapFloat;
      const fullLapFixed = fullLap.toFixed(3);
      lapsTimeFloat.push(fullLapFixed); //Записываем без минут
    }
  });

  const consecutiveTimeFloat = lapsTimeFloat.reduce(function (a, b) {
    //Складываем время в массиве
    return +a + +b;
  });

  if (formfated == false) {
    // тут время Float
    return consecutiveTimeFloat;
  } else {
    //здесь время Человеческое
    let consecutiveMinute = 0;
    let consecutiveSecundes = +consecutiveTimeFloat;

    if (consecutiveSecundes >= 60 && consecutiveSecundes < 120) {
      consecutiveMinute = 1;
      consecutiveSecundes = consecutiveSecundes - 60;
    } else if (consecutiveSecundes >= 120 && consecutiveSecundes < 180) {
      consecutiveMinute = 2;
      consecutiveSecundes = consecutiveSecundes - 120;
    } else if (consecutiveSecundes >= 180 && consecutiveSecundes < 240) {
      consecutiveMinute = 3;
      consecutiveSecundes = consecutiveSecundes - 180;
    }

    if (consecutiveSecundes < 10) {
      return `${consecutiveMinute}:0${consecutiveSecundes.toFixed(3)}`;
    } else {
      return `${consecutiveMinute}:${consecutiveSecundes.toFixed(3)}`;
    }
  }
}

export function fromFloatToString(array) {
  //превращаем массив времени Float в массив человечиских цифр в виде String
  const allLapsTime = array.map((lap) => {
    if (lap < 60) {
      if (lap < 10) return (lap = `0:0${lap}`);
      lap = `0:${lap}`;
    } else if (lap >= 60 && lap < 120) {
      let lapWithoutMinute = lap - 60;
      if (lapWithoutMinute < 10) {
        lap = `1:0${lapWithoutMinute.toFixed(3)}`;
      } else {
        lap = `1:${lapWithoutMinute.toFixed(3)}`;
      }
    } else {
      let lapWithoutMinute = lap - 120;
      if (lapWithoutMinute < 10) {
        lap = `2:0${lapWithoutMinute.toFixed(3)}`;
      } else {
        lap = `2:${lapWithoutMinute.toFixed(3)}`;
      }
    }
    return lap;
  });
  return allLapsTime;
}

export function getAnimationDurationTime(element) {
  // время анимации
  const time = parseFloat(getComputedStyle(element).animationDuration) * 1000;
  return time;
}

export function getTransitionDurationTime(element) {
  //Время перехода
  const time = parseFloat(getComputedStyle(element).transitionDuration) * 1000;
  return time;
}

export function lapTimeConverter(time, floatOrString) {
  if (floatOrString == "float") {
    const lapTimeStringSpread = [...time]; //Делим цифру на знаки
    const minute = lapTimeStringSpread.shift(); //Первую цифру времени удаляем, и записываем как минуту

    lapTimeStringSpread.shift(); //Тут удаляем двоеточие

    const lapTimeFloat = parseFloat(lapTimeStringSpread.join("")); //Здесь воссоединяем цифры без минут

    if (minute > 0) {
      const lapTimeFloatFull = lapTimeFloat + 60 * minute;
      const lapTimeFloatFullFixed = lapTimeFloatFull.toFixed(3);
      return lapTimeFloatFullFixed;
    } else {
      const lapTimeFloatFixed = lapTimeFloat.toFixed(3);
      return lapTimeFloatFixed;
    }
  } else if (floatOrString == "string") {
    const minutesFloat = time / 60;
    const minutesSpread = [...minutesFloat.toString()];
    const minutes = minutesSpread[0];
    const secundesFloat = time - minutes * 60;
    let secundes = secundesFloat.toFixed(3);
    if (secundesFloat < 10) secundes = `0${secundesFloat.toFixed(3)}`;
    const fullTime = `${minutes}:${secundes}`;

    return fullTime;
  }
}

export function getNumFromText(text) {
  let num;
  const textArr = [...text];
  const textNums = [];
  textArr.forEach((el, index) => {
    if (el == el.match(/\d+/g)) {
      textNums.push(el);
    }
    if (index == textArr.length - 1) {
      num = textNums.join("");
    }
  });
  return num;
}

export function getMinutesSinceUpload(timePart, uploadTimestamp) {
  if (!uploadTimestamp || typeof uploadTimestamp !== "number") {
    return "Некорректный timestamp";
  }

  const now = Date.now();

  // Проверка на "timestamp из будущего"
  if (uploadTimestamp > now) {
    return "- -";
  }

  const diffMs = now - uploadTimestamp;
  const diffSecondsTotal = Math.floor(diffMs / 1000); // 60000 мс = 1 минута

  //   if (diffSecondsTotal < 60) {
  //     return `${getState("textStrings").uploaded} ${diffSecondsTotal} ${getState("textStrings").seconds} ${getState("textStrings").ago}`;
  //   }

  const diffMinutes = Math.floor(diffSecondsTotal / 60);
  const remainingSeconds = diffSecondsTotal % 60;

  const lastDigit = diffMinutes % 10;
  const lastTwoDigits = diffMinutes % 100;

  let minuteWord = getState("textStrings").minute1; // минут
  if (lastTwoDigits < 11 || lastTwoDigits > 14) {
    if (lastDigit === 1) minuteWord = getState("textStrings").minute2; // минуту
    if (lastDigit >= 2 && lastDigit <= 4) minuteWord = getState("textStrings").minute3; // минуты
  }

  if (timePart == "minutes") return `${getState("textStrings").uploaded}: ${diffMinutes} ${minuteWord}`;

  if (timePart == "seconds") return `и ${remainingSeconds} ${getState("textStrings").seconds} ${getState("textStrings").ago}`;
}

export function setShareUrl(uuid) {
  const eventUrl = new URL(window.location.href);
  eventUrl.searchParams.set("uuid", `${uuid}`);

  history.pushState({}, "", eventUrl);

  const shareUrlElement = document.querySelector(".author__share-url");
  shareUrlElement.textContent = eventUrl.href;
}

export function isOldFile(fileTimesmap) {
  // Если параметр null, значит, время точно прошло (возвращаем false)
  if (fileTimesmap == null) {
    return true;
  }

  const currentTime = Date.now();
  const timeDifference = currentTime - fileTimesmap; // Разница в миллисекундах
  const sixHoursInMs = 6 * 60 * 60 * 1000;

  // Если разница >= 6 часов, возвращаем false, иначе true
  return timeDifference > sixHoursInMs;
}

export function getDateStrings(timeFormated) {
  const [datePart, timePart] = timeFormated.split(" ");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map((n) => n.padStart(2, "0"));
  const date = new Date(year, month - 1, day, hours, minutes);

  return { date, year, month, day, hours, minutes };
}

export function arraysEqual(arr1, arr2) {
  return arr1.length === arr2.length && arr1.every((element, index) => element === arr2[index]);
}

export function updateUrl(key, value, replace = false) {
  const order = ["uuid", "raceclass", "main", "leaderboard"];

  const url = new URL(window.location);
  const uuidParam = url.searchParams.get("uuid");

  const classRaceParam = url.searchParams.get("raceclass");
  const mainTabParam = url.searchParams.get("main");
  const leaderboardTypeParam = url.searchParams.get("leaderboard");

  const searchParams = new URLSearchParams();
  searchParams.set("uuid", uuidParam);

  classRaceParam && searchParams.set("raceclass", classRaceParam);
  mainTabParam && searchParams.set("main", mainTabParam);
  leaderboardTypeParam && searchParams.set("leaderboard", leaderboardTypeParam);
  //   if (!leaderboardTypeParam) {
  //     const leaderboardTypeTab = getTab("leaderboard")?.find((tab) => tab.opened == true);
  //     searchParams.set("leaderboard", leaderboardTypeTab?.name || "lap");
  //   }

  searchParams.set(key, value);

  const sortedParams = new URLSearchParams();

  order.forEach((paramName) => {
    if (searchParams.has(paramName)) {
      sortedParams.set(paramName, searchParams.get(paramName));
    }
  });

  const newUrl = `${url.pathname}?${sortedParams.toString()}`;
  if (replace) {
    history.replaceState(null, "", newUrl);
  } else {
    history.pushState(null, "", newUrl);
  }
}

export function getParamTabIndex(paramName) {
  const url = new URL(window.location);
  const paramValue = url.searchParams.get(paramName);
  if (paramValue) {
    const tabIndex = getTab(paramName).findIndex((tab) => tab.name == paramValue);
    return tabIndex;
  } else {
    return 0;
  }
}


export function timeDiff2(time1, time2, extraMinutes = 0, extraSeconds = 0) {
	// функция преобразует строку "HH:mm:ss.SSS" в миллисекунды
	function parseTime(str) {
	  const [h, m, rest] = str.split(":");
	  const [s, ms] = rest.split(".");
	  return parseInt(h) * 3600 * 1000 + parseInt(m) * 60 * 1000 + parseInt(s) * 1000 + (ms ? parseInt(ms) : 0);
	}
 
	let diff = Math.abs(parseTime(time1) + extraMinutes * 60 * 1000 + extraSeconds * 1000 - parseTime(time2));
 
	// добавляем дополнительные минуты/секунды
	diff -= extraMinutes * 60 * 1000 - extraSeconds * 1000;
 
	// преобразуем обратно в читаемый формат
	const hours = Math.floor(diff / (3600 * 1000));
	diff %= 3600 * 1000;
 
	const minutes = Math.floor(diff / (60 * 1000));
	diff %= 60 * 1000;
 
	const seconds = Math.floor(diff / 1000);
	const millis = diff % 1000;
 
	// собираем строку с ведущими нулями
	return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
 }
 
 export function timeDiff(time1, time2, extraMinutes = 0, extraSeconds = 0) {
	// Преобразуем "HH:mm:ss.SSS" в миллисекунды
	function parseTime(str) {
	  const [h, m, rest] = str.split(":");
	  const [s, ms] = rest.split(".");
	  return parseInt(h) * 3600 * 1000 + parseInt(m) * 60 * 1000 + parseInt(s) * 1000 + (ms ? parseInt(ms) : 0);
	}
 
	// Преобразуем миллисекунды обратно в "HH:mm:ss.SSS"
	function formatTime(ms) {
	  ms = Math.round(ms); // округляем миллисекунды
 
	  const hours = Math.floor(ms / (3600 * 1000));
	  ms %= 3600 * 1000;
 
	  const minutes = Math.floor(ms / (60 * 1000));
	  ms %= 60 * 1000;
 
	  const seconds = Math.floor(ms / 1000);
	  const millis = ms % 1000;
 
	  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
	}
 
	let t1Ms = parseTime(time1);
	let t2Ms = parseTime(time2);
 
	// добавляем extraMinutes и extraSeconds только к первому времени
	t1Ms += extraMinutes * 60 * 1000 + extraSeconds * 1000;
 
	const diffMs = Math.abs(t1Ms - t2Ms);
 
	return formatTime(diffMs);
 }
 
 export function averageTime(times) {
	function parseTime(str) {
	  const [h, m, rest] = str.split(":");
	  const [s, ms] = rest.split(".");
	  return parseInt(h) * 3600 * 1000 + parseInt(m) * 60 * 1000 + parseInt(s) * 1000 + (ms ? parseInt(ms) : 0);
	}
 
	function formatTime(ms) {
	  ms = Math.round(ms);
	  const hours = Math.floor(ms / (3600 * 1000));
	  ms %= 3600 * 1000;
 
	  const minutes = Math.floor(ms / (60 * 1000));
	  ms %= 60 * 1000;
 
	  const seconds = Math.floor(ms / 1000);
	  const millis = ms % 1000;
 
	  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
	}
 
	const totalMs = times.reduce((sum, t) => sum + parseTime(t), 0);
	const avgMs = totalMs / times.length;
 
	return formatTime(avgMs);
 }