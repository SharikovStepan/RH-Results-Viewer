[![Русский](https://img.shields.io/badge/Русский-blue?style=flat)](README.md)

# RH Results Viewer

> Visualizing JSON results from RotorHazard

**Live demo:** [rh-results-viewer.vercel.app](https://rh-results-viewer.vercel.app)

Web-application for easy viewing of race results recorded with **RotorHazard**. Upload your `results.json` to get clear statistics and insights.

---

## Features

<details open>
<summary><b>Individual Pilot Statistics</b></summary>
<br>
<img src="/previewGifs/pilotStat_en.gif" alt="Pilot Stats" width="600">
</details>

<details>
<summary><b>Leaderboard</b></summary>
<br>
<img src="/previewGifs/leaderboard_en.gif" alt="Leaderboard" width="600">
</details>

<details>
<summary><b>Round Results</b></summary>
<br>
<img src="/previewGifs/round_en.gif" alt="Round Results" width="600">
</details>

<details>
<summary><b>Qualification Tables</b></summary>
<br>
<img src="/previewGifs/quals_en.gif" alt="Quals" width="600">
</details>

<details>
<summary><b>Double Elimination Brackets</b></summary>
<br>
<img src="/previewGifs/doubles_en.gif" alt="Brackets" width="600">
</details>

---

## Three ways to use

### 1. Local File Viewer

Visit **[rh-results.vercel.app](https://rh-results-viewer.vercel.app)** and upload your exported `results.json` file. All data is processed locally in your browser.

- **Want to scroll it right now?** Check out a real race results: [**WHOOPMANIA**](https://rh-results-viewer.vercel.app/?uuid=gYjp3Rd0Rw6_FGT-iVBm9g).

### 2. Via Telegram Bot (Experimental)

Send your `results.json` to the Telegram bot to save the event in a public calendar and get a permanent link to the results.

> ⚠️ **This method is not yet automated.** For any questions, contact: [Telegram](https://t.me/sharikov_stepan)

### 3. RotorHazard Plugin (Live-update Results)

Install the **[RotorHazard plugin](https://github.com/SharikovStepan/rv-live)**. This option enables **tournament brackets** and **qualification tables** with live updating during the event.
This allows pilots to track their progress from their smartphones and organizers to display results on a big screen for spectators.

---

## Tech Stack

- **Language:** Vanilla JavaScript (ES6+) — core logic and UI
- **Custom Modules:** React + Motion — used for rendering tournament brackets
- **Styles:** SCSS (Sass)
- **Build Tool:** Vite

---

## License

[MIT](LICENSE)

---

## Contacts

For questions, suggestions, or bug reports:

- **Telegram:** [@sharikov_stepan](https://t.me/sharikov_stepan)
- **Email:** Stepkoy@live.com

---
