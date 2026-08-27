import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  //   res.setHeader("Access-Control-Allow-Origin", "https://rh-results-viewer.vercel.app/");
  res.setHeader("Access-Control-Allow-Origin", "*"); 
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET", "OPTIONS"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { name, dateFrom, dateTo, date, last, batching } = req.query;

    if (!name && !dateFrom && !dateTo && !date && !last) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    const filters = [];

    if (name) {
      filters.push((result) => {
        const eventName = result.meta.eventName.toLowerCase();
        const queryName = name.toLowerCase();

        return eventName.includes(queryName);
      });
    }

    //  if (dateFrom) {
    //    const from = new Date(`${dateFrom}T00:00:00`);

    //    filters.push((result) => {
    //      return new Date(result.meta.eventStart.replace(" ", "T")) >= from;
    //    });
    //  }

    //  if (dateTo) {
    //    const to = new Date(`${dateTo}T23:59:59.999`);

    //    filters.push((result) => {
    //      return new Date(result.meta.eventStart.replace(" ", "T")) <= to;
    //    });
    //  }

    if (dateFrom) {
      filters.push((result) => {
        return result.meta.eventStart >= `${dateFrom} 00:00:00.000`;
      });
    }

    if (dateTo) {
      filters.push((result) => {
        return result.meta.eventStart < `${dateTo} 23:59:59.999`;
      });
    }

    if (date) {
      const [year, month, day] = date.split("-").map(Number);

      const next = new Date(year, month - 1, day + 1);

      const nextDate = [next.getFullYear(), String(next.getMonth() + 1).padStart(2, "0"), String(next.getDate()).padStart(2, "0")].join("-");

      filters.push((result) => {
        const eventStart = result.meta.eventStart;

        return eventStart >= `${date} 00:00:00.000` && eventStart < `${nextDate} 00:00:00.000`;
      });
    }
    const files = await redis.get("FILES");

    const filteredFiles = files.filter((result) => filters.every((filter) => filter(result))).sort((a, b) => a.meta.lastUpdate - b.meta.lastUpdate);

    const lastCount = last ? Number(last) : null;

    if (lastCount !== null && (!Number.isInteger(lastCount) || lastCount <= 0)) {
      return res.status(400).json({
        success: false,
        message: "last must be a positive integer",
      });
    }

    const filesToLoad = lastCount ? filteredFiles.slice(-lastCount) : filteredFiles;

    const uuids = filesToLoad.map((file) => file.uuid);

    //  const filesFromDb = await Promise.all(uuids.map((uuid) => redis.get(uuid)));

    const BATCH_SIZE = Number(batching) || 5;
    const CONCURRENCY = 3;

    const uuidChunks = [];
    for (let i = 0; i < uuids.length; i += BATCH_SIZE) {
      uuidChunks.push(uuids.slice(i, i + BATCH_SIZE));
    }

    const filesFromDb = [];

    for (let i = 0; i < uuidChunks.length; i += CONCURRENCY) {
      const chunks = uuidChunks.slice(i, i + CONCURRENCY);

      console.log("Loading batches", `${i + CONCURRENCY}/${uuidChunks.length}`);

      const batchResults = await Promise.all(chunks.map((chunk) => redis.mget(...chunk)));

      filesFromDb.push(...batchResults.flat());
    }

    //  const filesFromDb = (await Promise.all(uuidChunks.map((chunk) => redis.mget(...chunk)))).flat();

    const filesToSend = filesFromDb.map((file, index) => {
      if (!file) return null;

      const eventName = file.data.eventName;
      // const metaName = filesToLoad[index].meta.eventName;
      const date = filesToLoad[index].meta.eventStart;
      const lastUpdate = filesToLoad[index].meta.lastUpdate;
      const raceTypesByClassId = {};

      if (file.data.raceTypesByClass) {
        file.data.raceTypesByClass.forEach((type) => {
          raceTypesByClassId[type.raceClassId] = type.raceType == "" ? "practice" : type.raceType;
        });
      } else {
        const raceClasses = Object.keys(file.data.results.classes);

        raceClasses.forEach((raceClass) => (raceTypesByClassId[raceClass] = "practice"));
      }

      const results = file.data.results;

      return { eventName, metaName, date, raceTypesByClassId };
    });

    //  const data = typeof redisResponse === "string" ? JSON.parse(redisResponse) : redisResponse;

    return res.status(200).json({
      success: true,
      data: filesToSend,
    });
  } catch (error) {
    console.error("Redis getResults error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
}

//REST API Версия
/*
const qwe = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://rh-results-viewer.vercel.app/");
  //   res.setHeader("Access-Control-Allow-Origin", "*"); //для локальной проверки
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "GET") {
    try {
      const { uuid } = req.query;

      if (!uuid) {
        return res.status(400).json({
          success: false,
          error: "Не указан UUID",
        });
      }

      const redisResponse = await fetch(`${process.env.KV_REST_API_URL}/get/${uuid}`, {
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });

      if (!redisResponse.ok) {
        throw new Error("Данные не найдены в Redis");
      }

      const responseData = await redisResponse.json();

      // Если ключ не существует, Redis вернет { result: null }
      if (responseData.result === null) {
        return res.status(404).json({
          success: false,
          error: "Данные не найдены или истек срок хранения",
        });
      }

      // Парсим результат (если он пришел как строка)
      const data = typeof responseData.result === "string" ? JSON.parse(responseData.result) : responseData.result;

      res.status(200).json({
        success: true,
        data: data,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  } else {
    res.status(405).json({
      success: false,
      error: "Method not allowed",
    });
  }
};

*/
