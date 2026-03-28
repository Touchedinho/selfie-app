<template>
  <div class="container-note">
    <h1 id="titolo-note">
      <span class="emoji">📓</span>
      <span id="note-text">Note</span>
      <span class="emoji">📓</span>
    </h1>
    <div id="contenitore_appunti">
      <label for="title-note">Crea o modifica un appunto:</label>
      <input v-model="newNote.titolo" type="text" placeholder="Titolo" class="note" id="title-note" />
      <input v-model="newNote.cat" type="text" placeholder="CATEGORIA" class="note" />
      <textarea v-model="newNote.descr" type="text" placeholder="Appunti..." class="note" id="descrizione-note" />
      <div class="date-container">
        <input v-model="newNote.data_md" type="date" class="note" id="date-note" />
      </div>
      <button @click="addNote" class="button-note">Aggiungi nota</button>
    </div>
    <br/>

    <div>
      <b>Ordina per: </b>
      <select v-model="ordine" class="note">
        <option value="data_md">Data di modifica</option>
        <option value="titolo">Titolo</option>
        <option value="descr">Lunghezza contenuto</option>
      </select>
    </div>
    <br />
  </div>

  <section id="flexNote">
    <article v-for="nota in ordinaNote" :key="nota.id">
      <h3>{{ nota.titolo }}</h3>
      <p>
        <b>Categoria:</b> <i>{{ nota.cat }}</i>
      </p>
      <p v-html="renderMarkdown(nota.descr)"></p>
      <small>Data di creazione: {{ formatDate(nota.data_cr) }}</small><br />
      <small>Ultima modifica: {{ formatDate(nota.data_md) }}</small><br />
      <button @click="copNote(nota.id)" title="Copia il testo della nota nel form, creandone una nuova" class="button-note" >Copia nota</button>
      <button @click="modNote(nota.id)" title="Permette di modificare la nota, inserendo i dati nel form" class="button-note" >Modifica nota</button>
      <button @click="cancNote(nota.id)" title="Cancella completamente la nota" class="button-note">Cancella nota</button>
    </article>

    <p v-if="notes.length === 0">Nessuna nota trovata</p>
  </section>
</template>

<style scoped>
/* Form */
.container-note {
  padding: 0.5em 1em;
  min-width: 320px;
  max-width: 600px;
  margin: 1.5em auto 0 auto;
  border-radius: 1.2em;
  font-family: "Poppins", sans-serif;
  background: linear-gradient(135deg, #5b8df6 0%, #6ee2f5 100%);
  box-shadow: 0 2px 16px 0 rgba(60, 60, 60, 0.08);
}

#contenitore_appunti {
  margin: 1em 0 0 0;
  padding: 1.2em 1em 0.5em 1em;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.4em;
  border-radius: 0.8em;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.07);
  width: 100%;
}

.note {
  border: 1px solid #e3e7ee;
  padding: 0.5em 0.9em;
  margin-bottom: 0.7em;
  border-radius: 0.4em;
  font-family: inherit;
  font-size: 0.98em;
  background: #f6f8fa;
  transition: border 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}
.note:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px #3b82f633;
}

#title-note {
  text-align: left;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 1.08em;
}

#descrizione-note {
  min-height: 6em;
  resize: vertical;
  font-size: 0.98em;
}

.date-container {
  display: flex;
  width: 100%;
}

.button-note {
  padding: 0.5em 1.1em;
  font-size: 0.98em;
  font-weight: 500;
  font-family: inherit;
  color: #fff;
  background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%);
  border: none;
  border-radius: 2em;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;
  margin: 0.3em 0.15em;
  box-shadow: 0 1px 4px 0 rgba(60, 60, 60, 0.07);
}
.button-note:hover {
  background: linear-gradient(90deg, #2563eb 0%, #0ea5e9 100%);
  transform: translateY(-1px) scale(1.01);
}
.button-note:active {
  transform: scale(0.98);
}

#flexNote {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1em;
  padding: 0.5em 0.2em 1.5em 0.2em;
  width: 100%;
}

#flexNote article {
  background: #f6f8fa;
  border-radius: 0.8em;
  padding: 1em 1.1em 0.7em 1.1em;
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.07);
  transition: box-shadow 0.2s, transform 0.2s;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  position: relative;
}
#flexNote article:hover {
  transform: translateY(-2px) scale(1.01);
  box-shadow: 0 4px 16px 0 rgba(60, 60, 60, 0.13);
}
#flexNote h3 {
  font-family: inherit;
  font-size: 1.1em;
  font-weight: 600;
  color: #2563eb;
  margin: 0 0 0.3em 0;
  letter-spacing: 0.01em;
}
#flexNote p {
  flex-grow: 1;
  line-height: 1.5;
  margin: 0.2em 0 0.2em 0;
  font-size: 0.97em;
}
#flexNote small {
  margin-top: 0.5em;
  color: #7b7b7b;
  font-size: 0.89em;
}

div > b {
  font-weight: 600;
  font-size: 1em;
}

/* Titolo */
#titolo-note {
  font-size: 2.1em;
  font-weight: 800;
  letter-spacing: 0.04em;
  margin-bottom: 0.3em;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
}
#note-text {
  background: linear-gradient(90deg, #2563eb 10%, #6ee2f5 90%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  text-shadow: 0 2px 12px #6ee2f555, 0 1px 0 #fff;
  filter: drop-shadow(0 2px 6px #2563eb22);
}
.emoji {
  filter: drop-shadow(0 1px 2px #2563eb33);
}

/* Adattamento per dispositivi mobili */
@media (max-width: 600px) {
  .container-note {
    margin: 0.5em auto;
    padding: 0.3em 0.2em;
    max-width: 80%;
  }
  #flexNote {
    grid-template-columns: 1fr;
    margin: 1em;
    max-width: 80%;
    padding: 0.3em 0.05em 1em 0.05em;
  }
}
</style>

<script>
import { getVirtualTime } from "@/api";
import axios from "axios";
import { marked } from "marked";

export default {
  data() {
    return {
      ordine: "data_md",
      notes: [],
      newNote: {
        autore: "",
        id: -1,
        titolo: "",
        cat: "",
        descr: "",
        data_cr: "",
        data_md: "",
      },
      virtualDate: "",
    };
  },
  methods: {
    async fetchVirtualDate() {
      // Ottieni la data virtuale dal backend (time machine)
      try {
        const timeStr = await getVirtualTime();
        this.virtualDate = timeStr.slice(0, 10); // timeStr è in formato ISO, estraggo solo la parte data (YYYY-MM-DD)
      } catch (e) {
        this.virtualDate = new Date().toISOString().slice(0, 10); // Errore, segno data di sistema
      }
    },
    
    async fetchNotes() {
      try {
        const user = localStorage.getItem("username");
        if (!user) {
          console.error("Username non trovato nel localStorage.");
          return;
        }
        
        const response = await axios.get(`http://site242528.tw.cs.unibo.it/api/note/getAll?autore=${encodeURIComponent(user)}`);
        this.notes = response.data.TutteNote; // Tutte le note trovate nel database
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.notes = []; // Nessuna nota trovata: svuota l'array
        } else {
          console.error("Errore nel recupero delle note:", error); // Altro errore
        }
      }
    },

    async addNote() {
      const autore = localStorage.getItem("username");
      if (!autore) {
        console.error("Username non trovato nel localStorage.");
        return;
      }

      const { titolo, cat, descr, data_md, id } = this.newNote; // Ricavo i dati
      if (!titolo || !cat || !descr || !data_md) {
        alert("Attenzione! Non hai compilato tutti i campi!");
        return;
      }

      try {
        let data_cr;
        let noteId = id;
        if (noteId === -1) {
          data_cr = this.virtualDate; // Nuova nota: data di creazione = data virtuale
          const response = await axios.get(`http://site242528.tw.cs.unibo.it/api/note/getID?autore=${encodeURIComponent(autore)}`);
          noteId = response.data.ID; // Richiedo ID
        } else {
          data_cr = this.newNote.data_cr; // Nota esistente: mantiengo la data di creazione
        }
        
        const dataMdToSend = this.virtualDate;
        await axios.post(`http://site242528.tw.cs.unibo.it/api/note/save`, {
          autore,
          id: noteId,
          titolo,
          cat,
          descr,
          data_cr,
          data_md: dataMdToSend,
        });
        
        // Resetto i campi
        this.newNote = {
          autore: "",
          id: -1,
          titolo: "",
          cat: "",
          descr: "",
          data_cr: "",
          data_md: this.virtualDate,
        };
        this.fetchNotes();
      } catch (err) {
        console.error("Errore nel salvataggio della nota:", err);
      }
    },

    async cancNote(id) {
      try {
        const autore = localStorage.getItem("username");
        if (id == null) {
          console.error("ID non valido.");
          return;
        }
        await axios.post(`http://site242528.tw.cs.unibo.it/api/note/delete`, { autore, id});
        this.fetchNotes();
      } catch (err) {
        console.error("Errore nell'eliminazione della nota:", err);
      }
    },

    copNote(id) {
      const notaCop = this.notes.find((n) => n.id === id);
      if (!notaCop) {
        alert("Nota non trovata.");
        return;
      }
      
      // Quando la nota viene copiata, la data di modifica e creazione è uguale alla data virtuale
      this.newNote = {
        id: -1,
        titolo: notaCop.titolo,
        cat: notaCop.cat,
        descr: notaCop.descr,
        data_cr: this.virtualDate,
        data_md: this.virtualDate,
      };
    },

    modNote(id) {
      const notaMod = this.notes.find((n) => n.id === id);
      if (!notaMod) {
        alert("Nota non trovata.");
        return;
      }
      
      // Quando una nota viene modificata, la "data di modifica" viene aggiornata alla data virtuale
      this.newNote = {
        autore: localStorage.getItem("username"),
        id: notaMod.id,
        titolo: notaMod.titolo,
        cat: notaMod.cat,
        descr: notaMod.descr,
        data_cr: notaMod.data_cr,
        data_md: this.virtualDate,
      };
    },

    renderMarkdown(t) {
      return marked.parse(t); // Per Markdown
    },

    formatDate(data) {
      return new Date(data).toLocaleDateString();
    },
  },

  computed: {
    ordinaNote() {
      let ordinate = [...this.notes];

      switch (this.ordine) {
        case "titolo":
          ordinate.sort((a, b) => a.titolo.localeCompare(b.titolo)); // Ordine alfabetico rispetto i titoli A-Z
          break;
        case "descr":
          ordinate.sort((a, b) => a.descr.length - b.descr.length).reverse(); // Ordine rispetto la lunghezza del testo, da più lungo a più corto
          break;
        default:
          ordinate.sort((a, b) => new Date(b.data_md) - new Date(a.data_md)); // Ordine rispetto la data di modifica più recente
          break;
      }

      return ordinate;
    },
  },

  async mounted() {
    await this.fetchVirtualDate();
    this.newNote.data_md = this.virtualDate; // Imposta la data virtuale della Time Machine come default per il form
    this.fetchNotes();
  },
};
</script>
