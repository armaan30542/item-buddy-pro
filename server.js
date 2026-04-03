const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, "data.json");
const SEED_FILE = path.join(__dirname, "public", "seed.json");

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Initialize data.json from seed.json if it doesn't exist
function initData() {
  if (!fs.existsSync(DATA_FILE)) {
    if (fs.existsSync(SEED_FILE)) {
      fs.copyFileSync(SEED_FILE, DATA_FILE);
      console.log("Created data.json from seed.json");
    } else {
      const empty = { students: [], items: [], loans: [], settings: {} };
      fs.writeFileSync(DATA_FILE, JSON.stringify(empty, null, 2));
      console.log("Created empty data.json");
    }
  }
}

function readData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// ─── GET all data ───
app.get("/api/data", (_req, res) => {
  res.json(readData());
});

// ─── GET a single table ───
app.get("/api/:table", (req, res) => {
  const data = readData();
  const table = req.params.table;
  if (!(table in data)) return res.status(404).json({ error: "Unknown table" });
  res.json(data[table]);
});

// ─── PUT (replace) a single table ───
app.put("/api/:table", (req, res) => {
  const data = readData();
  const table = req.params.table;
  if (!(table in data)) return res.status(404).json({ error: "Unknown table" });
  data[table] = req.body;
  writeData(data);
  res.json({ ok: true });
});

// ─── POST (add item to a table) ───
app.post("/api/:table", (req, res) => {
  const data = readData();
  const table = req.params.table;
  if (!(table in data)) return res.status(404).json({ error: "Unknown table" });
  if (Array.isArray(data[table])) {
    data[table].push(req.body);
  }
  writeData(data);
  res.json({ ok: true });
});

// ─── PATCH (update one record by id) ───
app.patch("/api/:table/:id", (req, res) => {
  const data = readData();
  const table = req.params.table;
  if (!(table in data)) return res.status(404).json({ error: "Unknown table" });
  if (!Array.isArray(data[table])) return res.status(400).json({ error: "Not an array" });

  const idx = data[table].findIndex((r) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Record not found" });

  data[table][idx] = { ...data[table][idx], ...req.body };
  writeData(data);
  res.json(data[table][idx]);
});

// Serve the built frontend
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

initData();
app.listen(PORT, () => {
  console.log(`Item Buddy Pro server running at http://localhost:${PORT}`);
});
