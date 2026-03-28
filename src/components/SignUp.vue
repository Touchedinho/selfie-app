<template>
  <section class="card-modulo registrazione-container">
    <header class="header-modulo">
      <h1>REGISTRAZIONE</h1>
    </header>
    <main class="content-modulo">
      <form class="sign-up-form" @submit.prevent="signup">
        <!-- Sezione Informazioni Personali -->
        <section class="info-section">
          <h2 class="section-title">
            <font-awesome-icon icon="fa-solid fa-user" />
            Informazioni Personali
          </h2>
          <div class="form-grid">
            <div class="sezione-sx">
              <div class="campo-input">
                <div class="input-container">
                  <span class="icona"><font-awesome-icon icon="fa-solid fa-signature" /></span>
                  <input type="text" placeholder="Nome" required v-model="name" />
                  <label>Nome</label>
                </div>
              </div>

              <div class="campo-input">
                <div class="input-container">
                  <span class="icona"><font-awesome-icon icon="fa-solid fa-id-card"/></span>
                  <input type="text" placeholder="Cognome" required v-model="surname" />
                  <label>Cognome</label>
                </div>
              </div>

              <div class="campo-input">
                <div class="input-container">
                  <span class="icona"><font-awesome-icon icon="fa-solid fa-envelope" /></span>
                  <input type="email" placeholder="Email" required v-model="email"/>
                  <label>Email</label>
                </div>
              </div>
            </div>
            <div class="sezione-dx">
              <div class="campo-input">
                <div class="input-container">
                  <span class="icona"><font-awesome-icon icon="fa-solid fa-location-dot"/></span>
                  <input type="text" placeholder="Indirizzo" />
                  <label>Indirizzo</label>
                </div>
              </div>

              <div class="campo-input">
                <div class="input-container">
                  <span class="icona"><font-awesome-icon icon="fa-solid fa-city"/></span>
                  <input type="text" placeholder="Città" />
                  <label>Città</label>
                </div>
              </div>

              <div class="campo-input">
                <div class="input-container select-wrapper">
                  <span class="icona"><font-awesome-icon icon="fa-solid fa-globe"/></span>
                  <select>
                    <option selected>Italia</option>
                    <option value="1">Germania</option>
                    <option value="2">Spagna</option>
                    <option value="3">Altro</option>
                  </select>
                  <label>Stato</label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Sezione Informazioni Utente -->
        <section class="info-section">
          <h2 class="section-title">
            <font-awesome-icon icon="fa-solid fa-lock" />
            Informazioni Utente
          </h2>
          <div class="form-grid">
            <div class="campo-input larghezza">
              <div class="input-container">
                <span class="icona"><font-awesome-icon icon="fa-solid fa-user"/></span>
                <input type="text" placeholder="Username" required v-model="username"/>
                <label>Username</label>
              </div>
            </div>

            <div class="campo-input larghezza">
              <div class="input-container password-wrapper">
                <span class="icona"><font-awesome-icon icon="fa-solid fa-lock" /></span>
                <input :type="passwordVisible ? 'text' : 'password'" v-model="password" placeholder="Password" required />
                <label>Password</label>
                <span class="icona-password" @click="togglePasswordVisibility">
                  <font-awesome-icon
                    :icon="
                      passwordVisible
                        ? 'fa-solid fa-eye'
                        : 'fa-solid fa-eye-slash'
                    "
                    :key="passwordVisible"
                  />
                </span>
              </div>
            </div>
          </div>
        </section>

        <div class="message error" v-if="message">
          {{ message }}
        </div>

        <div class="button-container">
          <button class="selfie-button" type="submit">
            <span class="camera-icona"
              ><font-awesome-icon icon="fa-solid fa-camera"
            /></span>
            <span class="button-text">Registrami!</span>
          </button>
        </div>

        <div class="login-link">
          Hai già un account? <router-link to="/login">Accedi qui</router-link>
        </div>
      </form>
    </main>
  </section>
</template>

<script>
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCamera,
  faCity,
  faEnvelope,
  faEye,
  faEyeSlash,
  faGlobe,
  faIdCard,
  faLocationDot,
  faLock,
  faSignature,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import axios from "axios";

library.add(
  faEye,
  faEyeSlash,
  faUser,
  faLock,
  faSignature,
  faIdCard,
  faEnvelope,
  faLocationDot,
  faCity,
  faGlobe,
  faCamera
);

export default {
  name: "SignUp",
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      password: "",
      username: "",
      passwordVisible: false,
      email: "",
      name: "",
      surname: "",
      message: "",
    };
  },

  methods: {
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },

    // Funzione per la registrazione tramite richiesta POST
    async signup() {
      try {
        const backendHost = `http://${window.location.hostname}:${window.location.port}`;
        // Invia i dati di registrazione al backend
        const response = await axios.post(`${backendHost}/api/auth/signup`, {
          username: this.username,
          password: this.password,
          email: this.email,
          name: this.name,
          surname: this.surname,
        });
        alert(response.data.message);
        // Reindirizza l'utente alla pagina di login dopo la registrazione
        this.$router.push("/login");
      } catch (error) {
        // Gestione degli errori
        if (error.response) {
          this.message =
            error.response.data.message || "Registrazione fallita. Riprovare.";
        } else {
          this.message = "Errore di connessione. Riprovare più tardi.";
        }
        console.error(error);
      }
    },
  },
};
</script>

<style scoped>
.registrazione-container {
  margin: 3em 40px 3em 40px;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  background-image: linear-gradient(
    135deg,
    /* Angolo della sfumatura, inizia da in alto a sx */
    rgba(190, 244, 252, 0.95),
    rgba(240, 240, 240, 0.9)
  );
  border: none;
  max-width: 80%;
  backdrop-filter: blur(15px);
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

.info-section {
  margin-bottom: 2em;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 1em;
  padding: 1.5em;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.3s ease;
}

.info-section:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-family: "Poppins", sans-serif;
  font-size: 1.3em;
  font-weight: 600;
  color: #1a56a9;
  margin-top: 0;
  margin-bottom: 0.8em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5em;
  padding-bottom: 0.8em; 
  border-bottom: 2px solid #e0e0e0;
}

.form-grid {
  display: flex;
  flex-direction: row;
  gap: 1em;
}

.sezione-sx,
.sezione-dx {
  display: flex;
  flex-direction: column;
  gap: 0.8em;
}

.campo-input {
  position: relative;
}

.campo-input.larghezza {
  grid-column: 1 / -1; /* Occupa tutta la larghezza della griglia */
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.5em;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease; /* Transizione per il focus */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  overflow: hidden; /* Per evitare che il bordo arrotondato venga tagliato */
}

/* Effetto focus per l'input */
.input-container:focus-within {
  border-color: #1a56a9;
  box-shadow: 0 0 0 3px rgba(26, 86, 169, 0.2);
}

.icona {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.8em;
  color: #039bbd;
  font-size: 0.9em;
}

.input-container input,
.input-container select {
  flex: 1; /* Permette all'input di occupare lo spazio rimanente */
  border: none;
  padding: 0.8em 1em 0.8em 0;
  background: transparent;
  font-size: 1em;
  font-family: "Poppins", sans-serif;
  color: #333;
}

.input-container input:focus,
.input-container select:focus {
  outline: none;
}

.input-container label {
  position: absolute;
  pointer-events: none; /* Permette di cliccare sugli input senza bloccare l'etichetta */
  opacity: 0; /* Invisibile */
}

/* Stile wrapper*/

.select-wrapper {
  position: relative;
}

.select-wrapper select {
  appearance: none; /* Rimuove lo stile predefinito del browser */
  cursor: pointer;
}

/* Aggiunge un'icona per il menu a discesa */
.select-wrapper::after {
  content: "▼";
  font-size: 0.9em;
  color: #039bbd;
  position: absolute;
  right: 1em;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.password-wrapper {
  position: relative;
}

.icona-password {
  position: absolute;
  right: 1em;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: #777;
  transition: color 0.3s ease; /* Transizione per il colore al passaggio del mouse */
}

.icona-password:hover {
  color: #1a56a9;
}

/* Messaggi di errore */
.message {
  margin: 1.5em 0;
  animation: fadeIn 0.3s ease; /* Animazione per il messaggio */
  width: 50%;
  margin-left: 25%;
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
  margin: 2em 0 1em;
}

.selfie-button {
  position: relative;
  padding: 0.9em 2em;
  font-size: 1em;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  letter-spacing: 0.5px; /* Spaziatura tra le lettere, altrimenti con weight alti sembrano troppo vicine */
  color: white;
  background: linear-gradient(135deg, #1a56a9 0%, #039bbd 100%);
  border: none;
  border-radius: 5em;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease; /* Transizione per tutti gli stati */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8em;
}

.selfie-button::before {
  content: ""; /* Pseudo-elemento per l'effetto circolare */
  position: absolute;
  top: 50%; /* Centra verticalmente */
  left: 50%; /* Centra orizzontalmente */
  width: 0; /* Inizialmente 0 per l'effetto di espansione */
  height: 0; /* Inizialmente 0 per l'effetto di espansione */
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5em;
  transform: translate(-50%, -50%);
  z-index: 0; /* Mette l'elemento dietro il contenuto del pulsante */
  transition: width 0.6s ease, height 0.6s ease; /* Effetto per l'espansione */
}

/* Effetto per il click */
.selfie-button::after {
  content: ""; /* Pseudo-elemento per l'effetto di pressione */
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgb(135, 235, 237);
  opacity: 0; /* Inizialmente invisibile */
  z-index: 1; /* Mette l'elemento sopra il contenuto del pulsante */
}

/* Effetti per l'icona e il testo */
.selfie-button .camera-icona,
.selfie-button .button-text {
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;
}

.selfie-button:hover {
  transform: translateY(-3px); /* Leggero sollevamento al passaggio del mouse */
  background: linear-gradient(135deg, #2367c0 0%, #04b2d9 100%);
}

.selfie-button:hover::before {
  width: 300px;
  height: 300px;
}

.selfie-button:active::after {
  opacity: 0.3; /* Effetto di pressione al click */
  transition: opacity 0.1s ease;
}

.selfie-button:active {
  transform: translateY(0); /* Rimuove il sollevamento al click */
  transition: transform 0.1s ease;
}

.selfie-button:hover .camera-icona {
  transform: rotateY(180deg); /* Ruota l'icona al passaggio del mouse */
  transition: transform 0.5s ease;
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
  content: ""; /* Pseudo-elemento per la linea sottostante */
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

@media (max-width: 750px) {
  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  .sezione-sx,
  .sezione-dx {
    display: flex;
    flex-direction: column;
    gap: 0.5em; /* Ogni sezione occupa una colonna */
  }

  .registrazione-container {
    margin: 1em 0 1em 0; /* Margine superiore e inferiore */
    min-width: 80%;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
  }

  .content-modulo {
    padding: 1em;
  }

  .info-section {
    padding: 1em;
    margin-bottom: 1em;
  }

  .selfie-button {
    width: 100%;
    padding: 0.9em 0;
    font-size: 1em;
  }

  .button-container {
    margin: 1.5em 0 1em;
  }

  .message {
    width: 90%;
    margin-left: 5%;
  }
}
</style>
