# 🍅 tomato time

A whimsical, hand-drawn pomodoro timer. Plain HTML, CSS and JavaScript, with no build step and no dependencies.

**Live demo:** https://YOUR-USERNAME.github.io/tomato-time/

## Features

- Focus, short break and long break timers with a hand-drawn progress ring
- Start, pause, resume, restart and skip, with keyboard shortcuts (`Space`, `R`, `S`)
- Session stars that show how close you are to a long break
- To-do list where you pick the task you are working on and collect a 🍅 for each finished session
- Daily stats: tomatoes, focus minutes and an all-time total
- Settings for durations, long break interval, auto-start, chime and desktop notifications
- Accurate timing that keeps running in background tabs
- Everything is saved in your browser (`localStorage`), so nothing leaves your device
- Responsive layout, and it follows your light or dark system theme

## Project structure

```
tomato-time/
├── index.html
├── css/style.css
├── js/app.js
├── assets/favicon.svg
└── .github/workflows/pages.yml   # deploys to GitHub Pages
```

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Deploy with GitHub Pages

1. Push this project to the `main` branch of your repository.
2. Go to **Settings → Pages**, and under **Build and deployment** set **Source** to **GitHub Actions**.
3. The included workflow publishes the site on every push to `main`. Your URL will be `https://YOUR-USERNAME.github.io/REPO-NAME/`.

Any static host (Netlify, Vercel, Cloudflare Pages) also works: point it at the project root, with no build command.

## Customize

- Colors, fonts and spacing are CSS variables at the top of `css/style.css`.
- Default timer lengths and settings are in the `def` object at the top of `js/app.js`.

## Credits

Fonts: [Gaegu](https://fonts.google.com/specimen/Gaegu) and [Patrick Hand](https://fonts.google.com/specimen/Patrick+Hand) from Google Fonts (SIL Open Font License).

## License

[MIT](LICENSE)
