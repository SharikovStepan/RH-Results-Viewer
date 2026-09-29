import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";

const redis = Redis.fromEnv();

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    setCorsHeaders(res);
    return res.status(204).end();
  }

  setCorsHeaders(res);

  const isDeleting = !!req.body.deleteUuid;
  const isChangeDate = !!req.body.changeDate;

  // =====================================================
  // DELETE
  // =====================================================

  if (isDeleting) {
    try {
      const uuid = req.body.deleteUuid;

      const exists = await redis.get(uuid);

      if (!exists) {
        return res.status(404).json({
          ok: false,
          message: "UUID not found",
        });
      }

      await redis.del(uuid);

      const filesRaw = await redis.get("FILES");
      let files = Array.isArray(filesRaw) ? filesRaw : [];

      files = files.filter((e) => e.uuid !== uuid);

      await redis.set("FILES", files);

      return res.status(200).json({
        ok: true,
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        ok: false,
        message: err.message,
      });
    }
  }

  // =====================================================
  // CHANGE DATE
  // =====================================================

  if (isChangeDate) {
    try {
      const { uuid, eventStart, lastUpdate } = req.body.changeDate;

const raw = await redis.get(uuid);

if (!raw) {
  return res.status(404).json({
    ok: false,
    message: "UUID not found",
  });
}

// Upstash может вернуть уже объект
const file = typeof raw === "string" ? JSON.parse(raw) : raw;

file.data.lastUpdate = lastUpdate;

// сохраняем объект обратно
await redis.set(uuid, file);

      const filesRaw = await redis.get("FILES");
      const files = Array.isArray(filesRaw) ? filesRaw : [];

      const index = files.findIndex((f) => f.uuid === uuid);

      if (index === -1) {
        return res.status(404).json({
          ok: false,
          message: "UUID not found in FILES",
        });
      }

      files[index].meta.eventStart = eventStart;
      files[index].meta.lastUpdate = lastUpdate;

      await redis.set("FILES", files);

      return res.status(200).json({
        ok: true,
      });
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        ok: false,
        message: err.message,
      });
    }
  }

  // =====================================================
  // UPLOAD
  // =====================================================

  try {
    const longUuid = randomUUID();

    const buf = Buffer.from(longUuid.replace(/-/g, ""), "hex");

    const uuid = buf
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const { caption: eventName, jsonData } = req.body;

    const eventStart = getEventTime(jsonData, false);

    const completeData = {
      uuid,
      key: "",
      isFinished: true,
      data: {
        lastUpdate: null,
        eventName,
        results: jsonData,
      },
    };

    await redis.set(uuid, JSON.stringify(completeData));

    const filesRaw = await redis.get("FILES");
    const files = Array.isArray(filesRaw) ? filesRaw : [];

    files.push({
      uuid,
      meta: {
        eventName,
        eventStart,
        lastUpdate: null,
        isFinished: true,
      },
    });

    await redis.set("FILES", files);

    return res.status(200).json({
      ok: true,
      uuid,
      eventStart: eventStart.slice(0, -7),
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      message: err.message,
    });
  }
}

function getEventTime(data, reverse) {
  if (!data.heats) return null;

  const heatKeys = Object.keys(data.heats).sort((a, b) => Number(a) - Number(b));
  if (heatKeys.length === 0) return null;

  const heat = data.heats[heatKeys[reverse ? heatKeys.length - 1 : 0]];
  if (!heat.rounds?.length) return null;

  const round = heat.rounds[reverse ? heat.rounds.length - 1 : 0];

  return round.start_time_formatted ?? null;
}


// import { Redis } from "@upstash/redis";
// import { randomUUID } from "crypto";
// const redis = Redis.fromEnv();

// function setCorsHeaders(res) {
//   res.setHeader("Access-Control-Allow-Origin", "*"); // или конкретный домен
//   res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type");
//   // res.setHeader('Access-Control-Allow-Credentials', 'true');  // если нужны куки
// }

// export default async function handler(req, res) {
//   if (req.method === "OPTIONS") {
//     setCorsHeaders(res);
//     return res.status(204).end(); // No Content
//   }
//   setCorsHeaders(res);
//   const isDeletingCommand = req.body.deleteUuid ? true : false;
//   if (isDeletingCommand) {
//     try {
//       const uuidToDelete = req.body.deleteUuid;
//       // console.log("uuidToDelete, ", uuidToDelete);

//       await redis.del(uuidToDelete);

//       const filesRaw = await redis.get("FILES");
//       let filesList = Array.isArray(filesRaw) ? filesRaw : [];

//       filesList = filesList.filter((entry) => entry.uuid !== uuidToDelete);

//       await redis.set("FILES", filesList);

//       return res.status(204).json({ ok: true });
//     } catch (error) {
//       console.error(error);
//       return res.status(400).json({ ok: false });
//     }
//   } else {
//     const longUuid = randomUUID();
//     const buf = Buffer.from(longUuid.replace(/-/g, ""), "hex");
//     let b64 = buf.toString("base64");

//     b64 = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); // делаем URL-safe: + → -, / → _, убираем = в конце

//     const uuid = b64;

//     try {
//       const body = req.body;
//       const eventName = body.caption;
//       const data = body.jsonData;
//       const eventStart = getEventTime(data, false);
//       // const lastUpdateDate = new Date(getEventTime(data, true).replace(" ", "T"));
//       // const lastUpdate = lastUpdateDate.getTime();

//       const completeData = {
//         uuid,
//         key: "",
//         isFinished: true,
//         data: {
//           lastUpdate: null,
//           eventName,
//           results: data,
//         },
//       };

//       await redis.set(uuid, JSON.stringify(completeData));

//       const filesRaw = await redis.get("FILES");
//       let filesList = Array.isArray(filesRaw) ? filesRaw : [];

//       const meta = {
//         isFinished: true,
//         lastUpdate: null,
//         eventStart,
//         eventName,
//       };

//       filesList = filesList.filter((entry) => entry.uuid !== uuid);

//       filesList.push({ uuid, meta });

//       await redis.set("FILES", filesList);

//       return res.status(200).json({ ok: true, eventStart: eventStart.slice(0, -7), uuid });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ status: "error", message: err.message });
//     }
//   }
// }

// function getEventTime(data, reverse) {
//   if (!data.heats) return null;

//   // Получаем список ключей heats и сортируем их как числа
//   const heatKeys = Object.keys(data.heats).sort((a, b) => Number(a) - Number(b));
//   if (heatKeys.length === 0) return null;

//   const heat = data.heats[heatKeys[reverse ? heatKeys.length - 1 : 0]];
//   if (!heat.rounds || heat.rounds.length === 0) return null;

//   const round = heat.rounds[reverse ? heat.rounds.length - 1 : 0];
//   const formatedTime = round.start_time_formatted || null;

//   return formatedTime || null;
// }
