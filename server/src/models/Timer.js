const mongoose = require('mongoose');

const Timer = new mongoose.Schema({
  autore: { 
    type: String,
    required: true
  },
  // ID del Timer
  id: {
    type: Number,
    required: true  
  },
  // Tempo dedicato allo studio e secondi rimasti da completare
  studio: { 
    type: Number,
    required: true
  },
  studio_rimasto: { 
    type: Number,
    required: true
  },
  // Tempo dedicato alla pausa e secondi rimasti da completare
  pausa: { 
    type: Number, 
    required: true 
  },
  pausa_rimasta: { 
    type: Number,
    required: true
  },
  // Numero di cicli e quelli rimasti da completare
  ciclo: {    
    type: Number,
    required: true
  },
  cicli_rimasti: { 
    type: Number,
    required: true
  },
  // Controllo se è l'ora dello studio o della pausa
  faseStudio: {
    type: Boolean,
    required: true
  },
  // Segno se si tratta di un evento programmato o meno
  evento: {
    type: Boolean,
    default: false
  },
  // Segno data del timer programmato
  date: {
    type: Date,
  },
});

module.exports = mongoose.model('timerState', Timer);
