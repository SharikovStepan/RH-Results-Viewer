[![English](https://img.shields.io/badge/English-blue?style=flat)](README.en.md)

# RH Results Viewer

> Визуализация JSON Results данных из RotorHazard

**Демо:** [rh-results-viewer.vercel.app](https://rh-results-viewer.vercel.app)

Приложение для удобного просмотра результатов, записанных с помощью **RotorHazard**. Загрузите ваш `results.json` и получите наглядную статистику.

---

## Вы сможете смотреть:

<details open>
<summary><b>Статистику конкретного пилота</b></summary>
<br>
<img src="/previewGifs/pilotStat_ru.gif" alt="Статистика" width="600">
</details>

<details>
<summary><b>Общий лидерборд</b></summary>
<br>
<img src="/previewGifs/leaderboard_ru.gif" alt="Лидерборд" width="600">
</details>

<details>
<summary><b>Результаты раунда</b></summary>
<br>
<img src="/previewGifs/round_ru.gif" alt="Отдельный раунд" width="600">
</details>

<details>
<summary><b>Таблицу квалификаций</b></summary>
<br>
<img src="/previewGifs/quals_ru.gif" alt="Квалификации" width="600">
</details>

<details>
<summary><b>Сетку Double Elimination</b></summary>
<br>
<img src="/previewGifs/doubles_ru.gif" alt="Double Elimination" width="600">
</details>

---

## Три пути использования

### 1. Просмотр локального файла

Зайдите на **[rh-results.vercel.app](https://rh-results-viewer.vercel.app)** и загрузите локально ваш экспортированный файл `results.json`. Данные обрабатываются только в вашем браузере.

- **Хотите потыкать прямо сейчас?** Посмотрите уже загруженный файл результатов реальной гонки [**ВУПОМАНИЯ**](https://rh-results-viewer.vercel.app/?uuid=gYjp3Rd0Rw6_FGT-iVBm9g).

### 2. Через Telegram-бота (экспериментально)

Отправьте ваш `results.json` в телеграм-бота, чтобы сохранить событие в общем календаре и получить постоянную ссылку на результаты.

> ⚠️ **Данный способ пока не автоматизирован.** Все вопросы задавайте сюда: [Telegram](https://t.me/sharikov_stepan)

### 3. Плагин для RotorHazard (Результаты в реальном времени)

Установите **[плагин для RotorHazard](https://github.com/SharikovStepan/rv-live)**. Именно этот вариант дает возможность отображать **турнирные сетки** и **таблицы квалификаций** в реальном времени прямо во время ивента.
Это позволяет пилотам следить за ходом соревнования со своего смартфона, а организаторам — вывести результаты для зрителей на большой экран.

---

## Технологии

- **Язык:** Vanilla JavaScript (ES6+) — логика и интерфейс
- **Спец. модули:** React + Motion — используются для рендера турнирных сеток
- **Стили:** SCSS(Sass)
- **Сборка:** Vite

---

## Лицензия

[MIT](LICENSE)

---

## Контакты

По всем вопросам, предложениям и багрепортам:

- **Telegram:** [@sharikov_stepan](https://t.me/sharikov_stepan)
- **Email:** Stepkoy@live.com

---
