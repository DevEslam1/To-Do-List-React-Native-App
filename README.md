# To-Do List

A cross-platform task management app built with React Native and Expo. The current app is local-first, stores data on the device with AsyncStorage, and focuses on quick capture, lightweight scheduling, and focused work sessions.

> **Note:** 🎓 This app is part of a Nile University course funded by 🏦 Bank Misr to apply on state management and APIs.

## Highlights

- ✍️ Smart task creation with both quick add and a full editor for richer task details
- 🗂️ Flexible organization using categories, priorities, and completion states
- 📅 Built-in scheduling with due dates, start times, and planned session durations
- 🔎 Fast search across titles, notes, tags, priority, focus mode, and schedule data
- 🎯 Focus Mode timer to turn planned work blocks into distraction-free sessions
- 📊 Weekly progress tracking to visualize momentum and completed goals
- 🌗 Theme switching with saved light and dark mode preferences
- 💾 Local-first experience powered by AsyncStorage for persistent on-device data

## Tech Stack

- Expo 54
- React Native 0.81
- React 19
- TypeScript
- Expo Router
- Redux Toolkit + React Redux
- AsyncStorage
- Expo Linear Gradient
- Expo Google Fonts

## How It Works

The app entry point is [`app/index.tsx`](/c:/Users/Eslam/StudioProjects/to_do_list/app/index.tsx). State is managed in [`store/tasksSlice.ts`](/c:/Users/Eslam/StudioProjects/to_do_list/store/tasksSlice.ts) and persisted locally with AsyncStorage, so no backend is required to run the current version.

Each task supports:

- title and description
- category tag
- priority level
- due date
- start time
- estimated duration in minutes
- optional focus mode session

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the app

```bash
npm start
```

You can also use the platform-specific scripts:

```bash
npm run android
npm run ios
npm run web
```

## Available Scripts

```bash
npm start
npm run android
npm run ios
npm run web
npm run lint
```

## Project Structure

```text
app/                Expo Router screens and app shell
components/         Reusable UI such as task cards, modals, sidebar, and progress bar
store/              Redux store setup and task state
providers/          Theme provider and app-wide context
utils/              Scheduling and search helpers
constants/          Design tokens and theme definitions
assets/             Icons and image assets
```

## Notes

- Tasks are stored locally on the device or simulator.
- The current implementation does not require `json-server` or any external API.
- Theme preference is also persisted locally.

## License

This project does not currently include a license file.
