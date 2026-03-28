const nodemailer = require("nodemailer");
const express = require("express");
const app = express.Router();
const cors = require("cors");

app.use(cors());
app.use(express.json());

// Struttura del Timer
let timerState = require("../models/Timer");

// Prendo ultimo ID
app.get("/getID", async (req, res) => {
  const { autore } = req.query;

  if (!autore) {
    return res.status(400).json({ error: "Autore mancante!" });
  }

  try {
    const ultimoID = await timerState.findOne().sort({ id: -1 }).exec();
    const ID = ultimoID ? ultimoID.id + 1 : 0;

    res.status(200).json({ ID });
  } catch (err) {
    console.error("Errore getID:", err);
    res.status(500).json({ message: "Errore ricerca ID." });
  }
});

// Prendo l'ultimo Timer -> HomePage
app.get("/getLast", async (req, res) => {
  const { autore } = req.query;

  if (!autore) return res.status(400).json({ error: "Autore mancante!" });

  try {
    const ultimoTimer = await timerState.findOne({
      autore, 
      $or: [
          { evento: false },
          { evento: { $exists: false } } // Timer vecchi salvati prima dell'inclusione di "evento"
        ],
      }).sort({ id: -1 }).exec();

    if (!ultimoTimer) {
      return res.status(400).json({ error: "Valori mancanti!" });
    }

    res.status(200).json({ ultimoTimer });
  } catch (err) {
    res.status(500).json({ message: "Errore ricerca ID." });
  }
});

// Timer non completato
app.get("/getIncompl", async (req, res) => {
  const { autore } = req.query;

  if (!autore) return res.status(400).json({ error: "Autore mancante!" });

  try {
    const timer = await timerState
      .findOne({
        autore,
        studio_rimasto: { $gt: 0 },
        cicli_rimasti: { $gt: 0 },
      })
      .sort({ id: -1 })
      .exec();

    if (!timer) {
      return res.status(204).json();
    }

    res.status(200).json(timer);
  } catch (err) {
    res.status(500).json({ message: "Errore nella ricerca del timer." });
  }
});

// Timer specifico
app.get("/getEvento", async (req, res) => {
  const { autore } = req.query;

  if (!autore) return res.status(400).json({ error: "Autore mancante!" });

  try {
    const timer = await timerState.findOne({autore}).sort({ id: -1 }).exec();

    if (!timer) {
      return res.status(204).json();
    }

    res.status(200).json(timer);
  } catch (err) {
    res.status(500).json({ message: "Errore nella ricerca del timer." });
  }
});

// Salvo l'ultimo timer
app.post("/save", async (req, res) => {
  const {
    autore,
    id,
    studio,
    studio_rimasto,
    pausa,
    pausa_rimasta,
    ciclo,
    cicli_rimasti,
    faseStudio,
    evento,
    date,
  } = req.body; // richiedo i valori al front-end

  if (
    !autore ||
    studio === undefined ||
    pausa === undefined ||
    ciclo === undefined ||
    faseStudio === undefined ||
    id === undefined
  ) {
    return res.status(404).json({ error: "Valori mancanti!" });
  }

  try {
    const pomEsistente = await timerState.findOne({ autore, id });

    if (pomEsistente) {
      pomEsistente.studio_rimasto = studio_rimasto;
      pomEsistente.pausa_rimasta = pausa_rimasta;
      pomEsistente.cicli_rimasti = cicli_rimasti;
      pomEsistente.faseStudio = faseStudio;

      await pomEsistente.save();
      return res.status(200).json({ message: "Pomodoro aggiornato." });
    }
    
    let pomodoro
    
    if(evento !== undefined){
      pomodoro = new timerState({
        autore,
        id,
        studio,
        studio_rimasto,
        pausa,
        pausa_rimasta,
        ciclo,
        cicli_rimasti,
        faseStudio,
        evento,
        date,
      });
    }else{
      pomodoro = new timerState({
        autore,
        id,
        studio,
        studio_rimasto,
        pausa,
        pausa_rimasta,
        ciclo,
        cicli_rimasti,
        faseStudio,
      });
    }
    
    await pomodoro.save();
    return res.status(200).json({ message: "Pomodoro salvato." });
  } catch (err) {
    res.status(400).json({ message: "Errore salvataggio pomodoro." });
  }
});

// Funzione per inviare una notifica email
async function mandaNotificaPomodoro(email, subject, text) {
  // Configura il trasportatore
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  // Invia la mail
  await transporter.sendMail({
    to: email,
    subject,
    text,
  });
}

// Endpoint per inviare una notifica email al termine di una fase/ciclo
app.post("/notify", async (req, res) => {
  const { email, fase } = req.body;
  if (!email || !fase) {
    return res.status(400).json({ message: "Email e fase richiesti" });
  }
  let subject, text;
  if (fase === "studio") {
    subject = "Pomodoro: Pausa terminata!";
    text = "La tua pausa è terminata. Inizia una nuova sessione di studio.";
  } else if (fase === "pausa") {
    subject = "Pomodoro: Fase di studio terminata!";
    text = "La tua sessione di studio è terminata. Inizia la pausa.";
  } else if (fase === "fine") {
    subject = "Pomodoro: Cicli completati!";
    text = "Hai completato tutti i cicli del Pomodoro. Ottimo lavoro!";
  } else {
    subject = "Pomodoro: Notifica";
    text = "Aggiornamento dal timer Pomodoro.";
  }
  try {
    await mandaNotificaPomodoro(email, subject, text);
    res.status(200).json({ message: "Notifica inviata" });
  } catch (err) {
    console.error("Errore invio mail Pomodoro:", err);
    res.status(500).json({ message: "Errore invio mail" });
  }
});

module.exports = app;
