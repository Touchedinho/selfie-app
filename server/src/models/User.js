const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  email: {    
    type: String,
    unique: true, 
    required: true
  },
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  resetToken: { 
    type: String,
    default: null 
  },
  resetTokenExpiry: { 
    type: Date,
    default: null 
  },
  profileImage: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/* 
    Middleware di Mongoose che esegue l'hashing della password di un utente prima di salvarla nel database.
    
    - UserSchema.pre('save', ... : Questa riga specifica che la funzione deve essere eseguita prima 
        che il documento venga salvato nel database.
    - if (!this.isModified('password')) return next(); : Questa riga controlla se la password è stata modificata. 
        Se non lo è, salta il processo di hashing e procede con la prossima funzione middleware.
    - this.password = await bcrypt.hash(this.password, 10); : Se la password è stata modificata, questa riga 
        esegue l'hashing della password utilizzando la libreria bcrypt con un sale di 10 round.
    - next(); : Questa riga chiama la prossima funzione middleware nella catena.
*/
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', UserSchema);

/* 
    PERCHÈ DELL'HASHING? 

    L'hashing della password prima di memorizzarla nel database è una pratica di sicurezza 
    fondamentale per proteggere le credenziali degli utenti, per questi motivi:

    1. Protezione dalle intrusioni: se un attaccante riesce a penetrare nel database, 
        non potrà accedere alle password in chiaro, poiché sono state trasformate in un codice 
        non leggibile (l'hash).
    2. Prevenzione della divulgazione di password: se un utente utilizza la stessa password su più siti, 
        l'hashing impedisce che la password venga divulgata in caso di violazione del database.
    3. Protezione dalle attività di cracking: gli algoritmi di hashing sono progettati per essere 
        molto lenti e richiedono molta potenza di calcolo per essere invertiti. Ciò rende difficile 
        per gli attaccanti utilizzare tecniche di cracking per scoprire le password.
    4. Conformità alle norme di sicurezza: molte norme di sicurezza, come la PCI-DSS e la GDPR, 
        richiedono l'hashing delle password per proteggere le credenziali degli utenti.

L'hashing della password funziona come segue:

- Quando un utente crea un account, la password viene inviata al server.
- Il server esegue un algoritmo di hashing sulla password, producendo un codice non leggibile (l'hash).
- L'hash viene memorizzato nel database al posto della password in chiaro.
- Quando l'utente tenta di accedere, la password viene inviata al server e viene eseguito lo stesso algoritmo 
di hashing.
- Il server confronta l'hash generato con l'hash memorizzato nel database. Se corrispondono, 
l'utente viene autenticato.
*/
