import { PLACE_RACE_NUMS_OLD, PLACE_TABLE_RACES } from "./const";

export const getDoubles16ResultsOLD = (raceData, qualsPlaces) => {
  const racePhases = [...PLACE_RACE_NUMS_OLD];
  const raceDataArr = [...raceData];

  const racesArrs = racePhases.map((racePhase) => {
    const races = raceDataArr.filter((race, index) => racePhase.placeRaceNums.includes(index + 1));
    return races;
  });
  console.log("racesArrs", racesArrs);

  const pilotPhasePlaces = racesArrs.map((races) => {
    const allPilotsArrs = races.map((race) => race.pilotsRacePlaces);
    const losers = allPilotsArrs
      .map((pilots) => pilots.slice(2))
      .flat()
      .sort((a, b) => a.place - b.place);

    return losers;
  });

  const results = pilotPhasePlaces.map((pilots, index) => {
    const racePhasePlacesText = racePhases[index].placeText;
    const phaseLastPlace = racePhases[index].lastPlaceNum;

    const pilotsWithQualPlace = pilots.map((pilot) => {
      const qualsPlaceInfo = qualsPlaces.find((place) => place.id == pilot.id);
      const qualsPlaceNum = qualsPlaceInfo ? qualsPlaceInfo.place : phaseLastPlace;
      const isQualsResults = qualsPlaceInfo ? true : false;
      return { ...pilot, qualsPlace: qualsPlaceNum, isQualsResults };
    });

    const pilotsWithQualPlaceSorted = pilotsWithQualPlace.sort((a, b) => b.place - a.place || b.qualsPlace - a.qualsPlace);

    console.log("pilotsWithQualPlaceSorted", pilotsWithQualPlaceSorted);

    //  return pilotsWithPlace;
  });

  return results;
};

export const getDoubles16Results = (raceData) => {
  const lastRaceNum = 14;
  let placeCount = 16;
  console.log("raceData", raceData);

  //   const isLastRaceComplete =

  const pilotsQuantity = 16;

  const raceNums = [...PLACE_TABLE_RACES];
  const lowTableRaces = raceData.filter((race, index) => raceNums.includes(index + 1));

  const losePilotsSorted = lowTableRaces.map((race) => {
    const isRaceComplete = race.status == "lastComplete" || race.status == "complete" ? true : false;
    if (isRaceComplete) {
      const sliceNum = race.raceNum == lastRaceNum ? 0 : 2;
      const pilotsName = race.pilotsNames;
      const pilots = race.pilotsRacePlaces.slice(sliceNum).sort((a, b) => b.place - a.place);

      const pilotsWithNames = pilots.map((pilotData) => {
        const pilotName = pilotsName.find((pilot) => pilot.id == pilotData.id);
        return { ...pilotData, pilotName: pilotName.name };
      });

      return pilotsWithNames;
    } else {
      return { id: 0, place: 0, pilotName: "-" };
    }
  });

  const pilotsWithPlace = losePilotsSorted.flat().map((pilot) => {
    const doubles16Place = placeCount;
    placeCount--;
    return { ...pilot, doubles16Place };
  });

  const pilotsWithPlaceAndEmpty = Array.from({ length: pilotsQuantity }, (_, index) => {
    const placeData = pilotsWithPlace[index];
    if (placeData) {
      return placeData;
    } else {
      const place = placeData ? placeData?.doubles16Place : placeCount;
      placeCount--;
      return { id: 0, place: 0, pilotName: "-", doubles16Place: place };
    }
  });


  return pilotsWithPlaceAndEmpty;
};
