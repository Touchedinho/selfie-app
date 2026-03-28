<template>
  <h1 class="logo">🍅 Pomodoro 🍅</h1>
  <div id="tomato">
    <h3>Imposta un timer di studio utile per la concentrazione!</h3>
    <p>Ha due scelte:<br />Inserire i minuti totali nell'apposito riquadro a sinistra e il pomodoro calcolerà automaticamente, premendo il tasto <b>Calcola i minuti!</b>, la divisione tra studio e pausa e quanti cicli ripetere il tutto <small>(verrà utilizzato lo standard 30min/5min/5 cicli)</small><br />Inserire direttamente nei riquadri a destra il tempo voluto per ogni sessione</p>
    <div id="pomodoro-tel">
      <form class="pomodoro-form">
        <div id="input-group">
          <div class="inp">
            <label for="tempo">Inserisci i minuti totali per il pomodoro:</label>
            <input type="number" id="tempo" min="175" placeholder="Minimo 175min..." /><br />

            <label for="programPomodoro" >Data e ora di inizio del Pomodoro (opzionale):</label >
            <input type="datetime-local" id="programPomodoro" />
          </div>

          <div class="inp">
            <label for="tempo">Minuti di studio per il pomodoro:</label>
            <input type="number" id="studio_dif" min="1" placeholder="Minuti di studio..." /><br />

            <label for="tempo">Minuti di pausa per il pomodoro:</label>
            <input type="number" id="attesa_dif" min="1" placeholder="Minuti di pausa..." /><br />

            <label for="tempo">Cicli per il pomodoro:</label>
            <input type="number" id="cicli_dif" min="1" placeholder="Cicli..." /><br />
          </div>
        </div>
        <div class="button-group">
          <button @click.prevent="calcolaMinuti">Calcola i minuti!</button>
          <button @click.prevent="attivaTimer">
            {{ attivo ? "Pausa!" : "Inizia!" }}
          </button>
          <button id="forzaSessione" class="Inv" @click.prevent="forzaTimer">
            Forza prossima sessione!
          </button>
          <button id="ricomincia" class="Inv" @click.prevent="resetTimer">
            Ricomincia!
          </button>
          <button @click.prevent="endTimer">Resetta e concludi!</button>
          <button @click.prevent="programmaTimer">Programma Timer!</button>
        </div>
      </form>
      <div id="clock">
        <svg>
          <circle id="cerchio_sfondo" cx="50%" cy="50%" r="6em" />
          <circle id="cerchio_anim" cx="50%" cy="50%" r="6em" pathLength="1" />
          <text x="50%" y="55%" text-anchor="middle" id="timer-display">{{ formattedTime }}</text>
        </svg>
      </div>
    </div>
  </div>
</template>

<style>
@font-face {
  font-family: "DS-Digital";
  src: url("../assets/DS-DIGIT.TTF");
}

/* Stile principale del contenitore Pomodoro */
#tomato {
  background: linear-gradient(
    45deg,
    #ff8c00,
    #ff4500,
    #ff6347
  ); /* Gradiente arancione/rosso */
  font-family: "Poppins", Tahoma, Geneva, Verdana, sans-serif; /* Font uguale per il resto dell'app */
  border-radius: 2em;
  margin: 2em auto;
  padding: 2em;
  width: 80%;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37); /* Ombra per effetto profondità */
  backdrop-filter: blur(4px); /* Effetto sfocatura sfondo */
  border: 1px solid rgba(255, 255, 255, 0.18); /* Bordo semi-trasparente */
}

/* Stile degli elementi interni */
#pomodoro-tel {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 2em;
}

/* Stile del form per la scelta delle feature del pomodoro */
.pomodoro-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
}

/* Stile delle parti del form */
#input-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 2em;
  gap: 2em;
}

/* Stile del contenitore di etichette ed input */
.inp {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1em;
  background: rgba(255, 255, 255, 0.1);
  padding: 15px;
  border-radius: 1em;
}

/* Stile delle etichette e degli input */
.inp label {
  margin: 0.5em;
  text-align: center;
  font-weight: bold;
  color: rgb(85, 0, 0);
}

.inp input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid #ffc107;
  border-radius: 1em;
  font-size: 1rem;
  width: 15rem;
  padding: 0.7em;
  color: white;
  text-align: center;
}

.inp input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

/* Stile del contenitore dei pulsanti */
.button-group {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin-top: 1em;
  flex-wrap: wrap;
}

/* Stile dei pulsanti */
.button-group button {
  background: linear-gradient(45deg, #ffc107, #ff9800);
  border-radius: 8px;
  border: none;
  padding: 0.8em 1.5em;
  font-family: "Poppins", Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1rem;
  font-weight: bold;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* Effetti hover e active sui pulsanti */
.button-group button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  background: linear-gradient(45deg, #ffca28, #ffb300);
}

.button-group button:active {
  transform: translateY(1px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.Inv {
  visibility: hidden;
  display: none;
}

#clock {
  display: flex;
  margin-top: 2px;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 15px;
}

#clock svg {
  width: 220px;
  height: 220px;
}

#timer-display {
  font-family: "DS-Digital", sans-serif;
  font-size: 3.5rem;
  fill: #ffeb3b;
  text-shadow: 0 0 4px #ffeb3b, 0 0 8px #ff8c00;
}

#cerchio_sfondo,
#cerchio_anim {
  fill: none;
  stroke: #ffeb3b;
  stroke-width: 12px;
  transform-origin: center center;
  transform: rotate(-90deg);
}

#cerchio_sfondo {
  stroke-opacity: 0.2;
}

#cerchio_anim {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  stroke-linecap: round;
  stroke-opacity: 1;
  filter: drop-shadow(0 0 5px #ffeb3b);
}

.animazione {
  transition: stroke-dashoffset 1s ease;
}

/* Telefoni */
@media (max-width: 856px) {
  #tomato {
    width: 95%;
  }

  #pomodoro-tel {
    flex-direction: column;
  }

  #input-group {
    flex-direction: column;
  }

  .inp input {
    width: 12rem;
  }
}
</style>

<script>
let backendHost = `http://${window.location.hostname}:${window.location.port}`;
import { getVirtualTime } from "@/api";
let intervalControl = null;

export default {
  name: "PomodoroTimer",
  data() {
    return {
      timer: null, // Riferimento al setInterval
      autore: "",
      id: 0,
      studio: 30 * 60, // Tempo per lo studio
      studio_rimasto: 0,
      pausa: 5 * 60, // Tempo per la pausa
      pausa_rimasta: 0,
      ciclo: 5, // Numero di cicli totali
      cicli_rimasti: 0,
      faseStudio: true, // Fase attuale (studio o pausa)
      evento: false, // Se si tratta di un evento
      attivo: false,
      primavolta: true,
    };
  },

  computed: {
    formattedTime() {
      let t;
      if (this.faseStudio) {
        t = this.studio_rimasto;
      } else {
        t = this.pausa_rimasta;
      }
      const minuti = Math.floor(t / 60);
      const secondi = t % 60;
      return `${minuti.toString().padStart(2, "0")}:${secondi.toString().padStart(2, "0")}`; // Ritorna il tempo del timer con XX:YY con XX minuti e YY secondi
    },
  },

  methods: {
    calcolaMinuti() {
      const time = parseInt(document.getElementById("tempo").value);
      if (time && time >= 175) {
        const cicli = Math.floor(time / 35);
        const x = (time - 35 * cicli) / (2 * cicli);
        const studio = 30 + x;
        const attesa = 5 + x;

        document.getElementById("studio_dif").value = studio;
        document.getElementById("attesa_dif").value = attesa;
        document.getElementById("cicli_dif").value = cicli;
      } else {
        alert("Per favore, inserisci un valore valido.");
      }
    },

    controlloPausa() {
      if (this.attivo) {
        clearInterval(this.timer);
      } else {
        this.iniziaInterval();
      }
      this.attivo = !this.attivo;
    },

    async salvaTimer() {
      const autore = localStorage.getItem("username");
      const id = this.id;
      const studio = this.studio;
      const studio_rimasto = this.studio_rimasto;
      const pausa = this.pausa;
      const pausa_rimasta = this.pausa_rimasta;
      const ciclo = this.ciclo;
      const cicli_rimasti = this.cicli_rimasti;
      const faseStudio = this.faseStudio;
      const evento = this.evento;

      try {
        await fetch(`${backendHost}/api/pomodoro/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
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
          }),
        });
      } catch (err) {
        console.error("Errore salvataggio pomodoro:", err);
      }
    },

    endTimer() {
      clearInterval(this.timer);
      this.attivo = false;
      this.evento = false;
      this.studio_rimasto = 0; // Azzero i valori perché il Pomodoro concluso
      this.pausa_rimasta = 0;
      this.cicli_rimasti = 0;
      this.salvaTimer();
      
      // Resetto i valori del Pomodoro
      this.id = 0;
      this.studio = 30 * 60;
      this.pausa = 5 * 60;
      this.ciclo = 5;
      this.cicli_rimasti = 0;
      this.faseStudio = false;
      this.primavolta = true;
      
      // Resetto anche form
      document.getElementById("studio_dif").value = "";
      document.getElementById("attesa_dif").value = "";
      document.getElementById("cicli_dif").value = "";
      document.getElementById("tempo").value = "";
      document.getElementById("forzaSessione").classList.add("Inv");
      document.getElementById("ricomincia").classList.add("Inv");
      document.getElementById("cerchio_anim").classList.remove("animazione");
      document.getElementById("cerchio_anim").style.strokeDashoffset = 1;
    },

    async controlloIncompleto() {
      try {
        const user = localStorage.getItem("username");
        const res = await fetch(`${backendHost}/api/pomodoro/getIncompl?autore=${encodeURIComponent(user)}`);
        if (res.status === 200 && !this.attivo) {
          const timer = await res.json();

          if (timer.evento) {
            return;
          }

          const riprendi = confirm("Non hai completato un Pomodoro precedente. Vuoi riprenderlo?");

          if (riprendi) {
            this.primavolta = false;
            this.id = timer.id;
            this.autore = timer.autore;
            this.studio = timer.studio;
            this.studio_rimasto = timer.studio_rimasto;
            this.pausa = timer.pausa;
            this.pausa_rimasta = timer.pausa_rimasta;
            this.ciclo = timer.ciclo;
            this.cicli_rimasti = timer.cicli_rimasti;
            this.faseStudio = timer.faseStudio;

            document.getElementById("cerchio_anim").classList.add("animazione");
            document.getElementById("forzaSessione").classList.remove("Inv");
            document.getElementById("ricomincia").classList.remove("Inv");

            this.iniziaInterval();
            this.attivo = true;
          }
        }
      } catch (err) {
        console.error("Errore nel controllo del timer incompleto:", err);
      }
    },

    async controlloEvento() {
      try {
        const user = localStorage.getItem("username");
        const res = await fetch(`${backendHost}/api/pomodoro/getEvento?autore=${encodeURIComponent(user)}`);
        if (res.status === 200) {
          const timer = await res.json();

          if (!timer.date || isNaN(new Date(timer.date).getTime())) {
            console.warn("Data non valida:", timer);
            return;
          }

          if (timer.evento === false) {
            this.primavolta = false;
            this.id = timer.id;
            this.autore = timer.autore;
            this.studio = timer.studio;
            this.studio_rimasto = timer.studio_rimasto;
            this.pausa = timer.pausa;
            this.pausa_rimasta = timer.pausa_rimasta;
            this.ciclo = timer.ciclo;
            this.cicli_rimasti = timer.cicli_rimasti;
            this.faseStudio = timer.faseStudio;
            this.evento = false;

            await this.salvaTimer();
            return;
          }

          if (
            timer.studio_rimasto <= 0 &&
            timer.pausa_rimasta <= 0 &&
            timer.cicli_rimasti <= 0
          ) {
            return;
          }

          let virtualTime = null;
          try {
            const timeStr = await getVirtualTime();
            if (
              timeStr &&
              typeof timeStr === "string" &&
              timeStr.trim() !== ""
            ) {
              const parsed = new Date(timeStr);
              if (!isNaN(parsed)) {
                virtualTime = parsed;
              }
            }
          } catch (virtualE) {
            console.warn("Errore getVirtualTime:", virtualE);
          }

          const ora = virtualTime || new Date();

          if (new Date(timer.date) > ora) return;

          alert(
            "Inizio Pomodoro salvato come Evento. Attenzione! Anche se l'evento è stato saltato, è necessario completare il Timer."
          );

          this.primavolta = false;
          this.id = timer.id;
          this.autore = timer.autore;
          this.studio = timer.studio;
          this.studio_rimasto = timer.studio_rimasto;
          this.pausa = timer.pausa;
          this.pausa_rimasta = timer.pausa_rimasta;
          this.ciclo = timer.ciclo;
          this.cicli_rimasti = timer.cicli_rimasti;
          this.faseStudio = timer.faseStudio;

          document.getElementById("cerchio_anim").classList.add("animazione");
          document.getElementById("forzaSessione").classList.remove("Inv");
          document.getElementById("ricomincia").classList.remove("Inv");

          this.iniziaInterval();
          this.attivo = true;
        }
      } catch (err) {
        console.error("Errore nel controllo del timer programmato:", err);
      }
    },

    iniziaInterval() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.faseStudio) {
          if (this.studio_rimasto > 0) {
            this.studio_rimasto--;
            document.getElementById("cerchio_anim").style.strokeDashoffset =
              (this.studio - this.studio_rimasto) / this.studio;
          } else {
            this.forzaTimer();
          }
        } else {
          if (this.pausa_rimasta > 0) {
            this.pausa_rimasta--;
            document.getElementById("cerchio_anim").style.strokeDashoffset =
              (this.pausa - this.pausa_rimasta) / this.pausa;
          } else {
            this.forzaTimer();
          }
        }

        this.salvaTimer();
      }, 1000);
    },

    async forzaTimer() {
      clearInterval(this.timer);
      const email = localStorage.getItem("email");

      try {
        if (this.faseStudio) {
          this.faseStudio = false;
          this.studio_rimasto = 0;
          this.pausa_rimasta = this.pausa;

          alert("Fase di studio terminata! Inizia la pausa.");
          if (email) {
            await fetch(`${backendHost}/api/pomodoro/notify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, fase: "pausa" }),
            });
            alert("Notifica inviata via mail per l'inizio della pausa.");
          }
        } else {
          this.cicli_rimasti--;

          if (this.cicli_rimasti <= 0) {
            alert("Pomodoro concluso!");
            if (email) {
              await fetch(`${backendHost}/api/pomodoro/notify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, fase: "fine" }),
              });
              alert("Notifica inviata via mail per la fine del pomodoro.");
            }

            this.endTimer();
            return;
          }

          this.faseStudio = true;
          this.pausa_rimasta = 0;
          this.studio_rimasto = this.studio;

          alert("Fase di pausa terminata! Inizia lo studio.");
          if (email) {
            await fetch(`${backendHost}/api/pomodoro/notify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, fase: "studio" }),
            });
            alert(
              "Notifica inviata via mail per l'inizio della sessione di studio."
            );
          }
        }
      } catch (error) {
        console.error("Errore nell'inivio della mail di notifica:", error);
      }

      this.iniziaInterval();
    },

    resetTimer() {
      clearInterval(this.timer);
      this.primavolta = true;
      this.attivaTimer();
    },

    // Facciamo partire il pomodoro
    async attivaTimer() {
      if (this.primavolta) {
        const user = localStorage.getItem("username");

        this.primavolta = false;
        this.autore = user;
        this.studio =
          parseInt(document.getElementById("studio_dif").value) * 60;
        this.pausa = parseInt(document.getElementById("attesa_dif").value) * 60;
        this.ciclo = parseInt(document.getElementById("cicli_dif").value);

        if (this.studio && this.pausa && this.ciclo) {
          this.studio_rimasto = this.studio;
          this.pausa_rimasta = this.pausa;
          this.cicli_rimasti = this.ciclo;
          this.faseStudio = true;

          const ultimoID = await fetch(
            `${backendHost}/api/pomodoro/getID?autore=${encodeURIComponent(
              user
            )}`
          );
          if (ultimoID) {
            const dati = await ultimoID.json();
            console.log("Dati ricevuti:", dati);
            this.id = dati.ID;
          }

          document.getElementById("cerchio_anim").classList.add("animazione");
          document.getElementById("cerchio_anim").style.strokeDashoffset = 1;
          document.getElementById("forzaSessione").classList.remove("Inv");
          document.getElementById("ricomincia").classList.remove("Inv");

          this.iniziaInterval();
          this.attivo = true;
        } else {
          alert(
            "Per favore, inserisci valori validi per tutti i campi o premi il tasto 'Calcola i minuti!' prima di avviare il timer."
          );
        }
      } else {
        this.controlloPausa();
      }
    },

    async programmaTimer() {
      const studioP = parseInt(document.getElementById("studio_dif").value) * 60;
      const pausaP = parseInt(document.getElementById("attesa_dif").value) * 60;
      const cicliP = parseInt(document.getElementById("cicli_dif").value);
      const data = document.getElementById("programPomodoro").value;

      if (!studioP || !pausaP || !cicliP || !data) {
        alert("Compila tutti i campi prima di programmare!");
        return;
      }

      const user = localStorage.getItem("username");

      let ID;
      const ultimoID = await fetch(
        `${backendHost}/api/pomodoro/getID?autore=${encodeURIComponent(user)}`
      );
      if (ultimoID) {
        const dati = await ultimoID.json();
        console.log("Dati ricevuti:", dati);
        ID = dati.ID;
      } else {
        console.log("Errore ricerca ID");
        return;
      }

      // data è "YYYY-MM-DDTHH:mm", aggiungiamo i secondi per compatibilità con il backend
      const dataLocale = data.length === 16 ? data + ":00" : data; // "YYYY-MM-DDTHH:mm:ss"
      // Calcola orari start/end in locale
      const [, timePart] = dataLocale.split("T");
      const [hour, minute] = timePart.split(":");
      const start = hour.padStart(2, "0") + ":" + minute.padStart(2, "0");
      const endHour = (parseInt(hour, 10) + 1).toString().padStart(2, "0");
      const end = endHour + ":" + minute.padStart(2, "0");

      await fetch(`${backendHost}/api/pomodoro/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autore: user,
          id: ID,
          studio: studioP,
          studio_rimasto: studioP,
          pausa: pausaP,
          pausa_rimasta: pausaP,
          ciclo: cicliP,
          cicli_rimasti: cicliP,
          faseStudio: true,
          evento: true,
          date: dataLocale, // invia stringa locale
        }),
      });

      await fetch(`${backendHost}/api/calendar/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: user,
          title: "Pomodoro",
          description: "Pomodoro programmato",
          date: dataLocale, // invia stringa locale
          allDay: false,
          startTime: start,
          endTime: end,
          pomodoro_id: ID,
        }),
      });

      alert("Timer programmato correttamente!");
    },

    controllo() {
      clearInterval(intervalControl);
      intervalControl = setInterval(() => {
        if (!this.attivo) {
          this.controlloEvento();
          this.controlloIncompleto();
        }
      }, 10000);
    },
  },

  mounted() {
    if (!intervalControl) this.controllo();
  },

  beforeUnmount() {
    clearInterval(this.timer);
    this.attivo = false;
    clearInterval(intervalControl);
  },
};
</script>
