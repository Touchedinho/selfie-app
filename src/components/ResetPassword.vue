<template>
  <section class="card-modulo reset-password-container">
    <header class="header-modulo">
      <h1>RESET PASSWORD</h1>
    </header>
    <main class="content-modulo">
      <aside class="password-reset-info">
        <font-awesome-icon icon="fa-solid fa-shield-halved" class="icona-info"/>
        <p>Inserisci la tua nuova password per completare il processo di reset.</p>
      </aside>

      <form @submit.prevent="resetPassword" class="reset-form">
        <div class="input-field">
          <div class="input-wrapper password-wrapper">
            <span class="icona"><font-awesome-icon icon="fa-solid fa-lock"/></span>
            <input :type="passwordVisible ? 'text' : 'password'"  v-model="password" placeholder="Password" required/>
            <label>Nuova Password</label>
            <span class="password-toggle" @click="togglePasswordVisibility">
              <font-awesome-icon :icon="passwordVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'" :key="passwordVisible"/>
            </span>
          </div>
        </div>

        <div class="forza-password" v-if="password">
          <div class="metro-forza-password">
            <div
              class="livello-forza"
              :style="{
                width: passwordStrength + '%',
                backgroundColor: strengthColor,
              }"
            ></div>
          </div>
          <div class="testo-forza" :style="{ color: strengthColor }">
            {{ strengthText }}
          </div>
        </div>

        <section class="requisiti-password">
          <p>La password deve contenere:</p>
          <ul>
            <li :class="{ valid: hasMinLength }">
              <font-awesome-icon :icon="hasMinLength ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"/>
              Almeno 8 caratteri
            </li>
            <li :class="{ valid: hasUpperCase }">
              <font-awesome-icon :icon="hasUpperCase ? 'fa-solid fa-check' : 'fa-solid fa-xmark'"/>
              Almeno una lettera maiuscola
            </li>
            <li :class="{ valid: hasLowerCase }">
              <font-awesome-icon :icon="hasLowerCase ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" />
              Almeno una lettera minuscola
            </li>
            <li :class="{ valid: hasNumber }">
              <font-awesome-icon :icon="hasNumber ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" />
              Almeno un numero
            </li>
          </ul>
        </section>

        <div class="message success" v-if="successMessage">
          {{ successMessage }}
        </div>

        <div class="message error" v-if="errorMessage">
          {{ errorMessage }}
        </div>

        <div class="button-container">
          <button class="selfie-button" type="submit" :disabled="isLoading || !isPasswordValid">
            <span class="icona-camera" v-if="!isLoading">
              <font-awesome-icon icon="fa-solid fa-key" />
            </span>
            <span class="icona-caricamento" v-else>
              <font-awesome-icon icon="fa-solid fa-spinner" spin />
            </span>
            <span class="button-text">{{ isLoading ? "Resetting..." : "Reset Password"}}</span>
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
  faArrowLeft,
  faCheck,
  faEye,
  faEyeSlash,
  faKey,
  faLock,
  faShieldHalved,
  faSpinner,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import axios from "axios";

library.add(
  faLock,
  faEye,
  faEyeSlash,
  faKey,
  faArrowLeft,
  faShieldHalved,
  faSpinner,
  faCheck,
  faXmark
);

export default {
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      password: "",
      passwordVisible: false,
      successMessage: "",
      errorMessage: "",
      isLoading: false,
    };
  },
  computed: {
    // Verifica se la password ha almeno 8 caratteri
    hasMinLength() {
      // Restituisce true se la password è lunga almeno 8 caratteri
      return this.password.length >= 8;
    },
    // Verifica se la password contiene almeno una lettera maiuscola
    hasUpperCase() {
      // Restituisce true se la password contiene almeno una lettera maiuscola
      return /[A-Z]/.test(this.password);
    },
    // Verifica se la password contiene almeno una lettera minuscola
    hasLowerCase() {
      // Restituisce true se la password contiene almeno una lettera minuscola
      return /[a-z]/.test(this.password);
    },
    // Verifica se la password contiene almeno un numero
    hasNumber() {
      // Restituisce true se la password contiene almeno un numero
      return /[0-9]/.test(this.password);
    },
    // Verifica se la password soddisfa tutti i requisiti minimi
    isPasswordValid() {
      // Restituisce true solo se tutti i requisiti sono soddisfatti
      return (
        this.hasMinLength &&
        this.hasUpperCase &&
        this.hasLowerCase &&
        this.hasNumber
      );
    },
    // Calcola la forza della password in percentuale
    passwordStrength() {
      let strength = 0;
      if (this.password.length > 0) {
        // La forza base parte da 20%
        strength = 20;

        // Aggiungi 20% se la password ha almeno 8 caratteri
        if (this.hasMinLength) strength += 20;
        // Aggiungi 10% se contiene almeno una maiuscola
        if (this.hasUpperCase) strength += 10;
        // Aggiungi 10% se contiene almeno una minuscola
        if (this.hasLowerCase) strength += 10;
        // Se contiene un numero e almeno un altro requisito, aggiungi 40%
        if (
          this.hasNumber &&
          (this.hasMinLength || this.hasUpperCase || this.hasLowerCase)
        ) {
          strength += 40; // I numeri contribuiscono maggiormente alla forza
        } else if (this.hasNumber) {
          strength += 10; // Se c'è solo il numero, contribuisce meno
        }
      }
      // Restituisce la percentuale di forza calcolata
      return strength;
    },
    // Restituisce il colore della barra di forza in base alla percentuale
    strengthColor() {
      if (this.passwordStrength < 40) return "#ff4d4d"; // Rosso
      if (this.passwordStrength < 80) return "#ffa64d"; // Arancione
      return "#47d147"; // Verde
    },
    // Restituisce il testo descrittivo della forza della password
    strengthText() {
      if (this.passwordStrength < 40) return "Debole";
      if (this.passwordStrength < 80) return "Media";
      return "Forte";
    },
  },
  methods: {
    // Mostra/nasconde la password nell'input
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    async resetPassword() {
      // Resetta i messaggi di successo e errore
      this.successMessage = "";
      this.errorMessage = "";
      this.isLoading = true;

      // Ottiene il token dalla route
      const token = this.$route.params.token;

      try {
        // Invia la richiesta di reset password al backend
        const backendHost = `http://${window.location.hostname}:${window.location.port}`;
        const response = await axios.post(
          `${backendHost}/api/auth/resetpassword/${token}`,
          { password: this.password }
        );
        this.successMessage =
          response.data.message || "Password resettata con successo!";

        // Reindirizza al login dopo 2 secondi
        setTimeout(() => {
          this.$router.push("/login");
        }, 2000);
      } catch (error) {
        this.errorMessage =
          error.response?.data?.message ||
          "Reset password fallito. Controlla il link di reset o riprova più tardi.";
        console.error(error);
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.reset-password-container {
  max-width: 500px;
  margin: 4em 0 18vh 0; /* Usato vh per non far apparire la pagina bianca dietro */
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

.password-reset-info {
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

.password-reset-info p {
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

.input-field {
  position: relative;
  margin-bottom: 0.8em;
}

.input-wrapper {
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
.input-wrapper:focus-within {
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

.input-wrapper input {
  flex: 1; /* Permette all'input di occupare lo spazio rimanente */
  border: none;
  padding: 0.5em;
  background: transparent;
  font-size: 1em;
  font-family: "Poppins", sans-serif;
  color: #333;
}

.input-wrapper input:focus {
  outline: none;
}

.input-wrapper label {
  position: absolute;
  left: 3.2em;
  color: #999;
  pointer-events: none;
  transform: translateY(0);
  transition: all 0.3s ease;
  font-size: 0.9em;
  opacity: 0;
}

.password-wrapper {
  position: relative;
}

/* Pulsante per mostrare/nascondere la password */
.password-toggle {
  position: absolute;
  right: 1em;
  top: 50%; 
  transform: translateY(-50%);
  cursor: pointer;
  color: #777;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #1a56a9;
}

/* Barra che mostra la forza della password */
.metro-forza-password {
  height: 0.5em; /* Altezza della barra */
  background-color: #e0e0e0; /* Colore di sfondo della barra */
  border-radius: 1em;
  overflow: hidden; /* Nasconde eventuale overflow del contenuto */
}

/* Parte interna colorata della barra */
.livello-forza {
  height: 100%;
  transition: width 0.3s ease, background-color 0.3s ease;
  border-radius: 1em;
}

.testo-forza {
  font-size: 0.9em;
  font-weight: 600;
  text-align: left;
  font-family: "Poppins", sans-serif;
}

/* Stili per il box dei requisiti della password */
.requisiti-password {
  margin-bottom: 1em;
  padding: 1em;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 1em;
  font-family: "Poppins", sans-serif;
}

.requisiti-password p {
  font-weight: 500;
  color: #444;
}

/* Stili per la lista dei requisiti della password */
.requisiti-password ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requisiti-password li {
  display: flex;
  align-items: center;
  gap: 0.5em;
  color: #777;
  margin-bottom: 0.5em;
  font-size: 0.9em;
  transition: color 0.3s ease;
}

/* Colora i requisiti validi di verde */
.requisiti-password li.valid {
  color: #47d147;
}

/* Dimensione icona dei requisiti */
.requisiti-password li svg {
  font-size: 0.8em;
  width: 16px;
}

/* Colora l'icona di verde se il requisito è valido */
.requisiti-password li.valid svg {
  color: #47d147;
}

/* Colora l'icona di rosso se il requisito non è valido */
.requisiti-password li:not(.valid) svg {
  color: #ff4d4d;
}

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

.error {
  background-color: #f8d7da;
  color: #842029;
  border-left: 4px solid #842029;
  border-right: 4px solid #842029;
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
  transition: all 0.3s ease;
  box-shadow: 0 6px 15px rgba(3, 155, 189, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1em;
  min-width: 220px;
}

.selfie-button:disabled {
  opacity: 0.7; /* Opacità ridotta quando non è attivo */
  cursor: not-allowed; /* Cursore non consentito se il pulsante è disabilitato */
  background: linear-gradient(
    135deg,
    #6c757d 0%,
    #6c757d 100%
  ); /* Sfumatura grigia */
  box-shadow: 0 4px 10px rgba(108, 117, 125, 0.3);
}

.selfie-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.1); /* Colore dell'onda */
  border-radius: 50%; /* Forma circolare */
  transform: translate(-50%, -50%); /* Centra l'onda rispetto al pulsante */
  z-index: 0;
  transition: width 0.6s ease, height 0.6s ease; /* Animazione espansione onda */
}

/* Espansione effetto "onda" al passaggio del mouse sul pulsante */
.selfie-button:not(:disabled):hover::before {
  width: 300px;
  height: 300px;
}

/* Effetto hover sul pulsante di invio */
.selfie-button:not(:disabled):hover {
  transform: translateY(-3px); /* Solleva leggermente il pulsante */
  background: linear-gradient(
    135deg,
    #2367c0 0%,
    #04b2d9 100%
  ); /* Sfumatura blu più accesa */
}

/* Effetto al click sul pulsante di invio */
.selfie-button:not(:disabled):active {
  transform: translateY(0); /* Riporta il pulsante alla posizione originale */
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
  content: ""; /* Pseudo-elemento per la linea sottostante */
  position: absolute;
  width: 0; /* Inizialmente 0 per l'effetto di espansione */
  height: 2px; /* Altezza della linea */
  bottom: -3px; /* Posiziona la linea sotto il testo */
  left: 0; /* Allinea a sinistra */
  background-color: #1a56a9;
  transition: width 0.3s ease;
}

.login-link a:hover::after {
  width: 100%;
}

@media (max-width: 600px) {
  .reset-password-container {
    margin: 1.5em 0.5em 8vh 0.5em;
    max-width: 90%;
    border-radius: 10px;
    box-shadow: 0 8px 18px rgba(0,0,0,0.08);
  }
  .header-modulo {
    padding: 1em;
    font-size: 1em;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
  }
  .content-modulo {
    padding: 1em 0.5em;
  }
  .password-reset-info {
    padding: 0.7em;
    font-size: 0.95em;
    flex-direction: column;
    gap: 0.5em;
  }
  .reset-form {
    padding: 1em 0.5em;
  }
  .input-field {
    margin-bottom: 0.5em;
  }
  .requisiti-password {
    padding: 0.7em;
    font-size: 0.95em;
  }
  .button-container {
    margin: 1em 0 0.7em 0;
  }
  .login-link {
    margin-top: 1em;
    font-size: 0.98em;
  }
}
</style>
