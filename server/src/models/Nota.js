const mongoose = require('mongoose');

const Nota = new mongoose.Schema({
  autore: { 
    type: String,
    required: true
  },
  id: {
    type: Number,
    required: true
  },
  // Titolo della nota
  titolo: {
    type: String,
    required: true  
  },
  // Categoria della nota
  cat: {
    type: String,
    required: true
  },
  // Testo della note
  descr: { 
    type: String,
    required: true
  },
  // Data creazione della nota
  data_cr: { 
    type: Date,
    required: true
  },
  // Data ultima modifica della nota
  data_md: { 
    type: Date,
    required: true
  }
});

module.exports = mongoose.model('note', Nota);
