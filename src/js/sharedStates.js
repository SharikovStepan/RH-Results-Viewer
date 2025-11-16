const states = {
  mainObj: {},
  consecutivesCount: 2,
  currentClass: 1,
  allRaceClassesId: [],
  language: "ru",
  CONSOLE_DEBUG: false,
  textStrings: {},
  parsedOK: false,
  isEvent: null,
  isUuid: null,
  lastFileUuid: null,
  filesList: [],
  filesListLoaded: false,
  filesListResolve: null,
  fileListPending: null,
  currentMonth: new Date(),
  graphTouchFlag: false,
  lapsIdData: [],
  liveTimestamp: null,
  newLiveData: false,
  checkLiveDataTimeout: null,
  isTournamentTab: false,
  tournamentRoundsQuantity: 3,
  tournamentFinalRoundsQuantity: 5,
  tournamentRaceQuantity: 14,
  tournamentPilotsPerHeat: 4,
  tournamentQualsType: "consecutives",
  finalTypesByClass: [],
  fullRHData: {},
  raceClassesWithFinals: [],
  reactRoot: null,
};

const subscribers = {};

states.fileListPending = new Promise((resolve) => {
  states.filesListResolve = resolve;
});

export const subscribe = (key, func) => {
  if (!subscribers[key]) subscribers[key] = [];
  subscribers[key].push(func);
};

export const unsubscribe = (key, func) => {
  if (!subscribers[key]) return;
  subscribers[key] = subscribers[key].filter((fn) => fn !== func);
};

export function setState(key, value) {
  states[key] = value;

  if (subscribers[key]) {
    console.log("SUBSCRIBES", subscribers[key]);
    subscribers[key].forEach((func) => {
      func(value);
    });
  }
}
export function getState(key) {
  return states[key];
}
///////////////////////////////////////
let tabs = {};

export function setTab(key, value) {
  tabs[key] = value;
}
export function getTab(key) {
  return tabs[key];
}
////////////////////////////
let localFileElements = {
  form: document.querySelector(".local-file__form"),
  input: document.querySelector(".local-file__file"),
  label: document.querySelector(".local-file__label"),
  button: document.querySelector(".local-file__button"),
  tittle: document.querySelector(".local-file__tittle"),
};

export function getLocalFileElement(key) {
  return localFileElements[key];
}
////////////////////////////
let mainTittleElements = {
  tittle: document.querySelector(".main-tittle"),
};

export function getMainElement(key) {
  return mainTittleElements[key];
}
////////////////////////
let buttonElements = {
  element: document.querySelector(".buttons"),
  container: document.querySelector(".buttons__container"),
  pilots: document.querySelector(".buttons__pilots"),
  leaderboard: document.querySelector(".buttons__leaderboard"),
  rounds: document.querySelector(".buttons__rounds"),
  statistic: document.querySelector(".round__statistic-button"),
  view: document.querySelector(".round__view-button"),
};

export function addButton(buttonName, value) {
  buttonElements = { ...buttonElements, [buttonName]: value };
}
export function getButton(key) {
  return buttonElements[key];
}
////////////////////////////
let pilotsVsDuel = [];

export function setDuel(value) {
  pilotsVsDuel.push(value);
}
export function getDuel() {
  return pilotsVsDuel;
}
///////////////////////////////
let akcentArr = [];

export function setAkcent(index, value) {
  akcentArr[index] = value;
}
export function getAkcent() {
  return akcentArr;
}
