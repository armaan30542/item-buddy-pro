# Item Buddy Pro

School IT Equipment Checkout System — a kiosk-friendly web app for managing equipment loans to students.

**No database, no cloud, no accounts needed.** All data is stored in a single JSON file on the server. Multiple devices on the same network share the same inventory.

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui
- **Server:** Express.js (serves the app + reads/writes a JSON file)
- **Data:** `data.json` (auto-created from `public/seed.json` on first run)

## Getting Started

Requires [Node.js](https://github.com/nvm-sh/nvm#installing-and-updating) (v18+).

```sh
git clone <YOUR_GIT_URL>
cd item-buddy-pro
npm install
npm start
```

This builds the app and starts the server at `http://localhost:3001`. Open that URL on any device on the same network.

### Development Mode

```sh
# Terminal 1: start the API server
npm run server

# Terminal 2: start the Vite dev server (with hot reload)
VITE_API_URL=http://localhost:3001 npm run dev
```

## How Multiple Devices Work

```
[Kiosk iPad]  ──┐
[Teacher Laptop] ──┼── all talk to ──→  [One computer running: npm start]
[Office PC]  ──┘                              └── data.json (shared data)
```

All devices connect to the same server. When someone checks out an item on one device, every other device sees it immediately.

## Editing Inventory

Edit `public/seed.json` to change the starting inventory. This file is only used to create `data.json` on first run. After that, all changes happen through the app.

To reset to seed data, stop the server and delete `data.json`.

## Kiosk Mode (Raspberry Pi)

1. Run `npm start` on the Pi (or any computer on the network)
2. Open `http://<server-ip>:3001` in Chromium kiosk mode
3. The built-in virtual keyboard handles touchscreen input
