/**
 * @file server.js
 * @description
 * Server principale dell'applicazione. Configura Express, connessione a MongoDB,
 * gestione delle rotte API, CORS, parsing delle richieste, e supporto per il "Time Machine"
 * (tempo virtuale per testing e simulazioni).
 *
 * Funzionalità principali:
 * - Connessione a MongoDB tramite Mongoose.
 * - Configurazione CORS per accettare richieste dal frontend.
 * - Parsing di JSON e URL-encoded con limiti di dimensione.
 * - Importazione e utilizzo dei router per autenticazione, pomodoro, note e calendario.
 * - Supporto per il tempo virtuale tramite endpoint /api/time-machine.
 * - Endpoint di test per verifica funzionamento server.
 * - Avvio del server su porta configurata.
 */

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const app = express();

// Configurazione di CORS per accettare richieste dal frontend
app.use(cors());
/*
app.use(cors({
  origin: (origin, callback) => {
    // Consenti tutte le richieste in locale
    if (!origin || origin.startsWith("http://192.168.") || origin === "http://localhost:8080") {
      callback(null, true);
    } else {
      callback(new Error("Non autorizzato dall'origine CORS"));
    }
  },
}));
*/


dotenv.config({ path: "./mongo.env" });

// Parsing delle richieste JSON e URL-encoded con limiti di dimensione
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Connessione al database MongoDB
const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI non è definito nel file .env");
  process.exit(1);
}
mongoose
  .connect(uri,{})
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Importazione dei router
const authRoutes = require("./src/routes/auth");
const pomodoroRoutes = require("./src/routes/pomodoro");
const noteRoutes = require("./src/routes/note");
const calRoutes = require("./src/routes/calendar");

// Supporto per il tempo virtuale centralizzato
const { setVirtualTime, getVirtualTime } = require("./virtualTime");

// Imposta il tempo virtuale (si aspetta { time: 'YYYY-MM-DDTHH:mm' })
app.post("/api/time-machine", (req, res) => {
  const { time } = req.body;
  if (!time) {
    setVirtualTime(null);
    return res.json({
      success: true,
      message: "Tempo virtuale resettato a quello di sistema.",
    });
  }
  const parsed = new Date(time);
  if (isNaN(parsed.getTime())) {
    return res
      .status(400)
      .json({ success: false, message: "Formato data non valido." });
  }
  setVirtualTime(parsed);
  res.json({
    success: true,
    message: "Set del tempo virtuale.",
    virtualTime: parsed,
  });
});

// Ottieni il tempo corrente (virtuale o di sistema)
app.get("/api/time-machine", (req, res) => {
  const now = getVirtualTime();
  res.json({ time: now.toISOString() });
});

// Uso dei router
app.use("/api/auth", authRoutes);
app.use("/api/pomodoro", pomodoroRoutes);
app.use("/api/note", noteRoutes);
app.use("/api/calendar", calRoutes);

// Endpoint di test
app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.use(express.static(path.join(__dirname, "/src/dist")));

// Avvio del server
const PORT = process.env.PORT || 3000;
//app.listen(PORT, () => console.log(Server running on port ${PORT}));
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);