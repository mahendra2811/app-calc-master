# CalcMaster — Distribution Guide

How a fresh production build gets from this repo onto a user's Android phone.

## The two projects

| Project | Purpose | Path |
|---|---|---|
| **CalcMaster** (this repo) | Expo / React Native source — the actual Android app | `/home/primathon/Documents/p_projet/a_APP/3. multi calculator/CalcMaster/` |
| **calcMaster-web** | Single-page landing & download site (plain HTML, hosted on Vercel) | `/home/primathon/Documents/p_projet/a_web/calcMaster-web/` |

The pattern mirrors the existing **callVault → callNest-web** pairing in this workspace.

```
┌─────────────────────┐    eas build     ┌─────────────────┐    drop & deploy   ┌──────────────────┐
│  CalcMaster (app)   │ ───────────────▶ │   APK file      │ ─────────────────▶ │  calcMaster-web  │
│  Expo / RN source   │                  │  (~tens of MB)  │                    │   (Vercel)       │
└─────────────────────┘                  └─────────────────┘                    └──────────────────┘
                                                                                          │
                                                                                          ▼
                                                                                   end user downloads
                                                                                   .apk and sideloads
```

## End-to-end release flow

### 1. Build the APK in this repo

```bash
cd "/home/primathon/Documents/p_projet/a_APP/3. multi calculator/CalcMaster"
eas build --platform android --profile production
```

When EAS finishes, download the resulting `.apk` from the EAS dashboard (or the link the CLI prints).

### 2. Drop the APK into the web project

```bash
mv ~/Downloads/<file-from-eas>.apk \
   "/home/primathon/Documents/p_projet/a_web/calcMaster-web/apk/CalcMaster-latest.apk"
```

The filename **must** be `CalcMaster-latest.apk` — that's what `index.html` links to.

### 3. Bump the version label on the site

If `version` in `app.config.js` changed, update the matching constant in the landing page:

`/home/primathon/Documents/p_projet/a_web/calcMaster-web/index.html`

```js
const VERSION = 'v1.0.1';   // ← change this one line
```

That single constant stamps the version onto every `Download` button, the footer, etc.

### 4. Deploy

```bash
cd "/home/primathon/Documents/p_projet/a_web/calcMaster-web"
npx vercel --prod
```

First-time setup: run `npx vercel` once to link the project, then `npx vercel --prod` to promote.

### 5. Share the link

The Vercel URL (or your custom domain) is what you share with users. They tap **Download APK**, install with sideload, done.

## Local dev — install the debug APK on a wired phone

This is what we used during development (no EAS, no website — just adb + Expo):

```bash
cd "/home/primathon/Documents/p_projet/a_APP/3. multi calculator/CalcMaster"
adb devices                       # confirm phone is connected
npx expo run:android              # builds debug APK + installs + starts Metro
```

If `adb devices` shows a phantom `emulator-5554 offline`: stop any local container that binds host port 5555 (e.g. `docker stop j_Hunter-flower`), then `adb kill-server && adb start-server`.

## Related docs

- [`SETUP.md`](./SETUP.md) — local development setup (Expo, dependencies, env vars)
- [`calcMaster-web/README.md`](../../../a_web/calcMaster-web/README.md) — the landing-site repo (deploy + APK update)

## When to update what

| Change | Update here | Update in calcMaster-web |
|---|---|---|
| App version bump | `app.config.js` → `version`, `package.json` → `version` | `index.html` → `VERSION` constant |
| New screenshot of the app | (n/a) | drop into `assets/`, add `<img>` to `index.html` |
| New tagline / copy | (optional, in `app.config.js` description) | edit `index.html` directly |
| New brand colors | `tailwind.config.js`, `src/constants/colors.ts`, `app.config.js` | CSS variables at top of `index.html` `<style>` |
