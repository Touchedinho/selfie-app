# Selfie

Selfie è un'applicazione web full-stack sviluppata come progetto del corso di Tecnologie Web dell'Alma Mater Studiorum — Università di Bologna (2024–2025), dal gruppo composto da Matteo Toccarelli, Riccardo Cianci e Alice Zamagni.

L'idea alla base è quella di un ambiente di produttività ed organizzazione personale: un unico posto dove gestire il proprio tempo attraverso un calendario eventi, un blocco note, un timer Pomodoro e una funzionalità di simulazione del tempo utile per test e dimostrazioni.

---

## Il progetto

Il frontend è realizzato in **Vue.js 3** con Vue Router per la navigazione lato client. Il backend è un server **Node.js + Express** che espone API REST e si connette a un database **MongoDB** tramite Mongoose. La comunicazione tra frontend e backend avviene tramite Axios, mentre l'autenticazione è gestita con token JWT.

Il progetto segue un'architettura client-server classica: il frontend non contiene logica di business, tutta la validazione e la persistenza dei dati avviene sul server. Le credenziali e i segreti sono gestiti tramite variabili d'ambiente e mai hardcodati nel codice.

---

## Funzionalità principali

**Autenticazione e profilo utente** — L'utente può registrarsi, effettuare il login e il logout. La sessione è mantenuta tramite JWT salvato nel localStorage. È presente un flusso completo di recupero password via email (link con token monouso e a scadenza). Dalla pagina profilo è possibile modificare username, email e immagine del profilo.

**Calendario ed eventi** — Il calendario mostra una griglia mensile con evidenziazione dei giorni che contengono eventi. Gli eventi possono essere creati, modificati ed eliminati. È supportata la ricorrenza con frequenza settimanale, mensile o annuale: ogni occorrenza viene salvata come documento separato, ma condivide un `repeatId` comune che permette di modificare o eliminare l'intera serie o solo gli eventi futuri. Il form di creazione integra l'autocompletamento dell'indirizzo tramite Google Maps. L'applicazione invia notifiche email automatiche quando un evento è imminente o in corso.

**Note** — Un semplice blocco note per utente, con titolo, categoria e corpo del testo. Il contenuto viene sempre renderizzato come Markdown. Le note vengono salvate e recuperate dal database, e ogni utente vede solo le proprie.

**Timer Pomodoro** — Un timer per sessioni di studio strutturate in cicli studio/pausa. Lo stato del timer viene salvato continuamente nel database, in modo da poter riprendere una sessione interrotta. Al completamento viene inviata una notifica sia via alert nel browser che via email. È anche possibile programmare un Pomodoro come evento del calendario: il timer partirà automaticamente all'orario stabilito. All'apertura della pagina, il sistema controlla se esistono sessioni non completate e chiede all'utente se vuole riprenderle.

**Time Machine** — Una funzionalità di simulazione del tempo che permette di impostare una data e ora fittizie per testare il comportamento dell'applicazione (scadenze eventi, notifiche, scheduling del Pomodoro). Il tempo virtuale è mantenuto lato server e propagato a tutte le funzionalità. Quando è attivo, il frontend lo incrementa automaticamente minuto per minuto.

---

## Come avviare il progetto

È necessario avere Node.js installato e un'istanza MongoDB raggiungibile (locale o su Atlas).

Per prima cosa, si deve configurare le variabili d'ambiente del backend copiando il file di esempio:

```bash
cd server
cp mongo.env.example mongo.env
```

Modificare `server/mongo.env` con i valori reali:

```
MONGO_URI = mongodb+srv://<utente>:<password>@<cluster>/?retryWrites=true&w=majority
PORT = 3000
JWT_SECRET = "una_stringa_lunga_e_casuale"
EMAIL_USER = tua_email@gmail.com
EMAIL_PASS = tua_app_password_gmail
FRONTEND_URL = http://localhost:8080
```

Poi avviare il backend:

```bash
cd server
npm install
node server.js
```

E in un secondo terminale, avviare il frontend dalla root del progetto:

```bash
npm install
npm run serve
```

L'applicazione sarà disponibile su `http://localhost:8080`.

---

## Note sulla sicurezza

Le password vengono sempre salvate nel database in forma hash tramite bcryptjs. I token JWT vengono verificati lato server ad ogni richiesta sulle rotte protette. I token di reset password sono monouso e hanno una scadenza. Tutta la configurazione sensibile (URI del database, chiave JWT, credenziali email) è gestita tramite variabili d'ambiente escluse dal version control.

---

© 2025 Matteo Toccarelli, Riccardo Cianci, Alice Zamagni. Tutti i diritti riservati.
Porzioni del codice sono © 2024–2025 Fabio Vitali.
Per maggiori informazioni, leggere la relazione.
