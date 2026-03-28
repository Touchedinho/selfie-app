const nodemailer = require("nodemailer");
const express = require("express");
const router = express.Router();
const cors = require("cors");

router.use(cors());
router.use(express.json());

let Evento = require("../models/Evento");
const { getVirtualTime } = require("../../virtualTime");

// POST /api/calendar/save
router.post("/save", async (req, res) => {
  const {
    author,
    title,
    description,
    date,
    allDay,
    startTime,
    endTime,
    repeat,
    repeatFrequency,
    repeatDuration,
    repeatId,
    location,
    latitude,
    longitude,
    pomodoro_id,
  } = req.body;

  if (!author || !title || !description || !date) {
    return res.status(400).json({ error: "Valori mancanti!" });
  }

  try {
    const lastEvent = await Evento.findOne().sort({ id: -1 }).exec();
    let newID = lastEvent ? lastEvent.id + 1 : 0;
  
    // Calcola data di partenza
    const baseDate = new Date(date);
    const eventiDaSalvare = [];
    let repeatCount = 1;
    if (repeat) {
      if (repeatDuration === "forever") {
        repeatCount = 120;
      } else {
        repeatCount = parseInt(repeatDuration, 10);
        if (isNaN(repeatCount)) repeatCount = 1;
      }
    }
    
    const comuneRepeatId = repeat ? (repeatId || `repeat-${Date.now()}`) : null;

    for (let i = 0; i < repeatCount; i++) {
      const evDate = new Date(baseDate);

      if (repeat) {
        if (repeatFrequency === "weekly") {
          evDate.setDate(baseDate.getDate() + i * 7);
        } else if (repeatFrequency === "monthly") {
          const newMonth = baseDate.getMonth() + i;
          evDate.setMonth(newMonth);

          // Correzione ultimo giorno del mese
          if (evDate.getMonth() !== (newMonth % 12)) {
            evDate.setDate(0);
          }
        }else if(repeatFrequency === "yearly"){
          evDate.setDate(baseDate.getDate() + i * 365);
        }
      }

      const evento = new Evento({
        autore: author,
        id: newID++,
        titolo: title,
        descr: description,
        data_ev: evDate.toISOString(),
        data_cr: getVirtualTime(),
        data_md: getVirtualTime(),
        allDay,
        startTime,
        endTime,
        repeat,
        repeatFrequency,
        repeatDuration,
        repeatId: comuneRepeatId,
        location: location || "",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        pomodoro_id: pomodoro_id || -1,
      });
      
      eventiDaSalvare.push(evento.save());
    }
    
    await Promise.all(eventiDaSalvare);
    res.status(201).json({ message: "Evento salvato." });
  } catch (err) {
    res.status(500).json({ message: "Errore salvataggio evento." });
  }
});

//ultimo evento per autore
router.get("/get", async (req, res) => {
  const { author } = req.query;

  if (!author) {
    return res.status(400).json({ error: "Autore mancante!" });
  }

  try {
    const ultimoEvento = await Evento.findOne({ autore: author })
      .sort({ data_md: -1 })
      .exec();
    if (!ultimoEvento) {
      return res.status(404).json({ error: "Nessun evento trovato..." });
    }
    res.status(200).json({ ultimoEvento });
  } catch (err) {
    res.status(500).json({ message: "Errore ricerca evento." });
  }
});

//tutti gli eventi per autore
router.get("/getAll", async (req, res) => {
  const { author } = req.query;

  if (!author) {
    return res.status(400).json({ error: "Autore mancante!" });
  }

  try {
    const eventi = await Evento.find({ autore: author })
      .sort({ data_ev: 1 })
      .exec();
    if (!eventi.length) {
      return res.status(404).json({ error: "Nessun evento trovato..." });
    }
    res.status(200).json({ eventi });
  } catch (err) {
    res.status(500).json({ message: "Errore ricerca eventi." });
  }
});

//modifica evento
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, date, location, latitude, longitude } = req.body;

  try {
    const evento = await Evento.findOneAndUpdate(
      { id: parseInt(id) },
      {
        titolo: title,
        descr: description,
        data_ev: date,
        data_md: getVirtualTime(),
        location: location || "",
        latitude: latitude ?? null,
        longitude: longitude ?? null,
      },
      { new: true }
    );

    if (!evento) {
      return res.status(404).json({ error: "Evento non trovato." });
    }

    res.status(200).json({ message: "Evento aggiornato.", evento });
  } catch (err) {
    res.status(500).json({ message: "Errore aggiornamento evento." });
  }
});

//elimina evento
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Evento.findOneAndDelete({ id: parseInt(id) });

    if (!result) {
      return res.status(404).json({ error: "Evento non trovato." });
    }

    res.status(200).json({ message: "Evento eliminato." });
  } catch (err) {
    res.status(500).json({ message: "Errore eliminazione evento." });
  }
});

//tutti gli eventi per autore e data
router.get("/by-date", async (req, res) => {
  const { author, date } = req.query;

  if (!author || !date) {
    return res.status(400).json({ error: "Autore o data mancante!" });
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const eventi = await Evento.find({
      autore: author,
      data_ev: { $gte: startOfDay, $lte: endOfDay },
    })
      .sort({ startTime: 1 })
      .exec();

    res.status(200).json({ eventi });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Errore durante il recupero eventi per data." });
  }
});

//tutti gli eventi di oggi per un determinato autore
router.get("/today", async (req, res) => {
  const { author } = req.query;

  if (!author) {
    return res.status(400).json({ error: "Autore mancante!" });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const eventi = await Evento.findOne({
      autore: author,
      data_ev: { $gte: today, $lt: tomorrow },
    })
      .sort({ startTime: 1 })
      .exec();

    res.status(200).json({ eventi });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Errore durante il recupero eventi di oggi." });
  }
});

// Funzione per inviare una notifica email evento
async function mandaNotificaEvento(email, subject, text) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    to: email,
    subject,
    text,
  });
}

// POST /api/calendar/notify-imminent
router.post("/notify-imminent", async (req, res) => {
  const { email, titolo, data_ev, descr, isNow } = req.body;
  if (!email || !titolo || !data_ev) {
    return res.status(400).json({ error: "Dati mancanti" });
  }
  let subject, text;
  if (isNow) {
    subject = "Promemoria: evento in corso!";
    text =
      `L'evento sta iniziando ora!\n` +
      `Titolo: ${titolo}\n` +
      `Quando: ${new Date(data_ev).toLocaleString()}\n` +
      (descr ? `Descrizione: ${descr}` : "");
  } else {
    subject = "Promemoria: evento imminente!";
    text =
      `Hai un evento tra meno di 30 minuti!\n` +
      `Titolo: ${titolo}\n` +
      `Quando: ${new Date(data_ev).toLocaleString()}\n` +
      (descr ? `Descrizione: ${descr}` : "");
  }
  try {
    await mandaNotificaEvento(email, subject, text);
    res.status(200).json({ message: "Notifica inviata" });
  } catch (err) {
    console.error("Errore invio mail Evento:", err);
    res.status(500).json({ error: "Errore invio mail" });
  }
});

module.exports = router;