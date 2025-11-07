// --- HMR persist fix ---
if (!window.__sharedStatesStore) {
	window.__sharedStatesStore = {
	  states: {
		 mainObj: {},
		 consecutivesCount: 3,
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
		 checkLiveDataInterval: null,
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
	  },
	  subscribers: {},
	  tabs: {},
	  localFileElements: {
		 form: document.querySelector(".local-file__form"),
		 input: document.querySelector(".local-file__file"),
		 label: document.querySelector(".local-file__label"),
		 button: document.querySelector(".local-file__button"),
		 tittle: document.querySelector(".local-file__tittle"),
	  },
	  mainTittleElements: {
		 tittle: document.querySelector(".main-tittle"),
	  },
	  buttonElements: {
		 element: document.querySelector(".buttons"),
		 container: document.querySelector(".buttons__container"),
		 pilots: document.querySelector(".buttons__pilots"),
		 leaderboard: document.querySelector(".buttons__leaderboard"),
		 rounds: document.querySelector(".buttons__rounds"),
		 statistic: document.querySelector(".round__statistic-button"),
		 view: document.querySelector(".round__view-button"),
	  },
	  pilotsVsDuel: [],
	  akcentArr: [],
	};
 }
 
 const {
	states,
	subscribers,
	tabs,
	localFileElements,
	mainTittleElements,
	buttonElements,
	pilotsVsDuel,
	akcentArr,
 } = window.__sharedStatesStore;
 // --- end HMR persist fix ---
 
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
 export function setTab(key, value) {
	tabs[key] = value;
 }
 
 export function getTab(key) {
	return tabs[key];
 }
 ////////////////////////////
 export function getLocalFileElement(key) {
	return localFileElements[key];
 }
 ////////////////////////////
 export function getMainElement(key) {
	return mainTittleElements[key];
 }
 ////////////////////////
 export function addButton(buttonName, value) {
	window.__sharedStatesStore.buttonElements = {
	  ...window.__sharedStatesStore.buttonElements,
	  [buttonName]: value,
	};
 }
 export function getButton(key) {
	return window.__sharedStatesStore.buttonElements[key];
 }
 ////////////////////////////
 export function setDuel(value) {
	pilotsVsDuel.push(value);
 }
 export function getDuel() {
	return pilotsVsDuel;
 }
 ///////////////////////////////
 export function setAkcent(index, value) {
	akcentArr[index] = value;
 }
 export function getAkcent() {
	return akcentArr;
 }
 