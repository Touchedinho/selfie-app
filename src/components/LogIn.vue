<template>
  <section class="login-container">
    <header class="header-modulo titolo-login">
      <h1>LOGIN</h1>
    </header>
    <main class="log-in">
      <div class="icona-login">
        <font-awesome-icon icon="fa-solid fa-right-to-bracket" />
      </div>
      <form @submit.prevent="login">
        <div class="input-group-login">
          <div class="username-login">
            <input type="text" name="text" class="input-login" required v-model="username" />
            <label class="label-login"> <font-awesome-icon icon="fa-solid fa-user" /> | Username </label>
          </div>
          <hr />
          <div class="password-login">
            <input type="password" name="number" class="input-login" required v-model="password" />
            <label class="label-login"> <font-awesome-icon icon="fa-solid fa-lock" /> | Password </label>
          </div>
          <aside class="password-dimenticata">
            <router-link to="/forgotpassword" >Password dimenticata?</router-link >
          </aside>
          <div class="error message" v-if="message">  {{ message }} </div>
          <div class="button">
            <button class="animated-button" type="submit">
              <font-awesome-icon icon="fa-solid fa-calendar-days" />
              <span>Accedi</span>
            </button>
          </div>
        </div>
      </form>
      <aside class="iscriviti">
        <div>
          Sei nuovo su <i>SELFIE</i>?
          <router-link to="/signup">Registrati quì!</router-link>
        </div>
      </aside>
    </main>
  </section>
</template>

<script>
import "@/style/ModuleStyle.css";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCalendarDays,
  faLock,
  faRightToBracket,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

import axios from "axios";

library.add(faUser, faLock, faRightToBracket, faCalendarDays);

export default {
  name: "LogIn",
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      username: "",
      password: "",
      email: "",
      message: "",
    };
  },
  methods: {
    /**
     * Effettua il login dell'utente.
     * Invia una richiesta POST al backend con le credenziali dell'utente.
     * Se la risposta è positiva, salva il token e il nome utente nel localStorage
     * e reindirizza l'utente alla pagina home.
     * In caso di errore, mostra un messaggio di errore appropriato.
     */
    async login() {
      this.message = "";
      try {
        const backendHost = `http://${window.location.hostname}:${window.location.port}`;
        const response = await axios.post(`${backendHost}/api/auth/login`, {
          username: this.username,
          password: this.password,
        });
        // Salva il token e il nome utente nel localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", this.username);

        // Usa direttamente la mail dalla risposta della login
        const email = response.data.email || "";
        localStorage.setItem("email", email);
        console.log("Email salvata in localStorage:", email);

        // Reindirizza l'utente alla pagina home
        this.$router.push("/home");
      } catch (error) {
        // Gestione degli errori
        if (error.response) {
          console.error(
            "Errore nella risposta del server:",
            error.response.data
          );
          // Mostra un messaggio di errore specifico all'utente (es. "Username o password errati")
          this.message =
            error.response.data.message ||
            "Errore sconosciuto durante il login.";
        } else if (error.request) {
          // La richiesta è stata fatta ma non c'è stata risposta
          console.error("Errore nella richiesta:", error.request);
          this.message = "Nessuna risposta dal server. Riprova più tardi.";
        } else {
          // Si è verificato un errore durante la configurazione della richiesta
          console.error("Errore generico:", error.message);
          this.message = "Errore sconosciuto.";
        }
      }
    },
  },
};
</script>

<style scoped>
.titolo-login {
  margin: 1em;
  border-top-left-radius: 0.5em;
  border-top-right-radius: 0.5em;
  background: linear-gradient(
    135deg,
    #1a56a9 0%,
    #039bbd 100%
  ); /* un pò più scuro rispetto alle altre pagine */
}

.login-container {
  background-image: url("@/assets/sfondo-login.jpg");
  height: 100%;
  max-width: 80%;
  border-radius: 15px;
  background-position: center;
  margin: 2em 0 5em 0;
}

.log-in {
  padding: 0 2em 1em 2em;
}

.icona-login {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5em;
}

.icona-login svg {
  width: 100px;
  height: 60px;
  fill: none;
  stroke: white;
  stroke-width: 1px;
}

.input-group-login {
  position: relative;
  margin-bottom: 3em;
}

/* Stile per i campi di input */

.input-login {
  width: 100%;
  border: solid 1.5px #9e9e9e;
  border-radius: 7px;
  background: none;
  backdrop-filter: blur(
    10px
  );
  padding: 1em;
  font-size: 15px;
  color: #f5f5f5;
  font-family: "Poppins", sans-serif;
}

/* Stile per le etichette dei campi di input */
.label-login {
  position: absolute;
  left: 1em;
  color: #9e9e9e;
  pointer-events: none; /* Per evitare che l'etichetta interferisca con il clic sull'input */
  transform: translateY(
    15px
  ); /* Spostata verso il basso per sembrare un placeholder */
  font-size: 15px;
  transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  font-family: "Poppins", sans-serif;
}

/* Effetti quando l'input è attivo (focus) o valido (non vuoto) */
.input-login:focus,
.input-login:valid {
  outline: none;
  border: 1.5px solid white;
}

/* Effetti per la label che segue un input attivo o valido (in HTML
  la label viene subito dopo l'inpiut) */
.input-login:focus ~ .label-login,
.input-login:valid ~ .label-login {
  transform: translateX(-10px) translateY(-50%) scale(0.9);
  background-color: #212121;
  padding: 0.2em 0.5em 0.2em 0.5em;
  color: #fff;
  border-radius: 7px;
}

/* Inizio CSS per le sezioni di registrazione e password dimenticata */

.iscriviti,
.password-dimenticata {
  text-align: center;
  margin: 1em 0;
  font-family: "Poppins", sans-serif;
  backdrop-filter: blur(
    8px
  );
  padding: 0.8em;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);
  font-weight: 500;
}

.iscriviti {
  background: linear-gradient(
    135deg,
    rgba(26, 86, 169, 0.7) 0%,
    rgba(3, 155, 189, 0.7) 100%
  );
}

.password-dimenticata {
  background: rgba(14, 14, 87, 0.7);
}

.iscriviti:hover,
.password-dimenticata:hover {
  transform: translateY(-3px); /* Effetto di sollevamento */
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.iscriviti a,
.password-dimenticata a {
  color: #ffffff;
  text-decoration: none;
  font-weight: 400;
  position: relative;
}

/* Effetto di sottolineatura animato con after */
.iscriviti a:after,
.password-dimenticata a:after {
  content: ""; /* Elemento vuoto sotto il link per l'effetto */
  position: absolute;
  width: 0;
  height: 2px; /* Altezza della sottolineatura */
  bottom: -2px; /* Posizione sotto il testo */
  left: 0; /* Inizio da sinistra, per l'effetto */
  background-color: white;
  transition: width 0.3s ease; /* Transizione per l'effetto di sottolineatura da sx a dx */
}

.iscriviti a:hover:after,
.password-dimenticata a:hover:after {
  width: 100%; /* Effetto di sottolineatura: appare da sinistra destra */
}

/* Stile per il button di login */

.button {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1em;
}

.animated-button {
  position: relative;
  padding: 1em 1.5em;
  font-size: 16px;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  color: white;
  background: linear-gradient(135deg, #1a56a9 0%, #039bbd 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  overflow: hidden; /* Nasconde elementi figli che escono dai bordi (nell'animazione) */
  transition: all 0.3s ease;
  box-shadow: 0 6px 15px rgba(3, 155, 189, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

/* Effetto di pagina di calendario */
.animated-button::before {
  content: ""; /* Elemento vuoto per l'effetto di pagina */
  position: absolute;
  top: 0; /* Posizionato l'elemento in alto */
  right: 0; /* Posizionato a destra */
  width: 0; /* Inizialmente largo 0, quindi non visibile */
  height: 100%; /* Altezza uguale al bottone, per coprirlo tutto */
  background: rgba(255, 255, 255, 0.1);
  transform-origin: right; /* Origine dell'animazione a destra */
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* Transizione per l'effetto di pagina */
  z-index: 1; /* Posizionato sotto il testo e bottone, ma sopra lo sfondo */
  clip-path: polygon(0 0, 100% 0, 100% 100%, 10% 100%); /* Forma a pagina */
}

.animated-button i,
.animated-button span {
  position: relative; /* Per posizionare gli effetti sopra l'icona e il testo */
  z-index: 2; /* Posizionato sopra gli effetti di pagina e note, così testo e icona sono sempre visibili */
  transition: all 0.3s ease;
}

.animated-button:hover {
  transform: translateY(-3px); /* Effetto di sollevamento */
  box-shadow: 0 10px 20px rgba(3, 155, 189, 0.4); /* Effetto di sollevamento aumentando l'ombra */
}

.animated-button:hover::before {
  width: 100%; /* L'effetto di pagina si espande da 0 a 100% */
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1); /* Anima l'espansione della pagina */
}

.animated-button:hover::after {
  opacity: 1; /* L'effetto delle note diventa visibile al passaggio del mouse */
}

.animated-button:active {
  transform: translateY(
    0
  ); /* Rimuove l'effetto di sollevamento quando il bottone è premuto */
  box-shadow: 0 3px 10px rgba(3, 155, 189, 0.4);
}
</style>
