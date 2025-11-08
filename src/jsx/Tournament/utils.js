import { averageTime } from "../../js/utils";

export const setEmptyRace = (pilotsQuatity) => {
  const pilotsId = Array.from({ length: pilotsQuatity }, (_, index) => 0);
  const pilotsRacePlaces = Array.from({ length: pilotsQuatity }, (_, index) => {
    return { id: 0 };
  });
  const pilotsNames = Array.from({ length: pilotsQuatity }, (_, index) => {
    return { id: 0, name: null, nodeIndex: null };
  });

  return { pilotsId, pilotsNames, pilotsRoundPlaces: [], pilotsRacePlaces };
};

export const getResultRaces = (roundsArr, allSlots) => {
  const races = [];

  roundsArr.forEach((round) => {
    const pilotsId = round.nodes.map((pilot) => pilot["pilot_id"]).filter((id) => id != 0);

    const pilotsNames = pilotsId.map((pilotId) => {
      const pilotNode = round.nodes.find((pilot) => pilot.pilot_id == pilotId);
      const heatId = +round.heatId;
      const currentHeatSlotsPilots = allSlots.find((slot) => slot.heatId == heatId)?.pilots;
      const slotNodeIndex = currentHeatSlotsPilots?.find((pilot) => pilot.id == pilotId);
      const nodeIndex = slotNodeIndex?.nodeIndex || pilotNode.node_index;

      // console.log("pilotNode", pilotNode);

      // const pilotSlotInfo = slotInfo?.pilots.find((pilotInSlot) => pilotInSlot.id == pilotId);

      // const name = pilotSlotInfo?.callsign
      // const nodeIndex = pilotSlotInfo?.nodeIndex

      return { id: pilotId, name: pilotNode.callsign, nodeIndex: nodeIndex };
    });
    const pilotsRoundPlaces = round.nodes
      .map((pilot) => {
        const roundsSum = {};
        roundsSum.id = pilot.pilot_id;
        if (pilot.laps.length === 0) {
          roundsSum.time = 0;
          roundsSum.laps = 0;
        } else {
          const lapsArr = pilot.laps.filter((lap) => lap.deleted == false);
          roundsSum.time = lapsArr.reduce((acc, value) => acc + value["lap_time"], 0);
          roundsSum.laps = lapsArr.length;
        }
        return roundsSum;
      })
      .sort((a, b) => {
        if (a.laps !== b.laps) {
          return b.laps - a.laps;
        }

        if (a.time != null && b.time != null) {
          return a.time - b.time;
        }

        if (a.time == null && b.time != null) return 1;
        if (a.time != null && b.time == null) return -1;

        return 0;
      })
      .map((raceSum, index) => {
        const place = raceSum.id ? index + 1 : null;
        return { ...raceSum, place: place };
      });

    const noEmptyLaps = pilotsRoundPlaces.filter((round) => round.time != 0);
    const lapsquantity = noEmptyLaps.map((round) => round.laps);
    const maxLaps = Math.max(...lapsquantity);

    const fullRoundLaps = noEmptyLaps.filter((round) => round.laps == maxLaps);
    const lastLapTime = fullRoundLaps[fullRoundLaps.length - 1]?.time;
    const roundEndTime = getEndRoundTime(round.start_time_formatted.split(" ")[1], lastLapTime);

    const roundInfo = {
      roundId: +round.id,
      heatId: +round.heatId,
      roundStartTime: round.start_time_formatted.split(" ")[1],
      roundEndTime: roundEndTime,
      MES: `${round.start_time_formatted.split(" ")[1]}-${lastLapTime}`,
    };

    if (races.length === 0) {
      const raceData = { pilotsId, pilotsNames, pilotsRoundPlaces: [pilotsRoundPlaces], roundInfo: [roundInfo], roundsSum: 1 };
      races.push(raceData);
    } else {
      const prevRoundsSum = races[races.length - 1]["roundsSum"];
      const prevId = races[races.length - 1]["pilotsId"];

      const idSet = new Set(prevId);
      const isSameRace = pilotsId.every((id) => idSet.has(id));
      if (!isSameRace) {
        const raceData = { pilotsId, pilotsNames, pilotsRoundPlaces: [pilotsRoundPlaces], roundInfo: [roundInfo], roundsSum: 1 };
        races.push(raceData);
      } else {
        races[races.length - 1].pilotsNames = pilotsNames; //Обновляем pilotNames, чтобы были последние каналы
        races[races.length - 1].pilotsRoundPlaces.push(pilotsRoundPlaces);
        races[races.length - 1].roundInfo.push(roundInfo);
        races[races.length - 1].roundsSum = prevRoundsSum + 1;
      }
    }
  });

  return races;
};

export const setDuelPlaces = (races, raceQuantity, roundsQuantity, finalRoundsQuantity) => {
  const raceWithDuels = races.map((race, index) => {
    const roundsNeed = index != raceQuantity - 1 ? roundsQuantity : finalRoundsQuantity;
    if (race.roundsSum > roundsNeed) {
      const roundsWithDuels = race.pilotsRoundPlaces.map((value, index) => {
        if (index >= roundsNeed) {
          const duelScoreRound = value.map((pilotRoundInfo) => {
            if (pilotRoundInfo.laps == 0) {
              return { ...pilotRoundInfo, place: 0 };
            } else {
              const currentPlace = pilotRoundInfo.place;
              const duelPlace = currentPlace * 0.1;
              return { ...pilotRoundInfo, place: Number(duelPlace.toFixed(1)) };
            }
          });

          return duelScoreRound;
        } else {
          return value;
        }
      });
      return { ...race, pilotsRoundPlaces: roundsWithDuels };
    } else {
      return { ...race };
    }
  });
  return raceWithDuels;
};

export const setRaceScoresOld = (races) => {
  const racesWithScore = races.map((race) => {
    let pilotsRaceScores = [];
    const pilotsId = race.pilotsId;
    const raceTimes = race.pilotsRoundPlaces;
    pilotsId.forEach((pilotId) => {
      const pilotRacePlace = { id: pilotId, score: 0 };
      raceTimes.forEach((roundData) => {
        const pilotRoundData = roundData.filter((time) => time.id == pilotId);
        pilotRacePlace.score += pilotId ? pilotRoundData[0].place : 0;
      });
      pilotsRaceScores.push(pilotRacePlace);
    });

    const pilotsRacePlaces = pilotsRaceScores
      .sort((a, b) => {
        const scoreA = Number(a.score);
        const scoreB = Number(b.score);

        if (scoreA === 0 && scoreB === 0) return 0;
        if (scoreA === 0) return 1;
        if (scoreB === 0) return -1;

        return scoreA - scoreB;
      })
      .map((scoreData, index) => {
        const place = scoreData.id ? index + 1 : null;
        return { ...scoreData, place: place };
      });
    return { ...race, pilotsRacePlaces };
  });

  return racesWithScore;
};

export const setRaceScores = (races, pilotsQuatity) => {
  const racesWithScore = races.map((race) => {
    let pilotsRaceScores = [];
    const pilotsId = race.pilotsId;
    const raceTimes = race.pilotsRoundPlaces;
    pilotsId.forEach((pilotId) => {
      const pilotRacePlace = { id: pilotId, score: 0 };
      raceTimes.forEach((roundData) => {
        const pilotRoundData = roundData.filter((time) => time.id == pilotId);
        pilotRacePlace.score += pilotId ? pilotsQuatity - pilotRoundData[0].place : 0;
      });
      pilotsRaceScores.push(pilotRacePlace);
    });

    const pilotsRacePlaces = pilotsRaceScores
      .sort((a, b) => {
        const scoreA = Number(a.score);
        const scoreB = Number(b.score);

        if (scoreA === 0 && scoreB === 0) return 0;
        if (scoreA === 0) return 1;
        if (scoreB === 0) return -1;

        return scoreB - scoreA;
      })
      .map((scoreData, index) => {
        const place = scoreData.id ? index + 1 : null;
        return { ...scoreData, place: place };
      });
    return { ...race, pilotsRacePlaces };
  });

  return racesWithScore;
};

export const setRaceStatus = (races, raceQuantity, roundsQuantity, finalRoundsQuantity) => {
  const racesWithStatus = races.map((race, index) => {
    if (index != races.length - 1) {
      return { ...race, status: "complete" };
    } else {
      const roundNeedQuantity = index != raceQuantity - 1 ? roundsQuantity : finalRoundsQuantity;
      if (race.roundsSum < roundNeedQuantity) {
        const roundsAndEmpty = Array.from({ length: roundNeedQuantity }, (_, index) => {
          if (index > race.pilotsRoundPlaces.length - 1) {
            const emptyRound = race.pilotsId.map((pilotId) => {
              return { id: pilotId, time: 0, laps: 0, place: 0 };
            });
            return emptyRound;
          } else {
            return [...race.pilotsRoundPlaces[index]];
          }
        });
        return { ...race, pilotsRoundPlaces: roundsAndEmpty, status: "current" };
      } else if (race.roundsSum == roundNeedQuantity) {
        const placesArr = race.pilotsRacePlaces.map((race) => race.score);
        const placesArrFilter = placesArr.filter((place) => place != 0);
        const uniqueScoreSet = new Set(placesArrFilter);
        if (placesArrFilter.length != uniqueScoreSet.size) {
          const rounds = race.pilotsRoundPlaces;
          const emptyRound = race.pilotsId.map((pilotId) => {
            return { id: pilotId, time: 0, laps: 0, place: 0 };
          });
          return { ...race, pilotsRoundPlaces: [...rounds, emptyRound], status: "current" };
        } else {
          return { ...race, status: "lastComplete" };
        }
      } else {
        return { ...race, status: "lastComplete" };
      }
    }
  });
  return racesWithStatus;
};

export const getPlannedRaces = (slots, roundsQuantity, pilotsPerHeat = 4) => {
  const plannedRaces = slots.map((heat, index) => {
    let pilots = heat.pilots;

    if (pilots) {
      if (pilots.length < pilotsPerHeat) {
        const fullPilots = Array.from({ length: pilotsPerHeat }, (_, index) => {
          if (pilots[index]) {
            return pilots[index];
          } else {
            return { id: 0, callsign: null };
          }
        });
        pilots = fullPilots;
      }

      const pilotsId = pilots.map((pilot) => pilot.id);
      const pilotsNames = pilots.map((pilot) => {
        return { id: pilot.id, name: pilot.callsign, nodeIndex: pilot.nodeIndex };
      });
      const racePlaces = pilots.map((pilot) => {
        return { id: pilot.id };
      });

      const emptyRounds = Array.from({ length: roundsQuantity }, (round) => {
        const emptyRound = pilotsId.map((pilotId) => {
          return { id: pilotId, time: 0, laps: 0, place: 0 };
        });
        return emptyRound;
      });

      const status = index == 0 ? "next" : "planned";
      return { pilotsId, pilotsNames, pilotsRoundPlaces: emptyRounds, pilotsRacePlaces: racePlaces, roundInfo: [], status: status };
    } else {
      console.log("Пилотов в слотах нет!");
    }
  });

  //возвращаем, только есть пилотов с лотах нашли
  return plannedRaces.filter((race) => race);
};

export const addEmptyRaces = (allKnownRaces, raceQuantity, pilotsPerHeat = 4) => {
  let fullQuantityRaces = [];
  if (allKnownRaces.length != raceQuantity) {
    fullQuantityRaces = Array.from({ length: raceQuantity }, (_, index) => {
      if (index <= allKnownRaces.length - 1) {
        return { ...allKnownRaces[index] };
      } else {
        //   const emptyRoundsQuantity = index != getState("tournamentRaceQuantity") - 1 ? getState("tournamentRoundsQuantity") : getState("tournamentFinalRoundsQuantity");
        //   const emptyRounds = Array.from({ length: emptyRoundsQuantity }, (round) => {
        //     const emptyRound = writeEmptyRace(getState("tournamentPilotsPerHeat"));
        //     return emptyRound;
        //   });
        return { ...setEmptyRace(pilotsPerHeat), pilotsRoundPlaces: [], status: "empty" };
      }
    });
  }
  return fullQuantityRaces;
};

// export const getChannel = (channelRawData, nodeIndex) => {
//   const band = channelRawData.frequencies.b[nodeIndex];
//   const channel = channelRawData.frequencies.c[nodeIndex];
// };

export const getChannelsAndColors = (channelRawData, colorsArr) => {
  const bands = channelRawData.frequencies.b;
  const channels = channelRawData.frequencies.c;

  const channelsIndex = bands.map((band, index) => {
    const channelData = {};

    if (band) {
      channelData.channel = `${band}${channels[index]}`;
      channelData.nodeIndex = index;
    } else {
      channelData.channel = null;
    }

    return channelData;
  });

  const channelsFiltered = channelsIndex.filter((channel) => channel.channel != null);

  const channelsAndColors = channelsFiltered.map((channel, index) => {
    return { ...channel, color: colorsArr[index] };
  });
  return channelsAndColors;
};

export const getRacesTime = (allRaces) => {
  const raceTimes = [];
  allRaces.forEach((race, index) => {
    const raceInfo = {};
    const raceIndex = index + 1;
    const rounds = race.roundInfo;
    const firstRound = rounds[0];
    const lastRound = rounds[rounds.length - 1];
    //  console.log("firstRound", firstRound);
    //  console.log("lastRound", lastRound);

    const raceTime = getTimeDiff(firstRound.roundStartTime, lastRound.roundEndTime);

    raceInfo.race = raceIndex;
    raceInfo.roundsQuantity = rounds.length;
    raceInfo.time = raceTime;
    raceInfo.start = firstRound.roundStartTime;
    raceInfo.end = lastRound.roundEndTime;
    raceTimes.push(raceInfo);
  });
  const raceTimesTimesArr = raceTimes.map((time) => time.time);
  const raceTimesTimesAVG = averageTime(raceTimesTimesArr);

  console.log("raceTimes", raceTimes);
  console.log("raceTimesTimesAVG", raceTimesTimesAVG);
};

export const getRoundsPauses = (allRaces) => {
  const pauseRoundsTimes = [];
  allRaces.forEach((race, index) => {
    const raceIndex = index + 1;
    const rounds = race.roundInfo;
    rounds.forEach((round, index) => {
      const roundInfo = {};
      const currentRoundEnd = round.roundEndTime;
      const nextIndex = rounds.length != index + 1 ? index + 1 : index;
      const nextRoundStart = rounds[nextIndex].roundStartTime;
      const pauseTime = getTimeDiff(currentRoundEnd, nextRoundStart);
      roundInfo.race = raceIndex;
      // roundInfo.heatId = round.heatId;
      roundInfo.rounds = `${round.roundId}-${rounds[nextIndex].roundId}`;
      roundInfo.pauseTime = pauseTime;
      roundInfo.roundEnd = currentRoundEnd;
      roundInfo.nextRoundStart = nextRoundStart;
      if (index != rounds.length - 1) pauseRoundsTimes.push(roundInfo);
    });
  });
  const pauseRoundsTimesArr = pauseRoundsTimes.map((time) => time.pauseTime);
  const pauseRoundsTimesAVG = averageTime(pauseRoundsTimesArr);

  console.log("pauseRoundsTimes", pauseRoundsTimes);
  console.log("pauseRoundsTimesAVG", pauseRoundsTimesAVG);
};

export const getRacesPauses = (allRaces) => {
  const pauseHeatTimes = [];

  allRaces.forEach((race, index) => {
    const pauseInfo = {};
    const lastRound = race.roundInfo[race.roundInfo.length - 1];
    const nextIndex = allRaces.length != index + 1 ? index + 1 : index;
    const nextRaceRound = allRaces[nextIndex].roundInfo[0];
    const pauseTime = getTimeDiff(lastRound.roundEndTime, nextRaceRound.roundStartTime);
    pauseInfo.races = `${index + 1}-${index + 2}`;

    //  pauseInfo.heats = `${lastRound.heatId}-${nextRaceRound.heatId}`;
    //  pauseInfo.rounds = `${lastRound.roundId}-${nextRaceRound.roundId}`;
    pauseInfo.pauseTime = pauseTime;
    pauseInfo.lastRoundEnd = lastRound.roundEndTime;
    pauseInfo.nextRoundStart = nextRaceRound.roundStartTime;
    if (index != allRaces.length - 1) pauseHeatTimes.push(pauseInfo);
  });
  const pauseHeatTimesArr = pauseHeatTimes.map((time) => time.pauseTime);
  const pauseHeatTimesAVG = averageTime(pauseHeatTimesArr);

  console.log("pauseHeatTimes", pauseHeatTimes);
  console.log("pauseHeatTimesAVG", pauseHeatTimesAVG);
};

export const getEndRoundTime = (timeString, milliseconds) => {
  // Разбиваем время на компоненты
  const [hours, minutes, secondsWithMs] = timeString.split(":");
  const [seconds, millisecondsPart] = secondsWithMs.split(".");

  // Преобразуем все в миллисекунды
  const totalOriginalMs = parseInt(hours) * 3600000 + parseInt(minutes) * 60000 + parseInt(seconds) * 1000 + parseInt(millisecondsPart);

  // Прибавляем миллисекунды
  const totalResultMs = totalOriginalMs + Math.round(milliseconds);

  // Вычисляем новые компоненты времени
  const resultHours = Math.floor(totalResultMs / 3600000) % 24;
  const resultMinutes = Math.floor((totalResultMs % 3600000) / 60000);
  const resultSeconds = Math.floor((totalResultMs % 60000) / 1000);
  const resultMilliseconds = totalResultMs % 1000;

  // Форматируем результат
  return `${resultHours.toString().padStart(2, "0")}:${resultMinutes.toString().padStart(2, "0")}:${resultSeconds.toString().padStart(2, "0")}.${resultMilliseconds.toString().padStart(3, "0")}`;
};

export function getTimeDiff(time1, time2) {
  // Функция для преобразования времени в миллисекунуды
  function timeToMilliseconds(timeString) {
    const [hours, minutes, secondsWithMs] = timeString.split(":");
    const [seconds, milliseconds] = secondsWithMs.split(".");

    return parseInt(hours) * 3600000 + parseInt(minutes) * 60000 + parseInt(seconds) * 1000 + parseInt(milliseconds);
  }

  // Конвертируем оба времени в миллисекунды
  const ms1 = timeToMilliseconds(time1);
  const ms2 = timeToMilliseconds(time2);

  // Вычисляем разницу
  const differenceMs = Math.abs(ms2 - ms1);

  // Преобразуем разницу обратно в читаемый формат
  const hours = Math.floor(differenceMs / 3600000);
  const minutes = Math.floor((differenceMs % 3600000) / 60000);
  const seconds = Math.floor((differenceMs % 60000) / 1000);
  const milliseconds = differenceMs % 1000;

  // Форматируем результат
  const formatted = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;

  return formatted;
}

export const getStringGap = (timeStamp, previousTimeStamp) => {
  const gapTimeStamp = timeStamp - previousTimeStamp;
  const formatted = gapTimeStamp / 1000;
  const fixed = formatted.toFixed(3);

  const minutes = Math.floor(fixed / 60);
  const secconds = Math.floor(fixed % 60);
  const milliseconds = Math.floor((fixed % 1) * 1000);

  return `+${minutes}:${String(secconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
};
