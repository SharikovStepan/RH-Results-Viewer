import { getState, setState } from "./sharedStates";
import { calendarRender, makeRaceClassButtons } from "./htmlWriters.jsx";
import { startFileView, setTittle } from "./uiChange";
import { getDateStrings, isOldFile, setShareUrl } from "./utils";
import { tittleCounter, checkLiveData } from "./liveDataCounter";

export async function urlUpload() {
  try {
    const eventUrl = new URL(window.location.href);

    const fullLiveData = await getLiveData(getState("isUuid"));

    setState("mainObj", fullLiveData.results);
    setState("fullRHData", fullLiveData);
    setState("raceTypesByClass", fullLiveData.raceTypesByClass);
    const raceClassesWithFinals = fullLiveData.raceTypesByClass?.filter((raceClass) => raceClass.raceType != "");
    setState(
      "raceClassesWithFinals",
      raceClassesWithFinals?.map((raceClass) => raceClass.raceClassId)||[]
    );


    console.log("FULL OBJ", fullLiveData);
    //  setState("isUuid", ''); Уже есть uuid
    setState("liveTimestamp", fullLiveData.lastUpdate);

    makeRaceClassButtons();
  
    startFileView("uuid");

    //  const isLiveTime = getLiveState(Date.now(), fullLiveData.lastUpdate);
    if (getState("filesListLoaded") == false) {
      await getState("fileListPending");
    }
   //  console.log('getState("filesList")getState("filesList")', getState("filesList"));

    const fileListData = getState("filesList").find((file) => file.uuid == getState("isUuid"));

    if (!fileListData.isFinished) {
      tittleCounter(fullLiveData.eventName);
      checkLiveData(); //Открыть счётчик
    } else {
      setTittle(getState("isUuid"));
    }

    eventUrl.searchParams.set("uuid", `${getState("isUuid")}`);

    const shareUrlElement = document.querySelector(".author__share-url");
    shareUrlElement.textContent = eventUrl.href;
    const languageElement = getState("language") == "ru" ? document.querySelector(`.language__EN`) : getState("language") == "en" && document.querySelector(`.language__RU`);
    const newLanguageChangeLink = `${languageElement.getAttribute("href")}?uuid=${eventUrl.searchParams.get("uuid")}`;
    languageElement.setAttribute("href", `${newLanguageChangeLink}`);
  } catch (error) {
    console.error("ошибка про загрузке url", error);
    const wrapperElement = document.querySelector(".wrapper");
    wrapperElement.classList.add("_error");
    const homeButton = document.querySelector(".home");
    homeButton.classList.remove("_hidden");
    homeButton.classList.add("_back");
    document.querySelector(".wrapper").prepend(homeButton);
    //  document.querySelector('.home')
  }
}

export async function getLiveData(uuid) {
  try {
    const data = await fetch(`/api/getData?uuid=${uuid}`);

    if (!data.ok) throw new Error(`ошибка загрузки live: ${data.statusText}`);
    const dataJson = await data.json();

    return dataJson.data;
  } catch (error) {
    console.error(`${error}`);
  }
}

export async function loadFilesList(calendar) {
  if (calendar) calendarRender(false);

  try {
    const response = await fetch("/api/loadFiles");

    if (!response.ok) throw new Error(`ошибка загрузки fileList: ${response.statusText}`);
    const responseData = await response.json();

    responseData.files.forEach((file) => {
      ///Собираем объект всех файлов из репозитория
      const obj = {};
      // console.log("file.meta.eventStartfile.meta.eventStartfile.meta.eventStart", file.meta.eventStart);

      if (file.meta.eventStart) {
        const { date, year, month, day, hours, minutes } = getDateStrings(file.meta.eventStart);
        obj.date = date;
        obj.year = year;
        obj.month = month - 1;
        obj.monthName = getState("textStrings").monthsNames[month - 1];
        obj.day = day;
        obj.hours = hours;
        obj.minutes = minutes;
      } else {
        //Здесь если нет кругов ещё в событии, то last file показываем, а вот в дате файлов нет (date==lastUpdate)
        obj.date = file.meta.lastUpdate;
      }

      obj.lastUpdate = file.meta.lastUpdate;
      obj.isOldFile = isOldFile(file.meta.lastUpdate);
      obj.isFinished = file.meta.isFinished;
      obj.eventName = file.meta.eventName;
      obj.uuid = file.uuid;

      setState("filesList", [...getState("filesList"), obj]);

      //Узнаем, сколько времени прошло с последнего обновления незавершенного ивента, если много, то закрываем его :)
      if (file.meta.isFinished === false && isOldFile(file.meta.lastUpdate) == true) {
        file.meta.isFinished = true;
        markEventAsFinished(file.uuid);
      }
    });
   //  console.log("loadFilesList", getState("filesList"));

    getState("filesListResolve")();
    setState("filesListLoaded", true);

    if (calendar) {
      const spanLoadeingElement = document.querySelector("._no-files-span");
      const daysElement = document.querySelector(".calendar__days");
      spanLoadeingElement.classList.add("_hidden");
      daysElement.classList.add("_hide-loading");

      spanLoadeingElement.addEventListener("transitionend", function (e) {
        if (e.propertyName == "opacity") {
          const lastFileItemElement = document.querySelector(".last-file__item");
          lastFileItemElement.classList.remove("_no-files");
          daysElement.classList.remove("_hide-loading");
          const calendarDaysElement = document.querySelector(".calendar__days");
          calendarDaysElement.classList.remove("_no-files");
        }
      });

      const latestFile = getState("filesList").reduce((latest, current) => {
        if (current.date > latest.date) {
          return current;
        } else if (current.date < latest.date) {
          return latest;
        } else {
          return current;
        }
      }, getState("filesList")[0]);

      setState("lastFile", latestFile);

      document.querySelector(".last-file__file-name-value").innerHTML = latestFile.eventName;

      if (latestFile.date == latestFile.lastUpdate) {
        document.querySelector(".last-file__date-value").innerHTML = getState("textStrings").emptyTime;
        document.querySelector(".last-file__time-value").innerHTML = getState("textStrings").emptyTime;
      } else {
        document.querySelector(".last-file__date-value").innerHTML = `${latestFile.day} ${latestFile.monthName} ${latestFile.year}`;
        document.querySelector(".last-file__time-value").innerHTML = `${latestFile.hours}:${latestFile.minutes}`;
      }
      if (latestFile.isFinished != true) document.querySelector(".last-file__time-value").classList.add("_live");

      calendarRender(true);
    }
  } catch (error) {
    console.error(error);
  }
}

export async function loadLastFile() {
  const lastFileButton = document.querySelector(".last-file__item");
  const loadTimer = setTimeout(() => {
    lastFileButton.classList.add("_loading");
  }, 500);

  document.querySelector(".last-file__tittle").classList.add("_hidden");
  document.querySelector(".calendar").classList.add("_hidden");
  document.querySelector(".local-file__tittle").classList.add("_hidden");
  document.querySelector(".local-file__form").classList.add("_hidden");
  document.querySelector(".date-files").classList.add("_hidden");
  document.querySelector(".local-file__label").classList.add("_hidden");
  document.querySelector(".language").classList.add("_hidden");

  try {
    const url = `/api/getData?uuid=${getState("lastFile").uuid}`;

    const data = await fetch(url);

    if (!data.ok) throw new Error(`ошибка загрузки последнего файла: ${data.statusText}`);

    const fullResponse = await data.json();
   //  console.log("fullResponse", fullResponse.data.lastUpdate);

    setState("mainObj", fullResponse.data.results);
    setState("fullRHData", fullResponse.data);
    setState("raceTypesByClass", fullResponse.data.raceTypesByClass);
    const raceClassesWithFinals = fullResponse.data.raceTypesByClass?.filter((raceClass) => raceClass.raceType != "");
    setState(
      "raceClassesWithFinals",
      raceClassesWithFinals?.map((raceClass) => raceClass.raceClassId)
    );

    setState("isUuid", getState("lastFile").uuid);
    setState("liveTimestamp", getState("lastFile").lastUpdate);

    makeRaceClassButtons();
    startFileView("last");

    if (getState("lastFile").isFinished == false) {
      tittleCounter(getState("lastFile").eventName);
      checkLiveData(); //Открыть счётчик
    } else {
      setTittle(getState("isUuid"));
    }
    setShareUrl(getState("isUuid"));
  } catch (error) {
    console.error(error);

    lastFileButton.classList.remove("_loading");
    lastFileButton.classList.add("_loading-error");
  }
  clearTimeout(loadTimer);
}

export async function loadDateFile(uuid) {
  const fileItemElement = document.querySelector("._uploading-file");
  const loadTimer = setTimeout(() => {
    fileItemElement.classList.add("_loading");
  }, 500);

  document.querySelector(".last-file__tittle").classList.add("_hidden");
  document.querySelector(".calendar").classList.add("_hidden");
  document.querySelector(".language").classList.add("_hidden");

  try {
    const fileListData = getState("filesList").find((file) => file.uuid == uuid);

    const url = `/api/getData?uuid=${uuid}`;
    const data = await fetch(url);

    if (!data.ok) throw new Error(`ошибка загрузки файла по дате: ${data.statusText}`);

    const fullResponse = await data.json();
    setState("mainObj", fullResponse.data.results);
    setState("fullRHData", fullResponse.data);
    setState("raceTypesByClass", fullResponse.data.raceTypesByClass);
    const raceClassesWithFinals = fullResponse.data.raceTypesByClass?.filter((raceClass) => raceClass.raceType != "");
    setState(
      "raceClassesWithFinals",
      raceClassesWithFinals?.map((raceClass) => raceClass.raceClassId)
    );

    setState("isUuid", uuid);
    setState("liveTimestamp", fileListData.lastUpdate);

    makeRaceClassButtons();
    startFileView("date");

    if (!fileListData.isFinished) {
      tittleCounter(fileListData.eventName);
      checkLiveData(); //Открыть счётчик
    } else {
      setTittle(getState("isUuid"));
    }
    setShareUrl(getState("isUuid"));
  } catch (error) {
    console.error(error);
    fileItemElement.classList.remove("_loading");
    fileItemElement.classList.add("_loading-error");
  }
  clearTimeout(loadTimer);
}

export async function markEventAsFinished(fileUuid) {
  try {
    const response = await fetch("/api/finishEvent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ uuid: fileUuid }),
    });

    if (!response.ok) throw new Error(`ошибка при завершение старого ивента: ${data.statusText}`);

    //  const responseText = await response.json();
  } catch (error) {
    console.error(error);
  }
}
