/**
 * Rotte di autenticazione per registrazione utente, login, reset password, gestione profilo e autenticazione.
 *
 * Questo modulo fornisce i seguenti endpoint:
 *
 * - POST /signup: Registra un nuovo utente. Richiede username, password, email, nome e cognome.
 * - POST /login: Autentica un utente e restituisce un token JWT. Richiede username e password.
 * - POST /forgotpassword: Invia un link per il reset della password all'email dell'utente. Richiede email.
 * - POST /resetpassword/:token: Reimposta la password dell'utente usando un token valido.
 * - POST /logout: Effettua il logout dell'utente aggiungendo il token JWT alla blacklist.
 * - PUT /update-username: Aggiorna lo username dell'utente autenticato.
 * - PUT /update-email: Aggiorna l'email dell'utente autenticato.
 * - GET /profile: Restituisce il profilo dell'utente autenticato (escludendo la password).
 * - PUT /update-profile-image: Aggiorna l'immagine del profilo dell'utente autenticato.
 * - GET /get-email/:username: Restituisce l'email associata a uno username specifico.
 *
 * Middleware:
 * - ensureAuthentication: Verifica il token JWT e aggiunge le info utente alla richiesta.
 *
 * Dipendenze:
 * - express: Framework web per il routing.
 * - bcryptjs: Per hash e confronto delle password.
 * - jsonwebtoken: Per generazione e verifica dei token JWT.
 * - crypto: Per generazione sicura dei token.
 * - nodemailer: Per invio email.
 * - User (modello mongoose): Schema utente per MongoDB.
 *
 * @module routes/auth
 */
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Middleware per garantire che l'utente sia autenticato
const ensureAuthentication = (req, res, next) => {
  try {
    // Controlla se il token è presente nell'header Authorization
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token non presente" });
    }

    // Verifica il token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Non autorizzato" });
  }
};

// route di registrazione di un nuovo utente
router.post("/signup", async (req, res) => {
  const { username, password, email, name, surname } = req.body;

  // controllo che tutti i parametri siano stati passati correttamente
  if (!username) {
    return res.status(400).json({ message: "Username è obbligatorio" });
  }
  if (!password) {
    return res.status(400).json({ message: "Password è obbligatoria" });
  }
  if (!email) {
    return res.status(400).json({ message: "Email è obbligatoria" });
  }

  try {
    // controllo se l'utente esiste già
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "user già esistente" });
    }
    // controllo se la mail è già in uso
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ message: "Email già in uso, inserire un'altra mail" });
    }

    // creazione di un nuovo utente
    const newUser = new User({ username, email, password, name, surname });

    // salvo l'utente nel database
    await newUser.save();
    // messaggio di successo se l'utente è stato creato correttamente
    res.status(201).json({ message: "Utente creato con successo" });
  } catch (err) {
    // messaggio di errore in caso di fallimento della creazione dell'utente
    res.status(500).json({ error: err.message });
  }
});

// route di Login di un utente
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // controllo che tutti i parametri siano stati passati correttamente
  if (!username) {
    return res.status(400).json({ message: "Inserire username" });
  }
  if (!password) {
    return res.status(400).json({ message: "Inserire password" });
  }

  try {
    // controllo se l'utente esiste
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User non esistente" });
    }

    // controllo se la password è corretta
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Password non corretta" });
    }

    // genero un token JWT per l'accesso utente
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h", // il token scade dopo 24 ore
    });
    // messaggio di successo se l'utente è stato autenticato correttamente
    res
      .status(200)
      .json({ token, user: { username: user.username }, email: user.email });
  } catch (err) {
    // messaggio di errore in caso di fallimento dell'autenticazione
    console.error("Errore durante il login:", err);
    res.status(500).json({ error: "Errore del server durante il login" });
  }
});

// route per il reset della password
router.post("/forgotpassword", async (req, res) => {
  const { email } = req.body;

  // controllo che tutti i parametri siano stati passati correttamente
  if (!email) {
    return res.status(400).json({ message: "Inserire email" });
  }

  try {
    // controllo se l'utente esiste
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User non esistente" });
    }

    // genero un token per il reset della password
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 ora

    // imposto i campi dell'utente con il token e la scadenza
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    // salvo l'utente nel database
    await user.save();

    // da cambiare con il link del sito
    //const resetLink = `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:8080";
    const resetLink = `${frontendUrl}/resetpassword/${resetToken}`;
    // link per il reset della password non posso usare window.location.origin perchè è un server

    // invio il link per il reset della password all'utente
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      to: email,
      subject: "Password Reset",
      text: `Clicca su questo link per il reset della password: ${resetLink}`,
    });
    res
      .status(200)
      .json({ message: "Link per il reset della password inviato" });
  } catch (err) {
    // messaggio di errore in caso di fallimento dell'autenticazione
    res.status(500).json({ message: "errore del server" });
  }
});

// route per il reset della password
router.post("/resetpassword/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Cerca l'utente con il token di reset della password
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }, // Verifica che il token sia ancora valido
    });

    // Se l'utente non esiste ritorno un messaggio di errore
    if (!user) {
      return res.status(400).json({ message: "Token scaduto o inesistente" });
    }

    // Imposto la nuova password e resetto il token e la scadenza
    user.password = password; // La nuova password verrà salvata con hash grazie a pre('save')
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    // Ritorno un messaggio di successo
    res.status(200).json({ message: "Password resettata con successo" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Errore del server" });
  }
});

// route di logout di un utente
router.post("/logout", (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "token non presente" });
    }

    // Aggiungi il token alla blacklist
    tokenBlacklist.push(token);

    res.status(200).json({ message: "Logout effettuato" });
  } catch (error) {
    console.error("Errore durante il logout:", error);
    res.status(500).json({ message: "Errore del server durante il logout" });
  }
});

// Rote per l'aggiornamento di username
router.put("/update-username", ensureAuthentication, async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Username è obbligatorio" });
  }

  try {
    // Controlla se il nome utente è già utilizzato
    const existingUser = await User.findOne({
      username,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username già in uso" });
    }

    // Aggiorna username
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    user.username = username;
    await user.save();

    res.status(200).json({
      message: "Username aggiornato con successo",
      username,
    });
  } catch (err) {
    console.error("Errore durante l'aggiornamento:", err);
    res.status(500).json({ message: "Errore del server" });
  }
});

// Route per l'aggiornamento dell'email
router.put("/update-email", ensureAuthentication, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email è obbligatoria" });
  }

  // Validazione base dell'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Formato email non valido" });
  }

  try {
    // Controlla se l'email è già utilizzata da un altro utente
    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.user.id },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "Email già in uso, inserire un'altra mail",
      });
    }

    // Aggiorna email
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    user.email = email;
    await user.save();

    res.status(200).json({
      message: "Email aggiornata con successo",
      email,
    });
  } catch (err) {
    console.error("Errore durante l'aggiornamento:", err);
    res.status(500).json({ message: "Errore del server" });
  }
});

// Route per ottenere il profilo utente
router.get("/profile", ensureAuthentication, async (req, res) => {
  try {
    // Trova l'utente per ID e escludi il campo password
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "Utente non trovato" });
    res.json(user);
  } catch (err) {
    console.error("Errore durante il recupero del profilo utente:", err);
    res.status(500).json({ message: "Errore del server" });
  }
});

// Route per l'aggiornamento dell'immagine del profilo
router.put("/update-profile-image", ensureAuthentication, async (req, res) => {
  const { profileImage } = req.body;

  if (!profileImage) {
    return res.status(400).json({ message: "Immagine del profilo richiesta" });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }

    // Aggiorna l'immagine del profilo
    user.profileImage = profileImage;
    await user.save();

    res.status(200).json({
      message: "Immagine del profilo aggiornata con successo",
      profileImage,
    });
  } catch (err) {
    console.error("Errore durante l'aggiornamento:", err);
    res.status(500).json({ message: "Errore del server" });
  }
});

// Route per ottenere l'email associata a uno username
router.get("/get-email/:username", async (req, res) => {
  const { username } = req.params;
  if (!username) {
    return res.status(400).json({ message: "Username richiesto" });
  }
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Utente non trovato" });
    }
    res.status(200).json({ email: user.email });
  } catch (err) {
    res.status(500).json({ message: "Errore del server" });
  }
});

module.exports = router;
