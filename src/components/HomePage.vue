<template>
  <div class="app-container">
    <header class="header-section">
      <div id="saluti">
        <span id="icona-saluto">👋</span>
        <h1 id="testo-saluto">Ciao, {{ username }}!</h1>
      </div>
      <p id="sottotesto">Speriamo tu abbia una giornata fantastica!</p>

      <div class="logout-btn-container">
        <button @click="logout" class="logout-btn">
          <font-awesome-icon icon="fa-sign-out-alt" /> Logout
        </button>
      </div>
    </header>

    <section class="cards-container">
      <!-- Card Note -->
      <div class="card note-card">
        <div class="card-header">
          <font-awesome-icon icon="fa-sticky-note" />
          <h2>Ultima nota</h2>
        </div>
        <div class="card-content">
          <template v-if="lastNote">
            <div class="note-content">
              <h3 class="titolo-nota">{{ lastNote.titolo }}</h3>
              <div class="categoria-nota" v-if="lastNote.categoria">
                <span class="label-categoria">Categoria:</span>
                <span class="testo-categoria">{{ lastNote.categoria }}</span>
              </div>
              <p
                class="descrizione-nota"
                v-html="renderMarkdown(lastNote.descr)"
              />
              <div class="info-nota">
                <span class="data-nota">
                  <font-awesome-icon icon="fa-calendar-check" />
                  Creata il {{ formatDate(lastNote.data_cr) }}
                </span>
                <span class="data-nota">
                  <font-awesome-icon icon="fa-edit" />
                  Modificata il {{ formatDate(lastNote.data_md) }}
                </span>
              </div>
            </div>
          </template>
          <template v-else>
            <p class="testo-vuoto">Nessuna nota trovata</p>
          </template>
        </div>
      </div>

      <!-- Card Evento -->
      <div class="card event-card">
        <div class="card-header">
          <font-awesome-icon icon="fa-calendar-alt" />
          <h2>Prossimo evento</h2>
        </div>
        <div class="card-content">
          <template v-if="nextEvento">
            <div class="note-content">
              <h3 class="titolo-nota">{{ nextEvento.titolo }}</h3>
              <div>
                <p
                  class="descrizione-nota"
                  v-html="renderMarkdown(nextEvento.descr)"
                />
                <span v-if="isToday(nextEvento.data_ev)">oggi</span>
                <span v-else>{{ formatDate(nextEvento.data_ev) }}</span>
                <span>
                  <template v-if="nextEvento.allDay">
                    - tutto il giorno</template
                  >
                  <template v-else> alle {{ formatHour(nextEvento) }}</template>
                </span>
              </div>
              <div v-if="nextEvento.location">
                <strong>Luogo:</strong> {{ nextEvento.location }}
              </div>
              <div v-else-if="nextEvento.luogo">
                <strong>Luogo:</strong> {{ nextEvento.luogo }}
              </div>
              <div v-if="nextEvento.latitude && nextEvento.longitude">
                <font-awesome-icon icon="fa-map-marker-alt" style="margin-right: 0.3em" />
                <small>Coordinate: {{ nextEvento.latitude.toFixed(5) }}, {{ nextEvento.longitude.toFixed(5) }} </small>
              </div>
            </div>
          </template>
          <template v-else>
            <p class="testo-vuoto">Nessun evento programmato</p>
          </template>
        </div>
      </div>

      <!-- Card Pomodoro -->
      <div class="card pomodoro-card">
        <div class="card-header">
          <font-awesome-icon icon="fa-clock" />
          <h2>Ultimo pomodoro</h2>
        </div>
        <div class="card-content">
          <p class="testo-vuoto" v-if="!lastPomodoro">Nessun pomodoro recente</p>
          <div class="note-content" v-else>
            <p>
              Studio: {{ lastPomodoro.studio_rimasto }}s /
              {{ lastPomodoro.studio }}s
            </p>
            <p>
              Pausa: {{ lastPomodoro.pausa_rimasta }}s /
              {{ lastPomodoro.pausa }}s
            </p>
            <p>
              Cicli: {{ lastPomodoro.cicli_rimasti }} / {{ lastPomodoro.ciclo }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { isAuthenticated } from "@/utils/auth";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCalendarAlt,
  faCalendarCheck,
  faClock,
  faEdit,
  faLightbulb,
  faSignOutAlt,
  faStickyNote,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { marked } from "marked";

library.add(
  faSignOutAlt,
  faLightbulb,
  faStickyNote,
  faCalendarAlt,
  faClock,
  faCalendarCheck,
  faEdit
);

let backendHost = `http://${window.location.hostname}:${window.location.port}`;

export default {
  name: "HomePage",
  components: {
    FontAwesomeIcon,
  },

  computed: {
    isAuthenticated() {
      return isAuthenticated();
    },
  },

  data() {
    return {
      username: "",
      email: "",
      lastNote: null,
      nextEvento: null,
      lastPomodoro: null,
      error: null,
      virtualDate: "",
    };
  },

  created() {
    this.username = localStorage.getItem("username");
    this.email = localStorage.getItem("email") || "";
  },

  methods: {
    handleTimeChange(newTime) {
      this.$store.commit("updateTime", newTime);
    },

    logout() {
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("token");
      this.$router.push("/login");
    },

    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString();
    },

    // Recupera l'ultima nota
    async fetchLastNote() {
      try {
        const user = this.username;
        // Prende l'ultima nota dell'utente tramite una chiamata al backend GET
        const risposta = await fetch(
          `${backendHost}/api/note/get?autore=${encodeURIComponent(user)}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        // Controlla se la risposta è andata a buon fine
        if (!risposta.ok) {
          this.lastNote = null;
          return;
        }

        // Converte la risposta in JSON e aggiorna lastNote
        const data = await risposta.json();
        this.lastNote = data.UltimaNota;
      } catch (error) {
        console.error(error);
        this.error = "Errore nel caricamento della nota";
        this.lastNote = null;
      }
    },

    renderMarkdown(t) {
      return marked.parse(t); // Per Markdown
    },

    async fetchEvento() {
      try {
        const user = this.username;
        // Prende tutti gli eventi dell'utente tramite una chiamata al backend GET
        const risposta = await fetch(
          `${backendHost}/api/calendar/getAll?author=${encodeURIComponent(
            user
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!risposta.ok) {
          this.nextEvento = null;
          return;
        }

        const data = await risposta.json();
        const eventi = data.eventi || [];

        // Ottieni la data virtuale dalla time machine (se presente)
        let virtualDate = null;
        try {
          // Chiamata diretta all'API della time machine
          const res = await fetch(`${backendHost}/api/time-machine/get`);
          if (res.ok) {
            const d = await res.json();
            if (d && d.time) {
              virtualDate = new Date(d.time);
            }
          }
        } catch (e) {
          virtualDate = null;
        }

        // Salva la vera ora virtuale (o reale) per i confronti temporali
        // Assicura che virtualDate sia sempre un oggetto Date con orario
        if (virtualDate && !(virtualDate instanceof Date)) {
          this.virtualDate = new Date(virtualDate);
        } else if (virtualDate) {
          this.virtualDate = virtualDate;
        } else {
          this.virtualDate = new Date();
        }
        // Debug: mostra il tipo e valore di virtualDate
        console.log(
          "[DEBUG] this.virtualDate (dopo set):",
          this.virtualDate,
          typeof this.virtualDate
        );


        // Data di oggi (solo data, senza orario) per filtrare eventi futuri
        let oggi = new Date(this.virtualDate);
        oggi.setHours(0, 0, 0, 0); // serve solo per il filtro

        // Filtra eventi futuri:
        // - se la data è dopo oggi, includi sempre
        // - se la data è oggi, includi solo se l'orario è >= ora attuale (virtuale)
        const eventiFuturi = eventi.filter((ev) => {
          const dataEv = new Date(ev.data_ev);
          let evDataSolo = new Date(dataEv);
          evDataSolo.setHours(0, 0, 0, 0);
          if (evDataSolo > oggi) {
            return true;
          } else if (evDataSolo.getTime() === oggi.getTime()) {
            // Evento di oggi: mostra solo se orario >= ora attuale (virtuale)
            return dataEv >= this.virtualDate;
          }
          return false;
        });

        // Trova l'evento con la data più vicina a ora (tra quelli futuri)
        let prossimo = null;
        if (eventiFuturi.length > 0) {
          prossimo = eventiFuturi.reduce((a, b) => {
            const dataA = new Date(a.data_ev);
            const dataB = new Date(b.data_ev);
            return dataA < dataB ? a : b;
          });
        }

        this.nextEvento = prossimo;

        // DEBUG: logga info su evento, oggi, virtualDate e confronto isToday
        console.log("[DEBUG] prossimo:", prossimo);
        console.log("[DEBUG] oggi:", oggi, "virtualDate:", this.virtualDate);
        if (prossimo) {
          console.log(
            "[DEBUG] isToday(prossimo.data_ev):",
            this.isToday(prossimo.data_ev),
            "prossimo.data_ev:",
            prossimo.data_ev
          );
        }

        // Se c'è un evento oggi che inizia entro 30 minuti o adesso, invia la mail solo 2 volte (1 per i 30, 1 per inizio)
        if (prossimo && this.email) {
          // Forza eventoDate in locale anche se la stringa è in UTC (Z)
          let eventoDate;
          if (
            typeof prossimo.data_ev === "string" &&
            prossimo.data_ev.endsWith("Z")
          ) {
            // Rimuovi la Z e crea la data come locale
            const localString = prossimo.data_ev.replace("Z", "");
            eventoDate = new Date(localString);
          } else {
            eventoDate = new Date(prossimo.data_ev);
          }
          // Debug: mostra il tipo e valore di this.virtualDate prima di creare now
          console.log(
            "[DEBUG] this.virtualDate (prima di now):",
            this.virtualDate,
            typeof this.virtualDate
          );
          let now = new Date(this.virtualDate);
          console.log("[DEBUG] now (dopo creazione):", now);
          // DEBUG: mostra anche i valori precisi di now e eventoDate
          console.log("[DEBUG] eventoDate:", eventoDate, "now:", now);
          const diffMs = eventoDate - now;
          const eventKey = `notifica_evento_${prossimo.titolo}_${prossimo.data_ev}`;
          let notifyState = localStorage.getItem(eventKey);
          // Logga sempre diffMs, notifyState e orari per debug
          console.log(
            "[DEBUG] diffMs:",
            diffMs,
            "minuti:",
            diffMs / 60000,
            "notifyState:",
            notifyState,
            "eventoDate:",
            eventoDate,
            "now:",
            now
          );

          // Notifica "manca meno di 30 minuti"
          if (
            this.isToday(prossimo.data_ev) &&
            diffMs >= 0 &&
            diffMs <= 30 * 60 * 1000 &&
            notifyState !== "30min"
          ) {
            console.log(
              "[DEBUG] diffMs:",
              diffMs,
              "minuti:",
              diffMs / 60000,
              "notifyState:",
              notifyState,
              "isToday:",
              this.isToday(prossimo.data_ev)
            );
            alert(
              `L'evento "${prossimo.titolo}" inizia tra meno di 30 minuti!`
            );
            try {
              await fetch(`${backendHost}/api/calendar/notify-imminent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: this.email,
                  titolo: prossimo.titolo,
                  data_ev: prossimo.data_ev,
                  descr: prossimo.descr || "",
                  isNow: false,
                }),
              });
              localStorage.setItem(eventKey, "30min");
            } catch (e) {
              console.error("Errore nell'invio della mail:", e);
            }
          }

          // Notifica "evento adesso"
          if (
            this.isToday(prossimo.data_ev) &&
            Math.abs(diffMs) < 60 * 1000 && // entro 1 minuto dall'orario
            notifyState !== "adesso"
          ) {
            alert(`L'evento "${prossimo.titolo}" sta iniziando ora!`);
            try {
              await fetch(`${backendHost}/api/calendar/notify-imminent`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: this.email,
                  titolo: prossimo.titolo,
                  data_ev: prossimo.data_ev,
                  descr: prossimo.descr || "",
                  isNow: true,
                }),
              });
              localStorage.setItem(eventKey, "adesso");
            } catch (e) {
              console.error("Errore nell'invio della mail:", e);
            }
          }
        }
      } catch (error) {
        console.error(error);
        this.error = "Errore nel caricamento dell'evento";
        this.nextEvento = null;
      }
    },

    isToday(dateString) {
      if (!dateString || !this.virtualDate) return false;
      const d1 = new Date(dateString);
      d1.setHours(0, 0, 0, 0);
      // lavora sempre su una copia di this.virtualDate
      const d2 = new Date(this.virtualDate);
      d2.setHours(0, 0, 0, 0);
      return d1.getTime() === d2.getTime();
    },

    formatHour(evento) {
      // Se esiste startTime, usalo, altrimenti prendi l’ora da data_ev
      if (evento && evento.startTime) {
        return evento.startTime;
      }
      if (evento && evento.data_ev) {
        const date = new Date(evento.data_ev);
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return "";
    },

    async fetchPomodoro() {
      try {
        const user = this.username;
        // Prende l'ultima nota dell'utente tramite una chiamata al backend GET
        const risposta = await fetch(
          `${backendHost}/api/pomodoro/getLast?autore=${encodeURIComponent(
            user
          )}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        // Controlla se la risposta è andata a buon fine
        if (!risposta.ok) {
          this.lastPomodoro = null;
          return;
        }

        // Converte la risposta in JSON e aggiorna lastNote
        const data = await risposta.json();
        this.lastPomodoro = data.ultimoTimer;
      } catch (error) {
        console.error(error);
        this.error = "Errore nel caricamento del pomodoro";
        this.lastPomodoro = null;
      }
    },
  },

  mounted() {
    this.fetchLastNote();
    this.fetchEvento();
    this.fetchPomodoro();
    // Avvia controllo periodico per evento imminente
    this.eventCheckInterval = setInterval(() => {
      this.fetchEvento();
    }, 10000); // ogni 10 secondi
  },

  unmounted() {
    // Pulisci il timer quando il componente viene distrutto
    if (this.eventCheckInterval) {
      clearInterval(this.eventCheckInterval);
    }
  },
};
</script>

<style>
/* Variabili CSS globali per i colori e lo stile dell'app */
:root {
  --primary-color: #6366f1; /* Colore nota (viola) */
  --secondary-color: #48a8ec; /* Colore evento (azzurro) */
  --accent-color: #ba2815; /* Colore di pomodoro (rosso) */
  --text-color: #1f2937; /* Colore del testo principale */
  --light-color: #f9fafb; /* Colore di sfondo */
  --gray-color: #9ca3af; /* Colore per i titoli */
  --card-bg: #ffffff; /* Sfondo delle card */
  --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05); /* Ombra delle card */
  --gradient-bg: linear-gradient(
    120deg,
    #3134e7 0%,
    #48b2ec 100%
  ); /* Sfondo gradiente header principale */
  --border-radius: 1em; /* Raggio dei bordi per elementi arrotondati */
}

/* Contenitore Principale */
.app-container {
  min-height: 100vh;
  min-width: 70%;
  max-width: 95%;
  background-color: transparent;
  padding: 1.5em;
  font-family: "Poppins", sans-serif;
  color: var(--text-color);
}

/* Sezione header */
.header-section {
  background: var(--gradient-bg);
  border-radius: var(--border-radius);
  padding: 2em;
  color: white;
  text-align: center;
  position: relative;
  margin-bottom: 2em;
  width: 100%;
  box-shadow: var(--card-shadow);
  animation: fadeIn 0.8s ease-out; /* Animazione di ingresso */
}

/* CSS saluti e sottotesto */
#saluti {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em; /* Spazio tra icona e testo */
}

#testo-saluto {
  font-size: 2em;
  font-weight: 600;
  margin: 0;
}

#icona-saluto {
  font-size: 2.5em;
  animation: saluta 2s infinite;
  transform-origin: 70% 70%; /* Punto di rotazione per l'animazione */
}

#sottotesto {
  font-size: 1.3em;
}

.logout-btn-container {
  position: absolute;
  top: 1em;
  right: 1em;
}

/* Stile del pulsante di logout */
.logout-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 0.5em 1em;
  border-radius: 2em;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background-color: rgb(201, 36, 36);
  transform: translateY(-2px);
}

.logout-btn:active {
  transform: translateY(0);
  background-color: #ba2815;
}

/* Container delle cards */
.cards-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  gap: 1em;
}

.card {
  background-color: var(--card-bg);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--card-shadow);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeIn 0.8s ease-out;
  width: 100%;
}

.card:hover {
  transform: translateY(
    -5px
  ); /* Effetto di sollevamento al passaggio del mouse */
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.card-header {
  padding: 1em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  border-bottom: 1px solid #e5e7eb;
}

.note-card .card-header {
  background: linear-gradient(90deg, #e0e7ff 0%, #c7d2fe 100%);
  color: var(--primary-color);
}

.event-card .card-header {
  background: linear-gradient(90deg, #e0e7ff 0%, #c7d2fe 100%);
  color: var(--secondary-color);
}

.pomodoro-card .card-header {
  background: linear-gradient(90deg, #e0e7ff 0%, #c7d2fe 100%);
  color: var(--accent-color);
}

.card-header i {
  font-size: 1em;
}

.card-header h2 {
  margin: 0;
  font-size: 1.3em;
  font-weight: 600;
}

.card-content {
  max-width: 100%;
  padding: 1em;
  min-height: 150px;
}

/* Stile note */

.note-content {
  display: flex;
  flex-direction: column;
  gap: 1em;
}

.titolo-nota {
  margin: 0;
  font-size: 1.2em;
  color: var(--primary-color);
}

.categoria-nota {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  font-size: 0.9em;
}

.label-categoria {
  font-weight: 600;
}

.testo-categoria {
  background-color: var(--primary-color);
  color: white;
  padding: 0.25em 0.75em;
  border-radius: 1em;
  font-size: 0.9em;
}

/* 
  Descrizione della nota. 
  Viene usato -webkit-line-clamp e -webkit-box-orient per limitare il numero di righe mostrate e troncare il testo.
  Queste proprietà sono specifiche per browser basati su WebKit (come Chrome e Safari), 
  e permettono di mostrare solo un certo numero di righe di testo, aggiungendo "..." se il contenuto è più lungo.
*/
.descrizione-nota {
  margin: 0;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis; /* Troncamento del testo */
  display: -webkit-box;
  -webkit-line-clamp: 5; /* Mostra massimo 3 righe */
  line-clamp: 3; /* Per il supporto a Firefox */
  -webkit-box-orient: vertical;
  max-width: 100%;
}

.info-nota {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--gray-color);
}

.data-nota {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

/* Stati vuoti */
.testo-vuoto {
  color: var(--gray-color);
  text-align: center;
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.error-state {
  color: #ef4444;
  text-align: center;
}

/* Animazioni */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes saluta {
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(14deg);
  }
  20% {
    transform: rotate(-8deg);
  }
  30% {
    transform: rotate(14deg);
  }
  40% {
    transform: rotate(-4deg);
  }
  50% {
    transform: rotate(10deg);
  }
  60% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

/* Per i telefoni e piccoli schermi */
@media (max-width: 700px) {
  .cards-container {
    flex-direction: column;
    align-items: center;
  }
  .card {
    max-width: 90vw;
    width: 100%;
  }

  .logout-btn-container {
    position: static;
    margin-top: 1em;
  }
}

/* Icone FontAwesome */
.fas {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}
</style>
