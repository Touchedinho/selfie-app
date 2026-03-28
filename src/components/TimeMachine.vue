<template>
  <section class="card-modulo time-machine-container">
    <header class="header-modulo">
      <h1>TIME MACHINE</h1>
    </header>
    <main class="content-modulo">
      <aside class="time-machine-info">
        <font-awesome-icon icon="fa-solid fa-clock-rotate-left" class="icona-info"/>
        <p>Imposta una data e ora specifica per simulare il tempo nel sistema. Puoi tornare rapidamente all'orario reale usando il pulsante.</p>
      </aside>

      <form class="time-form" @submit.prevent>
        <div class="input-field">
          <div class="input-time">
            <span class="icona">
              <font-awesome-icon icon="fa-solid fa-calendar-days" />
            </span>
            <input type="datetime-local" v-model="currentTime" required />
          </div>
        </div>

        <div class="button-container">
          <button class="selfie-button" type="button" @click="updateTime">
            <span class="icona-camera">
              <font-awesome-icon icon="fa-solid fa-clock" />
            </span>
            <span class="button-text">Setta l'orario virtuale</span>
          </button>
          <button class="selfie-button" type="button" @click="resetTime">
            <span class="icona-camera">
              <font-awesome-icon icon="fa-solid fa-clock" />
            </span>
            <span class="button-text">Ritorna al tempo corretto</span>
          </button>
        </div>
      </form>
    </main>
  </section>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCalendarDays,
  faClock,
  faClockRotateLeft,
} from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
let backendHost = `http://${window.location.hostname}:${window.location.port}`;
library.add(faClockRotateLeft, faCalendarDays, faClock);

export default {
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      currentTime: "",
      systemTime: "",
      isVirtual: false,
    };
  },

  async mounted() {
    // All'avvio, recupera l'ora virtuale corrente dal backend
    try {
      const res = await fetch(`${backendHost}/api/time-machine/get`);
      if (!res.ok) throw new Error("Errore fetch");
      const data = await res.json();
      const dateObj = new Date(data.time); // data.time è in ISO UTC
      if (!isNaN(dateObj.getTime())) {
        // Converti UTC in locale per input
        this.currentTime = this.systemTime = this.getLocalDateTime(dateObj);
        // Se l'ora virtuale è diversa dall'ora reale di sistema, considerala virtuale
        this.isVirtual = Math.abs(dateObj - new Date()) > 60000; // tolleranza di 1 minuto
      } else {
        this.currentTime = this.systemTime = this.getLocalDateTime();
        this.isVirtual = false;
      }
    } catch (e) {
      console.error("Errore nel recupero del tempo virtuale: ", e);
      this.currentTime = this.systemTime = this.getLocalDateTime();
      this.isVirtual = false;
    }
  },

  methods: {
    // Converte una data JS in stringa per input datetime-local (in locale)
    getLocalDateTime(date = new Date()) {
      const tzOffset = date.getTimezoneOffset() * 60000;
      const local = new Date(date.getTime() - tzOffset);
      return local.toISOString().slice(0, 16);
    },

    // Converte una stringa datetime-local (locale) in ISO string UTC
    toISOStringFromLocal(datetimeStr) {
      // datetimeStr: 'YYYY-MM-DDTHH:mm'
      const date = new Date(datetimeStr);
      return date.toISOString();
    },

    ensureTimePart(datetimeStr) {
      // Se la stringa è solo data (YYYY-MM-DD), aggiungi orario attuale
      if (/^\d{4}-\d{2}-\d{2}$/.test(datetimeStr)) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${datetimeStr}T${hours}:${minutes}`;
      }
      // Se la stringa è YYYY-MM-DDT00:00 o senza orario, aggiungi orario attuale
      if (/^\d{4}-\d{2}-\d{2}T(00:00)?$/.test(datetimeStr)) {
        const [datePart] = datetimeStr.split("T");
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        return `${datePart}T${hours}:${minutes}`;
      }
      return datetimeStr;
    },

    async updateTime() {
      // Se l'utente ha selezionato solo la data, aggiungi l'orario attuale
      this.currentTime = this.ensureTimePart(this.currentTime);
      this.$emit("time-changed", this.currentTime);
      try {
        // Invia sempre la data in ISO UTC
        const isoTime = this.toISOStringFromLocal(this.currentTime);
        const res = await fetch(`${backendHost}/api/time-machine/set`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ time: isoTime }),
        });
        if (!res.ok) throw new Error("Errore impostazione tempo");
        // Aggiorna lo stato virtuale in base al tempo impostato
        const sys = this.getLocalDateTime();
        this.isVirtual = this.currentTime !== sys;
      } catch (e) {
        console.error("Errore nell'impostare il tempo virtuale: ", e);
      }
    },

    async resetTime() {
      // Reimposta sempre all'ora corrente di sistema (tempo reale)
      this.currentTime = this.systemTime = this.getLocalDateTime();
      await this.updateTime();
      try {
        const res = await fetch(`${backendHost}/api/time-machine/set`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ time: "" }),
        }); // Resetta all'ora di sistema
        if (!res.ok) throw new Error("Errore reset tempo");
        this.isVirtual = false;
      } catch (e) {
        console.error("Errore nel reset del tempo virtuale", e);
      }
    },
  },
};
</script>

<style scoped>
.time-machine-container {
  max-width: 500px;
  margin: 4em 0 22vh 0;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  background-image: linear-gradient(
    135deg,
    rgba(190, 244, 252, 0.95),
    rgba(240, 240, 240, 0.9)
  );
  backdrop-filter: blur(15px);
  border: none;
}

.header-modulo {
  background: linear-gradient(135deg, #1a56a9 0%, #039bbd 100%);
  padding: 1.5em;
}

.header-modulo h1 {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  font-size: 1.8em;
}

.content-modulo {
  padding: 2em;
}

.time-machine-info {
  display: flex;
  align-items: flex-start;
  gap: 1em;
  padding: 1.5em;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 1em;
  margin-bottom: 2em;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  border-left: 4px solid #1a56a9;
  border-right: 4px solid #1a56a9;
}

.icona-info {
  color: #1a56a9;
  font-size: 1.5em;
  margin-top: 0.5em;
}

.time-machine-info p {
  margin: 0;
  font-family: "Poppins", sans-serif;
  color: #444;
}

.time-form {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1em;
  padding: 1.5em;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

.input-field {
  position: relative;
}

.input-time {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.8em;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.input-time:focus-within {
  border-color: #1a56a9;
  box-shadow: 0 0 0 3px rgba(26, 86, 169, 0.2);
}

.icona {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1em;
  color: #039bbd;
  font-size: 1em;
}

.input-time input {
  flex: 1;
  border: none;
  padding: 0.5em;
  background: transparent;
  font-size: 1em;
  font-family: "Poppins", sans-serif;
  color: #333;
}

.input-time input:focus {
  outline: none;
}

.button-container {
  display: flex;
  justify-content: center;
  margin: 1.5em 0 1em 0;
  gap: 1.1em;
}

.selfie-button {
  position: relative;
  padding: 0.55em 1.1em;
  font-size: 0.93em;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  letter-spacing: 0.5px;
  color: white;
  background: linear-gradient(135deg, #1a56a9 0%, #039bbd 100%);
  border: none;
  border-radius: 5em;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(3, 155, 189, 0.13);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7em;
  min-width: 120px;
}

.selfie-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(135deg, #6c757d 0%, #6c757d 100%);
  box-shadow: 0 4px 10px rgba(108, 117, 125, 0.3);
}

.selfie-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  transition: width 0.6s ease, height 0.6s ease;
}

.selfie-button:not(:disabled):hover::before {
  width: 300px;
  height: 300px;
}

.selfie-button:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(3, 155, 189, 0.4);
  background: linear-gradient(135deg, #2367c0 0%, #04b2d9 100%);
}

.selfie-button:not(:disabled):active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}

.icona-camera,
.button-text {
  position: relative;
  z-index: 2;
}

@media (max-width: 600px) {
  .time-machine-container {
    margin: 2em 2em 33vh 2em;
    max-width: 100%;
    box-shadow: none;
    border-radius: 0.8em;
  }

  .header-modulo {
    padding: 1em;
    font-size: 1em;
  }

  .content-modulo {
    padding: 1em;
  }

  .time-form {
    padding: 1em;
  }

  .selfie-button {
    min-width: 90px;
    font-size: 0.89em;
    padding: 0.45em 0.8em;
    gap: 0.4em;
  }
}
</style>
