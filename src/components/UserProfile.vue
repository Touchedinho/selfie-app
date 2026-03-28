<template>
  <section class="container-profilo-utente">
    <article class="card-modulo">
      <header class="header-modulo">
        <h1>Profilo Utente</h1>
      </header>

      <main class="content-modulo">
        <section class="sezione-immagine-profilo">
          <div class="immagine" @click="apriImmagine">
            <img v-if="profileImage" :src="profileImage" alt="Immagine profilo" class="immagine-profilo" />
            <div v-else class="no-image">
              <span>{{ getInitials() }}</span>
            </div>
            <div class="overlay-immagine">
              <div class="lente-ingrandimento">
                <font-awesome-icon icon="magnifying-glass" />
              </div>
            </div>
          </div>

          <section class="caricamento-immagine">
            <h3>Cambia immagine del profilo</h3>

            <div class="opzioni-caricamento">
              <input type="file" ref="fileInput" @change="handleFileChange" accept="image/jpeg,image/png,image/gif" class="file-input" />

              <button @click="triggerFileInput" class="upload-btn">
                <span class="btn-icon">+</span>
                Seleziona
              </button>

              <button @click="caricaImmagine" :disabled="!selectedFile" class="save-btn" >
                <span class="btn-icon">✓</span>
                Salva
              </button>
            </div>

            <div v-if="message" :class="['message', messageType]">
              {{ message }}
            </div>
          </section>
        </section>

        <section class="user-info">
          <h3>Informazioni Personali</h3>

          <div class="info-grid">
            <div class="info-item">
              <div class="label">Nome</div>
              <div class="value">{{ userData.name }}</div>
            </div>

            <div class="info-item">
              <div class="label">Cognome</div>
              <div class="value">{{ userData.surname }}</div>
            </div>

            <div class="info-item">
              <div class="label">Username</div>
              <div class="value-container">
                <div class="value">{{ userData.username }}</div>
                <button @click="startEdit('username')" class="edit-btn">
                  <font-awesome-icon icon="pen" />
                </button>
              </div>
            </div>

            <div class="info-item">
              <div class="label">Email</div>
              <div class="value-container">
                <div class="value">{{ userData.email }}</div>
                <button @click="startEdit('email')" class="edit-btn">
                  <font-awesome-icon icon="pen" />
                </button>
              </div>
            </div>

            <div class="info-item">
              <div class="label">Account creato</div>
              <div class="value">{{ formatDate(userData.createdAt) }}</div>
            </div>
          </div>
        </section>
      </main>
    </article>
    <div v-if="immagineAperta" class="lightbox" @click="chiudiImmagine">
      <div class="lightbox-content">
        <img
          :src="profileImage"
          alt="Immagine profilo"
          class="immagine-lightbox"
          @click.stop
        />
        <button @click="chiudiImmagine" class="chiudi-lightbox">×</button>
      </div>
    </div>
    <div v-if="editModalOpen" class="edit-modal">
      <div class="edit-modal-content" @click.stop>
        <h3>Modifica {{ editField === "username" ? "Username" : "Email" }}</h3>

        <div class="edit-form">
          <input
            v-model="editValue"
            :placeholder="
              editField === 'username' ? 'Nuovo username' : 'Nuova email'
            "
            class="edit-input"
            :type="editField === 'email' ? 'email' : 'text'"
          />

          <div v-if="editError" class="edit-error">{{ editError }}</div>

          <div class="edit-buttons">
            <button @click="cancelEdit" class="cancel-btn">Annulla</button>
            <button
              @click="saveEdit"
              class="conferma-btn"
              :disabled="!isValidEdit"
            >
              Salva
            </button>
          </div>
        </div>
      </div>
      <div class="edit-modal-backdrop" @click="cancelEdit"></div>
    </div>
  </section>
</template>

<script>
import "@/style/ModuleStyle.css";
import { getToken } from "@/utils/auth";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faMagnifyingGlass, faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import axios from "axios";

library.add(faMagnifyingGlass, faPen);

export default {
  name: "UserProfile",
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      userData: {
        username: "",
        name: "",
        surname: "",
        email: "",
        createdAt: null,
      },
      profileImage: null,
      selectedFile: null,
      message: "",
      messageType: "",
      currentDate: "",
      immagineAperta: false,

      // Per edit del profilo
      editModalOpen: false,
      editField: null,
      editValue: "",
      editError: "",
    };
  },

  // Computed property per la validazione del campo in modifica (username/email)
  computed: {
    // Restituisce true se il valore inserito è valido per il campo selezionato
    isValidEdit() {
      // Controlla che il campo non sia vuoto o solo spazi
      if (!this.editValue.trim()) return false;

      // Se si sta modificando l'email, valida il formato con una regex
      if (this.editField === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(this.editValue);
      }

      // Per altri campi (es. username), basta che non sia vuoto
      return true;
    },
  },

  mounted() {
    this.fetchUserProfile();
    // Aggiungi listener per la tastiera: ESC chiude la lightbox
    document.addEventListener("keydown", this.handleEscape);
  },
  beforeUnmount() {
    // Rimuovi il listener dell'evento quando il componente viene distrutto
    document.removeEventListener("keydown", this.handleEscape);
  },

  methods: {
    /**
     * Avvia la modalità di modifica per un campo specifico del profilo utente.
     * Imposta il campo da modificare, il valore corrente, e apre il modal di modifica.
     * Inoltre, previene lo scrolling della pagina mentre il modal è aperto.
     *
     * @param {string} field - Il nome del campo del profilo utente da modificare.
     */
    startEdit(field) {
      this.editField = field;
      this.editValue = this.userData[field];
      this.editError = "";
      this.editModalOpen = true;
      // Impedisci lo scorrimento della pagina quando il modal è aperto
      document.body.style.overflow = "hidden";
    },

    /**
     * Chiude il modal di modifica e resetta i campi di modifica.
     * Ripristina lo scrolling della pagina.
     */
    cancelEdit() {
      this.editModalOpen = false;
      this.editField = null;
      this.editValue = "";
      this.editError = "";
      // Ripristina lo scorrimento della pagina
      document.body.style.overflow = "";
    },

    /**
     * Salva le modifiche apportate al campo in modifica (username o email).
     * Effettua una richiesta PUT al backend per aggiornare il profilo utente.
     * Mostra un messaggio di successo o errore a seconda dell'esito della richiesta.
     */
    async saveEdit() {
      // Se il campo non è valido, non procedere
      if (!this.isValidEdit) return;

      try {
        // Ottieni il token di autenticazione
        const token = getToken();
        // Costruisci l'endpoint in base al campo da modificare
        const backendHost = `http://${window.location.hostname}:${window.location.port}`;
        const endpoint =
          this.editField === "username"
            ? `${backendHost}/api/auth/update-username`
            : `${backendHost}/api/auth/update-email`;

        // Prepara il payload per la richiesta PUT
        const payload = {};
        payload[this.editField] = this.editValue;

        // Effettua la richiesta PUT per aggiornare il profilo utente
        await axios.put(endpoint, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Aggiorna i dati utente localmente
        this.userData[this.editField] = this.editValue;

        // Aggiorna il localStorage se necessario
        if (this.editField === "username") {
          localStorage.setItem("username", this.editValue);
        } else if (this.editField === "email") {
          localStorage.setItem("email", this.editValue);
        }

        // Mostra un messaggio di successo
        this.showMessage(
          `${
            this.editField === "username" ? "Username" : "Email"
          } aggiornato con successo`,
          "success"
        );
        // Chiude il modal di modifica
        this.cancelEdit();
      } catch (error) {
        console.error(`Error updating ${this.editField}:`, error);

        if (error.response && error.response.data.message) {
          this.editError = error.response.data.message;
        } else {
          this.editError = `Errore durante l'aggiornamento del${
            this.editField === "username" ? "lo username" : "l'email"
          }`;
        }
      }
    },

    /**
     * Apre la lightbox per visualizzare l'immagine del profilo.
     * Impedisce lo scorrimento della pagina quando la lightbox è aperta.
     */
    apriImmagine() {
      if (this.profileImage) {
        this.immagineAperta = true;
        // Impedisci lo scorrimento quando la lightbox è aperta
        document.body.style.overflow = "hidden";
      }
    },

    /**
     * Chiude la lightbox e ripristina lo scorrimento della pagina.
     */
    chiudiImmagine() {
      this.immagineAperta = false;
      // Riabilita lo scorrimento
      document.body.style.overflow = "";
    },

    /**
     * Gestisce l'evento di pressione dei tasti per chiudere la lightbox con ESC.
     * @param {KeyboardEvent} e - L'evento della tastiera.
     */
    handleEscape(e) {
      // Chiudi la lightbox quando viene premuto il tasto ESC
      if (e.key === "Escape" && this.immagineAperta) {
        this.chiudiImmagine();
      }
    },

    /**
     * Formatta la stringa della data in un formato più leggibile.
     * @param {string} dateString - La stringa della data da formattare.
     * @returns {string} - Stringa della data formattata.
     */
    formatDate(dateString) {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },

    /**
     * Recupera il profilo utente dal backend e aggiorna i dati del componente.
     * Gestisce eventuali errori durante il recupero dei dati.
     */
    async fetchUserProfile() {
      try {
        const token = getToken();
        const backendHost = `http://${window.location.hostname}:${window.location.port}`;
        const response = await axios.get(`${backendHost}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Aggiorna i dati utente e l'immagine del profilo
        this.userData = response.data;
        this.profileImage = response.data.profileImage;
      } catch (error) {
        console.error("Errore durante il recupero del profilo utente:", error);
        this.showMessage("Errore nel caricamento del profilo utente", "error");
      }
    },

    /**
     * Attiva un evento di click sull'elemento file input nascosto.
     * Utile per aprire la finestra di selezione file quando si clicca su un pulsante personalizzato,
     * invece dell'interfaccia predefinita dell'input file.
     */
    triggerFileInput() {
      this.$refs.fileInput.click();
    },

    /**
     * Gestisce il cambiamento del file selezionato dall'input file.
     * Controlla le dimensioni e il tipo del file, e aggiorna l'immagine del profilo.
     * Mostra messaggi di errore se il file non è valido.
     * @param {Event} event - L'evento di cambiamento dell'input file.
     */
    handleFileChange(event) {
      try {
        const file = event.target.files[0];
        if (!file) return;

        // Mostra informazioni sul file per il debug
        this.debugInfo = `File selezionato: ${file.name}\nTipo: ${
          file.type
        }\nDimensione: ${Math.round(file.size / 1024)} KB`;

        if (file.size > 5 * 1024 * 1024) {
          this.showMessage("L'immagine deve essere inferiore a 5MB", "error");
          this.$refs.fileInput.value = "";
          return;
        }

        // Accetta solo JPG, PNG, GIF
        const validTypes = ["image/jpeg", "image/png", "image/gif"];
        if (!validTypes.includes(file.type)) {
          this.showMessage(
            "Formato file non supportato. Usa JPG, PNG o GIF",
            "error"
          );
          this.$refs.fileInput.value = "";
          return;
        }

        this.selectedFile = file;

        // Leggi il file come Data URL per visualizzarlo
        const reader = new FileReader();
        // Imposta il profiloImage con il risultato della lettura
        reader.onload = (e) => {
          this.profileImage = e.target.result;
        };
        // Gestione degli errori di lettura del file
        reader.onerror = (e) => {
          this.showMessage("Errore nella lettura del file", "error");
          this.debugInfo = `Reader error: ${e.target.error}`;
        };
        // Inizia la lettura del file
        reader.readAsDataURL(file);
      } catch (error) {
        this.showMessage("Errore nella selezione del file", "error");
        this.debugError(error);
      }
    },

    /**
     * Carica l'immagine del profilo selezionata sul server.
     * Invia una richiesta PUT al backend con l'immagine come payload.
     * Mostra un messaggio di successo o errore a seconda dell'esito della richiesta.
     */
    async caricaImmagine() {
      if (!this.profileImage) return;

      try {
        const token = getToken();
        const backendHost = `http://${window.location.hostname}:${window.location.port}`;
        await axios.put(
          `${backendHost}/api/auth/update-profile-image`,
          { profileImage: this.profileImage },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Dopo il caricamento, aggiorna i dati utente dal backend
        await this.fetchUserProfile();

        // Resetta il file selezionato e l'input file
        this.selectedFile = null;
        this.$refs.fileInput.value = "";
        // Mostra un messaggio di successo
        this.showMessage(
          "Immagine del profilo aggiornata con successo",
          "success"
        );
      } catch (error) {
        console.error(
          "Errore durante il caricamento dell'immagine del profilo:",
          error
        );
        this.showMessage("Errore nel caricamento dell'immagine", "error");
      }
    },

    debugError(error) {
      if (error.response) {
        // Il server ha risposto con un errore
        this.debugInfo = `Stato: ${
          error.response.status
        }\nDati: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        // Nessuna risposta ricevuta dal server
        this.debugInfo = `Nessuna risposta dal server. Verifica che il server sia in esecuzione.`;
      } else {
        // Errore nella configurazione della richiesta
        this.debugInfo = `Errore: ${error.message}`;
      }
    },

    /**
     * Mostra un messaggio di feedback all'utente.
     * Il messaggio scompare dopo 5 secondi.
     * @param {string} msg - Il messaggio da mostrare.
     * @param {string} type - Il tipo di messaggio ('success', 'error').
     */
    showMessage(msg, type) {
      this.message = msg;
      this.messageType = type;
      setTimeout(() => {
        if (this.message === msg) {
          this.message = "";
        }
      }, 5000);
    },

    /**
     * Restituisce le iniziali dell'utente per visualizzarle nell'immagine del profilo.
     * Se non sono disponibili nome e cognome, usa l'username.
     * @returns {string} - Le iniziali dell'utente.
     */
    getInitials() {
      // Se sono disponibili nome e cognome, usa le loro iniziali
      if (this.userData.name && this.userData.surname) {
        return `${this.userData.name.charAt(0)}${this.userData.surname.charAt(
          0
        )}`;
      }
      // Altrimenti, usa l'username
      return this.userData.username
        ? this.userData.username.charAt(0).toUpperCase()
        : null;
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap");

/* Stili generali per il profilo utente */

/* Contenitore principale del profilo utente */
.container-profilo-utente {
  min-width: 40%;
  margin: 0 auto;
  padding: 1em;
  font-family: "Poppins", sans-serif;
  color: #2c3e50;
}

/* Titolo della sezione profilo utente */
.header-modulo h1 {
  margin: 0;
  font-size: 1.8em;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Sezione che contiene l'immagine del profilo e le opzioni di caricamento */
.sezione-immagine-profilo {
  display: flex;
  margin-bottom: 1em;
  gap: 1em;
  align-items: center;
}

/* Contenitore dell'immagine del profilo, rende l'immagine cliccabile e aggiunge transizione */
.immagine {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

/* Effetto di ingrandimento quando si passa il mouse sopra l'immagine del profilo */
.immagine:hover {
  transform: scale(1.05);
}

/* Mostra l'overlay (lente d'ingrandimento) quando si passa il mouse sopra l'immagine */
.immagine:hover .overlay-immagine {
  opacity: 1;
}

/* Overlay che appare sopra l'immagine del profilo quando si passa il mouse.
  Mostra uno sfondo semitrasparente e la lente d'ingrandimento centrata.
  L'overlay è invisibile (opacity: 0) finché non si effettua l'hover sull'immagine. */
.overlay-immagine {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  opacity: 0; /* Invisibile di default */
  transition: opacity 0.3s ease; /* Transizione quando appare */
}

/* Stile per l'icona della lente d'ingrandimento che appare sull'immagine del profilo quando si passa il mouse sopra.
  Rende l'icona circolare, con sfondo chiaro e centrata all'interno dell'overlay. */
.lente-ingrandimento {
  background-color: rgb(227, 226, 226);
  transition: opacity 0.2s ease;
  border-radius: 50%;
  padding: 0.5em;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 
  Stili condivisi per l'immagine del profilo e il placeholder senza immagine.
  - Dimensione fissa 160x160px
  - Forma circolare (border-radius: 50%)
  - Centra il contenuto sia verticalmente che orizzontalmente
  - Ombra leggera e bordo bianco per risalto
*/
.immagine-profilo,
.no-image {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  overflow: hidden; /* Nasconde eventuali overflow */
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  border: 4px solid white;
}

/* 
  Stile per l'immagine del profilo vera e propria:
  - object-fit: cover assicura che l'immagine riempia il contenitore circolare senza deformarsi,
    ritagliando l'immagine se necessario per mantenere le proporzioni.
*/
.immagine-profilo {
  object-fit: cover;
}

/* 
  Stile per il placeholder quando non è presente un'immagine del profilo.
  - Sfondo con gradiente blu
  - Testo bianco, grande e in grassetto per mostrare le iniziali dell'utente
*/
.no-image {
  background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
  color: white;
  font-size: 52px;
  font-weight: bold;
}

/* 
  Contenitore delle opzioni di caricamento dell'immagine del profilo.
  - Occupa tutto lo spazio disponibile accanto all'immagine
*/
.caricamento-immagine {
  flex: 1;
}

/* 
  Titolo della sezione di caricamento immagine profilo.
  - Colore blu e dimensione maggiore per evidenziare il titolo
*/
.caricamento-immagine h3 {
  color: #3a7bd5;
  font-size: 1.3em;
}

/* 
  Contenitore delle opzioni di caricamento (input file, pulsanti).
  - Disposizione orizzontale con gap tra gli elementi
  - Margine per separazione dal resto della sezione
*/
.opzioni-caricamento {
  display: flex;
  justify-content: center;
  gap: 1em;
  margin: 1em;
}

/* 
  Nasconde l'input file predefinito per permettere l'uso di un pulsante personalizzato.
  L'input rimane accessibile tramite ref e triggerFileInput().
*/
.file-input {
  display: none;
}

/* 
  Pulsanti di caricamento immagine.
  - Padding, bordi arrotondati e cursore puntatore per indicare che sono cliccabili
  - Font grassetto e dimensione uniforme
  - Gap tra l'icona e il testo per una migliore leggibilità
*/
button {
  padding: 0.8em 1.3em;
  border: none;
  border-radius: 1em;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 0.5em; /* Spazio tra l'icona e il testo */
  transition: all 0.2s ease;
}

/* 
  Stile per l'icona all'interno dei pulsanti (ad esempio "+" o "✓").
  - Grassetto e dimensione maggiore per evidenziare l'icona rispetto al testo.
*/
.btn-icon {
  font-weight: bold;
  font-size: 16px;
}

/* 
  Stile per il pulsante di upload ("Seleziona").
  - Sfondo grigio chiaro, testo scuro, bordo sottile.
  - Cambia colore in hover (vedi .upload-btn:hover più sotto).
*/
.upload-btn {
  background-color: #e9ecef;
  color: #495057;
  border: 2px solid #ced4da;
}

.upload-btn:hover {
  background-color: #dee2e6;
}

/* 
  Stile per il pulsante "Salva" dell'immagine del profilo.
  - Sfondo con gradiente blu
  - Testo bianco
*/
.save-btn {
  background: linear-gradient(135deg, #3a7bd5 0%, #00d2ff 100%);
  color: white;
}

/* 
  Effetto hover per il pulsante "Salva".
  - Aggiunge ombra e un leggero sollevamento
*/
.save-btn:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.save-btn:active {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(0);
}

/* 
  Stile per il pulsante "Salva" quando è disabilitato:
  - Sfondo con gradiente grigio/azzurro per indicare lo stato inattivo
  - Cursore "not-allowed" per mostrare che non è cliccabile
  - Nessuna trasformazione o ombra per aspetto piatto
*/
.save-btn:disabled {
  background: linear-gradient(135deg, #a8c0df 0%, #b8e7f0 100%);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Stile per l'icona di edit */

.user-info {
  width: 100%;
}

.info-item {
  width: 100%;
}

.info-grid {
  gap: 1em;
  margin: 0.6em;
}

/* Contenitore principale del profilo utente */
.value-container {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

/* 
  .edit-btn:
  - Rimuove lo sfondo e il bordo predefiniti per un aspetto pulito.
  - Aggiunge padding e rende il pulsante circolare con border-radius: 50%.
  - Usa flexbox per centrare il contenuto (come le icone) sia verticalmente che orizzontalmente.
  - Cambia il cursore in pointer per indicare l'interattività.
  - Aggiunge un effetto di transizione fluido per tutte le proprietà.
*/
.edit-btn {
  position: relative;
  background: none;
  border: none;
  color: #3269b7;
  font-size: 13px;
  padding: 0.8em;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: #e9ecef;
  color: rgb(57, 132, 199);
  animation: upDown 0.3s;
}

@keyframes upDown {
  0% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-3px);
  }
  100% {
    transform: translateY(0);
  }
}

/* Stile per il modale di edit */

/* 
  Modale di modifica (edit-modal):
  - Posizionato in modo fisso per coprire l'intera viewport
  - Centra il contenuto del modale sia verticalmente che orizzontalmente
  - z-index elevato per stare sopra altri elementi
  - Usa animazione di fade-in per apparire in modo fluido
*/
.edit-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
  animation: fadeInModal 0.25s ease;
}

/* 
  .edit-modal-backdrop:
  - Crea uno sfondo sfocato e semitrasparente dietro il modale di modifica.
  - Copre l'intera viewport (width/height 100vw/100vh).
  - Usa backdrop-filter per l'effetto blur.
  - z-index: 1 per posizionarsi sotto il contenuto del modale.
  - L'animazione fadeInModal rende la comparsa più fluida.
*/
.edit-modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(30, 50, 90, 0.36);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1;
  animation: fadeInModal 0.3s;
}

/* 
  .edit-modal-content:
  - Sfondo azzurro-bianco semitrasparente.
  - Larghezza massima 400px, ma si adatta fino al 92% della viewport su schermi piccoli.
  - Posizione relativa e z-index alto per stare sopra lo sfondo sfocato.
  - Ombra per effetto "sollevato".
  - Animazione di pop-in per apparizione fluida.
  - Bordo sottile azzurro molto trasparente.
  - overflow: hidden per evitare che il contenuto esca dai bordi arrotondati.
*/
.edit-modal-content {
  background: linear-gradient(
    120deg,
    rgba(200, 230, 255, 0.88) 0%,
    rgba(255, 255, 255, 0.92) 100%
  );
  border-radius: 1em;
  padding: 2em;
  width: 92%;
  max-width: 400px;
  position: relative;
  z-index: 2;
  box-shadow: 0 16px 40px 0 rgba(28, 58, 110, 0.22),
    0 3px 12px 0 rgba(55, 135, 255, 0.13);
  animation: modalPopIn 0.32s cubic-bezier(0.29, 1.35, 0.46, 1.11);
  border: 1px solid rgba(70, 138, 255, 0.11);
  overflow: hidden;
}

/* 
  Stile per il titolo del modale di modifica:
  - Nessun margine superiore per allineamento con il contenuto
  - Colore blu principale per evidenziare il titolo
  - Dimensione del font maggiore e grassetto per importanza
  - Effetto gradiente blu sul testo tramite background-clip e text-fill-color trasparente
  - Margine inferiore per separazione dal form di modifica
*/
.edit-modal-content h3 {
  margin-top: 0;
  color: #2076d2;
  font-size: 1.25rem;
  letter-spacing: 0.2px;
  font-weight: 700;
  background: linear-gradient(90deg, #3a7bd5 30%, #00d2ff 95%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1em;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1em;
  margin-top: 0;
}

/* 
  .edit-input:
  - Bordo azzurro chiaro e arrotondato.
  - Font leggermente.
  - Sfondo bianco-azzurro semitrasparente.
  - Transizione fluida su bordo e ombra al focus.
  - Leggera ombra per effetto "sollevato".
*/
.edit-input {
  padding: 0.5em;
  border: 2px solid #e4f0fc;
  border-radius: 0.5em;
  font-size: 1em;
  background: rgba(245, 250, 255, 0.93);
  transition: border-color 0.22s, box-shadow 0.22s;
  box-shadow: 0 2px 8px rgba(50, 170, 255, 0.04);
}

/* 
  .edit-input:focus:
  - Cambia il colore del bordo in blu quando l'input è attivo (focus)
  - Aggiunge un'ombra azzurra per evidenziare il campo selezionato
  - Rimuove l'outline predefinito del browser
*/
.edit-input:focus {
  border-color: #3a7bd5;
  box-shadow: 0 0 0 3px rgba(55, 135, 255, 0.13);
  outline: none;
}

.edit-error {
  font-size: 1em;
  padding: 0.5em;
  border-radius: 0.5em;
  background-color: #f8d7da;
  color: #842029;
  border-left: 4px solid #842029;
  border-right: 4px solid #842029;
}

.edit-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5em;
  margin-top: 5px;
}

/* 
  .cancel-btn:
  - Testo blu per coerenza con il tema
  - Bordo azzurro chiaro e arrotondato
  - Font grassetto
  - Transizione fluida su sfondo, colore e bordo
  - Nessuna ombra per aspetto piatto
*/
.cancel-btn {
  background-color: #e5f2fc;
  color: #2279c8;
  border: 2px solid #c5e2fa;
  border-radius: 0.5em;
  font-weight: 600;
  transition: background 0.18s, color 0.18s, border 0.18s;
  box-shadow: none;
}

/* 
  .cancel-btn:hover:
  - Cambia il colore di sfondo in un azzurro più chiaro
  - Cambia il colore del testo in blu più scuro
  - Cambia il colore del bordo in azzurro più acceso
*/
.cancel-btn:hover {
  background: #f3fbff;
  color: #085eae;
  border-color: #7ed7f6;
}

.cancel-btn:active {
  background: rgb(240, 108, 108);
  color: white;
  border-color: #c5e2fa;
}

/* 
  .conferma-btn:
  - Sfondo con gradiente blu.
  - Testo bianco, bordo arrotondato e nessun bordo visibile.
  - Ombra leggera per effetto "sollevato".
  - Transizione fluida su ombra e trasformazione per hover.
*/
.conferma-btn {
  background: linear-gradient(90deg, #3a7bd5 0%, #00d2ff 90%);
  color: white;
  border-radius: 0.5em;
  border: none;
  font-weight: 600;
  box-shadow: 0 2px 8px 0 rgba(0, 210, 255, 0.08);
  transition: box-shadow 0.19s, transform 0.19s;
}

/* 
  .conferma-btn:hover:
  - Aggiunge un'ombra più intensa e un leggero sollevamento.
*/
.conferma-btn:hover {
  box-shadow: 0 6px 18px rgba(60, 170, 255, 0.23);
  transform: translateY(-2px);
}

.conferma-btn:active {
  box-shadow: 0 4px 12px rgba(60, 170, 255, 0.18);
  transform: translateY(0);
}

/* 
  .conferma-btn:disabled:
  - Cambia il colore di sfondo e testo per indicare che il pulsante è disabilitato.
  - Disabilita ombra e trasformazioni per un aspetto piatto e inattivo.
  - Cambia il cursore in "not-allowed" per chiarezza.
*/
.conferma-btn:disabled {
  background: linear-gradient(90deg, #a8c0df 0%, #b8e7f0 100%);
  color: #edf4fb;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

@keyframes fadeInModal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes modalPopIn {
  0% {
    transform: translateY(32px);
    opacity: 0;
  }
  60% {
    transform: translateY(-6px);
    opacity: 0.95;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Stile del lightbox */

/* 
  .lightbox:
  - Posiziona il lightbox in modo fisso per coprire l'intera viewport.
  - Sfondo nero semitrasparente per oscurare il contenuto sottostante.
  - Centra il contenuto del lightbox sia verticalmente che orizzontalmente.
  - z-index elevato per stare sopra tutti gli altri elementi.
  - Animazione di fade-in per una comparsa fluida.
*/
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(
    0,
    0,
    0,
    0.85
  ); /* Sfondo nero semitrasparente (opacity a 0.85) */
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000; /* Assicura che il lightbox sia sopra altri contenuti */
  animation: fadeIn 0.3s ease;
}

/*
  .lightbox-content:
  - position: relative per posizionare il pulsante di chiusura in modo assoluto rispetto a questo contenitore.
  - max-width e max-height al 90% per garantire che il contenuto non esca dalla viewport, anche su schermi piccoli.
*/
.lightbox-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

/* 
  .immagine-lightbox:
  - Visualizza l'immagine del profilo ingrandita all'interno del lightbox.
  - max-width: 100% assicura che l'immagine non superi la larghezza del contenitore.
  - max-height: 90vh limita l'altezza al 90% della viewport per evitare overflow verticale.
  - border-radius: arrotonda leggermente i bordi dell'immagine.
  - animation: zoomIn crea un effetto di ingrandimento quando l'immagine appare.
*/
.immagine-lightbox {
  max-width: 100%;
  max-height: 90vh;
  border-radius: 0.5em;
  animation: zoomIn 0.3s ease;
}

/* 
  .chiudi-lightbox:
  - Sfondo trasparente e nessun bordo.
  - Colore bianco e dimensione grande per essere ben visibile sull'immagine.
  - Transizione fluida sulla trasformazione (rotazione).
*/
.chiudi-lightbox {
  position: absolute;
  top: -20px;
  right: 0px;
  background: none;
  border: none;
  color: white;
  font-size: 40px;
  cursor: pointer;
  padding: 0.4em;
  transition: transform 0.2s ease;
}

/* 
  .chiudi-lightbox:hover:
  - Ruota il pulsante di chiusura di 90 gradi quando si passa il mouse sopra,
    per un effetto visivo interattivo.
*/
.chiudi-lightbox:hover {
  transform: rotate(90deg);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Stili per la visualizzazione delle informazioni utente */

.label {
  font-size: 0.9em;
  color: #6c757d;
  margin-bottom: 5px;
}

.value {
  font-size: 1em;
  font-weight: 500;
  color: #212529;
}

@media (max-width: 700px) {
  .sezione-immagine-profilo {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .header-profilo {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .opzioni-caricamento {
    justify-content: center;
  }

  .chiudi-lightbox {
    top: -20px;
    right: 0px;
    padding: 10px;
  }
}
</style>
