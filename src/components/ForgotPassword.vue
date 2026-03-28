<template>
  <section class="card-modulo forgot-password-container">
    <header class="header-modulo">
      <h1>PASSWORD DIMENTICATA</h1>
    </header>
    <main class="content-modulo">
      <aside class="recupero-password-info">
        <font-awesome-icon icon="fa-solid fa-circle-info" class="icona-info" />
        <p>Inserisci l'email associata al tuo account. Ti invieremo un link per reimpostare la password.</p>
      </aside>

      <form @submit.prevent="sendResetEmail" class="reset-form">
        <div class="input-field">
          <div class="input-email">
            <span class="icona"><font-awesome-icon icon="fa-solid fa-envelope"/></span>
            <input type="email" v-model="email" placeholder="Email" required />
          </div>
        </div>

        <div class="message success" v-if="successMessage">
          {{ successMessage }}
        </div>

        <div class="message error" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="button-container">
          <button class="selfie-button" type="submit" :disabled="isLoading">
            <span class="icona-camera" v-if="!isLoading">
              <font-awesome-icon icon="fa-solid fa-paper-plane" />
            </span>
            <span class="icona-caricamento" v-else>
              <font-awesome-icon icon="fa-solid fa-spinner" spin />
            </span>
            <span class="button-text">{{isLoading ? "Invio in corso..." : "Invia link di reset"}}</span>
          </button>
        </div>

        <div class="login-link">
          <router-link to="/login">
            <font-awesome-icon icon="fa-solid fa-arrow-left" />
            Torna al login
          </router-link>
        </div>
      </form>
    </main>
  </section>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faEnvelope,
  faPaperPlane,
  faArrowLeft,
  faCircleInfo,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import axios from "axios";

library.add(faEnvelope, faPaperPlane, faArrowLeft, faCircleInfo, faSpinner);

export default {
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      email: "",
      successMessage: "",
      errorMessage: "",
      isLoading: false,
    };
  },

  methods: {
    // Funzione per inviare l'email di reset della password
    async sendResetEmail() {
      this.successMessage = "";
      this.errorMessage = "";
      // Caricamento per estetica
      this.isLoading = true;

      try {
        const backendHost = `http://${window.location.hostname}:${window.location.port}`;
        const response = await axios.post(`${backendHost}/api/auth/forgotpassword`,{email: this.email,});
        
        this.successMessage = response.data.message || "Email di reset inviata con successo!";
        // Resetta il campo email dopo l'invio
        this.email = "";
      } catch (error) {
        // Gestione degli errori
        this.errorMessage = error.response?.data?.message || "Si è verificato un errore durante l'invio dell'email di reset.";
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.forgot-password-container {
  max-width: 500px;
  margin: 4em 0 22vh 0; /* Usato vh per non far apparire la pagina bianca dietro */
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  background-image: linear-gradient(
    135deg,
    /* Angolo della sfumatura, inizia da in alto a sx */
      rgba(190, 244, 252, 0.95),
    /* Colore di partenza */ rgba(240, 240, 240, 0.9) /* Colore in basso a sx*/
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

.recupero-password-info {
  display: flex;
  align-items: flex-start; /* Allinea l'icona con il testo all'inizio */
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
  margin-top: 0.5em; /* Allinea l'icona con il testo */
}

.recupero-password-info p {
  margin: 0;
  font-family: "Poppins", sans-serif;
  color: #444;
}

.reset-form {
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1em;
  padding: 1.5em;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
}

/* Contenitore per il campo di input */
.input-field {
  position: relative;
}

.input-email {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.8em;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease; /* Transizione per il focus */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden; /* Per evitare overflow del contenuto */
}

/* Nel caso in cui uno dei figli dell'input-email riceva il focus */
.input-email:focus-within {
  border-color: #1a56a9; /* Cambia il colore del bordo al focus */
  box-shadow: 0 0 0 3px rgba(26, 86, 169, 0.2); /* Aggiungi un'ombra al focus */
}

.icona {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 1em;
  color: #039bbd;
  font-size: 1em;
}

.input-email input {
  flex: 1; /* Permette all'input di occupare lo spazio rimanente */
  border: none;
  padding: 0.5em;
  background: transparent;
  font-size: 1em;
  font-family: "Poppins", sans-serif;
  color: #333;
}

.input-email input:focus {
  outline: none; /* Rimuove il contorno predefinito del browser */
}

/* Messaggi di successo e errore */
.message {
  padding: 1em;
  border-radius: 8px;
  font-family: "Poppins", sans-serif;
  animation: fadeIn 0.3s ease;
}

.success {
  background-color: #d1e7dd;
  color: #0f5132;
  border-left: 4px solid #0f5132;
  border-right: 4px solid #0f5132;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.button-container {
  display: flex;
  justify-content: center;
  margin: 1.5em 0 1em 0;
}

/* Pulsante di invio */
.selfie-button {
  position: relative;
  padding: 0.9em 2em;
  font-size: 1em;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  letter-spacing: 0.5px;
  color: white;
  background: linear-gradient(
    135deg,
    #1a56a9 0%,
    #039bbd 100%
  ); /* Sfumatura blu */
  border: none;
  border-radius: 5em;
  cursor: pointer;
  overflow: hidden; /* Nasconde overflow per non far uscire dai contorni gli effetti */
  transition: all 0.3s ease; /* Transizione su hover */
  box-shadow: 0 6px 15px rgba(3, 155, 189, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1em;
  min-width: 220px;
}

.selfie-button:disabled {
  opacity: 0.7;
  cursor: not-allowed; /* Cursore non consentito se il pulsante è disabilitato */
  background: linear-gradient(
    135deg,
    #6c757d 0%,
    #6c757d 100%
  );
  box-shadow: 0 4px 10px rgba(108, 117, 125, 0.3);
}

/* Effetto "onda" al passaggio del mouse sul pulsante */
.selfie-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%; /* Si espande come un cerchio */
  transform: translate(-50%, -50%); /* Inizia al centro */
  z-index: 0; /* Dietro il contenuto del pulsante */
  transition: width 0.6s ease, height 0.6s ease; /* Animazione espansione */
}

/* Espansione effetto */
.selfie-button:not(:disabled):hover::before {
  width: 300px;
  height: 300px;
}

/* Effetto hover sul pulsante di invio */
.selfie-button:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(3, 155, 189, 0.4);
  background: linear-gradient(
    135deg,
    #2367c0 0%,
    #04b2d9 100%
  );
}

/* Effetto al click sul pulsante di invio */
.selfie-button:not(:disabled):active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}

/* Le icone e il testo del pulsante sono posizionati sopra l'effetto "onda" */
.icona-camera,
.icona-caricamento,
.button-text {
  position: relative;
  z-index: 2;
}

/* Link di accesso stile */

.login-link {
  text-align: center;
  margin-top: 1.5em;
  font-family: "Poppins", sans-serif;
  color: #666;
  font-weight: 450;
}

.login-link a {
  color: #1a56a9;
  text-decoration: none;
  font-weight: 600;
  position: relative;
  transition: all 0.3s ease;
}

.login-link a::after {
  content: "";
  position: absolute;
  width: 0; /* Inizialmente 0 per l'effetto di espansione */
  height: 2px; /* Altezza della linea */
  bottom: -2px; /* Posiziona la linea sotto il testo */
  left: 0; /* Allinea a sinistra */
  background-color: #1a56a9;
  transition: width 0.3s ease;
}

.login-link a:hover::after {
  width: 100%;
}

@media (max-width: 600px) {
  .forgot-password-container {
    margin: 2em 2em 33vh 2em; /* Usato vh per non far apparire la pagina bianca dietro */
    max-width: 90%;
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

  .reset-form {
    padding: 1em;
  }

  .selfie-button {
    min-width: 140px;
    font-size: 0.95em;
    padding: 0.7em 1.2em;
    gap: 0.5em;
  }
}
</style>
