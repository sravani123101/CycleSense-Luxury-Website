# CycleSense AI — Luxury Website

A responsive React landing page with a black + blush luxury wellness aesthetic, animated falling petals, a procedural Three.js flower, GSAP scroll animations, and a demo email form.

## Requirements
- Node.js LTS installed
- VS Code (recommended)

## Run on Windows
1. Extract this ZIP.
2. Open the extracted `CycleSense_Luxury_Website` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run these commands one at a time:

```powershell
npm install
npm run dev
```

5. Open the local URL shown by Vite, usually `http://localhost:5173`.

## Files
- `src/App.jsx` — page sections, interactions, Three.js scene
- `src/styles.css` — full styling and responsive layout
- `src/main.jsx` — React entry point
- `index.html` — page metadata and fonts

## Customize
- Replace the Unsplash flower photo URL in `src/styles.css` with your own hero video or image.
- To use a hero video, put an MP4 file in `public/hero.mp4` and replace the `.hero-image` background with a `<video>` element in `src/App.jsx` using `autoPlay muted loop playsInline`.
- Update feature copy to match the real features in your CycleSense AI app.
- The email form is intentionally a frontend demo; it does not save or send addresses.
- The 3D flower is generated in code using Three.js; no external 3D model is required.

## Important
CycleSense AI is presented as a wellness companion, not a medical diagnosis tool. Do not claim cycle estimates or AI insights are medically certain. Before launch, connect the form to a backend and publish a clear privacy policy.
