const express = require('express');
const app = express.Router();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Struttura del Timer
const note = require("../models/Nota");

// Salvo nota
app.post('/save', async (req, res) => {
    const { autore, id, titolo, cat, descr, data_cr, data_md } = req.body; // richiedo i valori al front-end

    if (!autore || !titolo || !cat || !descr || !data_cr || !data_md || id === undefined) {
        return res.status(404).json({ error: "Valori mancanti!" });
    }
    
    try{
      const notaEsiste = await note.findOne({ autore, id });
      
      if (notaEsiste) {
          // Aggiorna nota esistente
          notaEsiste.titolo = titolo;
          notaEsiste.cat = cat;
          notaEsiste.descr = descr;
          notaEsiste.data_md = data_md;

          await notaEsiste.save();
          return res.status(200).json({ message: "Nota aggiornata." });
      }
      
      // Altrimenti creo la nuova Nota
      const appunto = new note({ autore, id, titolo, cat, descr, data_cr, data_md });
      await appunto.save();
      
      res.status(201).json({ message: "Nota salvata." });
    } catch (err) {
      res.status(400).json({ message: "Errore salvataggio nota." });
    }
});

app.get('/getID', async (req, res) => {
  const { autore } = req.query;

  if (!autore) {
    return res.status(400).json({ error: "Autore mancante!" });
  }

  try {
    const ultimoID = await note.findOne().sort({ id: -1 }).exec();
    const ID = ultimoID ? ultimoID.id + 1 : 0;

    res.status(200).json({ ID });
  } catch (err) {
    console.error("Errore getID:", err);
    res.status(500).json({ message: "Errore ricerca ID." });
  }
});

// Scarico l'ultima nota da MongoDB
app.get('/get', async (req, res) => {
    const { autore } = req.query;
    
    if(!autore){
        return res.status(400).json({ error: "Autore mancante!" });
    }
    
    try {
      const UltimaNota = await note.findOne({ autore }).sort({ data_md: -1 }).exec();
      
      if(!UltimaNota){
        return res.status(404).json({error: "Nessuna nota trovata..." });
      }
      
      res.status(200).json({ UltimaNota });
    } catch (err) {
      res.status(500).json({ message: "Errore ricerca nota." });
    }
});

// Scarico tutte le note da MongoDB
app.get('/getAll', async (req, res) => {
    const { autore } = req.query;
    
    if(!autore){
        return res.status(400).json({ error: "Autore mancante!" });
    }
    
    try {
      const TutteNote = await note.find({ autore }).sort({ data_md: -1 }).exec();
      
      if(!TutteNote.length){
        return res.status(404).json({error: "Nessuna nota trovata..." });
      }
      
      res.status(200).json({ TutteNote });
    } catch (err) {
      res.status(500).json({ message: "Errore ricerca nota." });
    }
});

// Elimino note
app.post('/delete', async (req, res) => {
    const { autore, id } = req.body; // richiedo i valori al front-end

    if (!autore || id === undefined) {
        return res.status(400).json({ error: "Valori mancanti!" });
    }
    
    try{
      await note.deleteOne({autore, id});
      res.status(201).json({ message: "Nota eliminata." });
    } catch (err) {
      res.status(500).json({ message: "Errore salvataggio nota." });
    }

});

module.exports = app;
