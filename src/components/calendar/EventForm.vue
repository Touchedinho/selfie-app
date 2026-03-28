<template>
  <div class="event-form-container">
    <form class="event-form" @submit.prevent="onSubmit">
      <h2 class="form-title">
        {{ editIndex === null ? "Nuovo evento" : "Modifica evento" }}
      </h2>

      <div class="form-group">
        <label for="event-title">Titolo</label>
        <input id="event-title" v-model="form.title" required class="form-control" placeholder="Titolo dell'evento"/>
      </div>

      <div class="form-group">
        <label for="event-description">Descrizione</label>
        <textarea id="event-description" v-model="form.description" class="form-control" placeholder="Descrivi il tuo evento" rows="3" />
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-container">
          <input type="checkbox" v-model="form.allDay" />
          <span class="checkmark"></span>
          Tutto il giorno
        </label>
      </div>

      <!-- se NON è tutto il giorno, mostra selettori orari -->
      <div v-if="!form.allDay" class="time-selectors">
        <div class="form-group">
          <label>Inizio</label>
          <div class="time-input-group">
            <select v-model.number="form.startHour" class="time-select">
              <option v-for="h in 24" :key="`start-h-${h}`" :value="h - 1">{{ (h - 1).toString().padStart(2, "0") }}</option>
            </select>
            <span class="time-separator">:</span>
            <select v-model.number="form.startMinute" class="time-select">
              <option v-for="m in 12" :key="`start-m-${m}`" :value="(m - 1) * 5">{{ ((m - 1) * 5).toString().padStart(2, "0") }}</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Fine</label>
          <div class="time-input-group">
            <select v-model.number="form.endHour" class="time-select">
              <option v-for="h in 24" :key="`end-h-${h}`" :value="h - 1">{{ (h - 1).toString().padStart(2, "0") }}</option>
            </select>
            <span class="time-separator">:</span>
            <select v-model.number="form.endMinute" class="time-select">
              <option v-for="m in 12" :key="`end-m-${m}`" :value="(m - 1) * 5">{{ ((m - 1) * 5).toString().padStart(2, "0") }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label for="event-location">Posizione evento</label>
        <div class="location-search-group">
          <input id="event-location" v-model="searchQuery" @input="searchLocation" class="form-control" placeholder="Cerca luogo o indirizzo..." autocomplete="off" />
          <ul v-if="searchResults.length" class="search-results search-results-above">
            <li v-for="result in searchResults" :key="result.place_id" @click="selectLocation(result)">{{ result.display_name }} </li>
          </ul>
        </div>
      </div>

      <!-- mappa interattiva per scegliere latitudine/longitudine -->
      <div id="map" class="event-map"></div>
      <div v-if="form.latitude && form.longitude" class="coords">
        <i class="location-icon">📍</i> {{ form.latitude.toFixed(5) }}, {{ form.longitude.toFixed(5) }}
      </div>

      <div class="form-group checkbox-group">
        <label class="checkbox-container">
          <input type="checkbox" v-model="form.repeat" />
          <span class="checkmark"></span>
          Evento ripetuto
        </label>
      </div>

      <div v-if="form.repeat" class="repeat-options">
        <div class="form-group">
          <label for="repeat-frequency">Frequenza</label>
          <select id="repeat-frequency" v-model="form.repeatFrequency" class="form-control">
            <option value="weekly">Settimanale</option>
            <option value="monthly">Mensile</option>
            <option value="yearly">Annuale</option>
          </select>
        </div>

        <div class="form-group">
          <label for="repeat-duration">Durata</label>
          <select id="repeat-duration" v-model="form.repeatDuration" class="form-control">
            <option value="1">1 mese</option>
            <option value="6">6 mesi</option>
            <option value="12">1 anno</option>
            <option value="24">2 anni</option>
            <option value="forever">Per sempre</option>
          </select>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" class="btn btn-cancel" @click="$emit('cancel')">
          Annulla
        </button>
        <button type="submit" class="btn btn-save">Salva</button>
      </div>
    </form>

    <!-- se l'evento è ricorrente, consente di scegliere se modificare solo uno o più -->
    <div v-if="form.repeatId" class="repeat-edit-mode">
      <div class="repeat-edit-header">
        <span class="repeat-icon">🔄</span>
        <strong>Modifica evento ricorrente</strong>
      </div>

      <div class="radio-group">
        <label class="radio-container">
          <input type="radio" value="this" v-model="repeatEditMode" />
          <span class="radio-checkmark"></span>
          Solo questo evento
        </label>

        <label class="radio-container">
          <input type="radio" value="all" v-model="repeatEditMode" />
          <span class="radio-checkmark"></span>
          Tutti gli eventi (anche passati)
        </label>

        <label class="radio-container">
          <input type="radio" value="future" v-model="repeatEditMode" />
          <span class="radio-checkmark"></span>
          Da oggi in poi
        </label>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  emits: ["save", "cancel"],

  props: {
    modelValue: Object,
    editIndex: Number,
  },

  data() {
    return {
      form: {
        title: "",
        description: "",
        allDay: false,
        startHour: 9,
        startMinute: 0,
        endHour: 10,
        endMinute: 0,
        repeat: false,
        repeatFrequency: "weekly",
        repeatDuration: "1",
        repeatId: null,
        location: "",
        latitude: null,
        longitude: null,
      },
      repeatEditMode: "this",
      leafletMap: null,
      leafletMarker: null,
      searchQuery: "",
      searchResults: [],
      isSearching: false,
    };
  },

  mounted() {
    // Carica Leaflet se non è già presente
    if (!window.L) {
      const leafletCss = document.createElement("link");
      leafletCss.rel = "stylesheet";
      leafletCss.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(leafletCss);
      const leafletJs = document.createElement("script");
      leafletJs.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      leafletJs.onload = this.initLeafletMap;
      document.body.appendChild(leafletJs);
    } else {
      this.initLeafletMap();
    }
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.repeatEditMode = "this";
        if (newVal) {
          // se l'evento è già esistente, popola il form con i dati
          Object.assign(this.form, newVal);
          this.form.repeatId = newVal.repeatId || null;

          // Aggiorna la mappa con le coordinate se disponibili
          if (
            this.mapboxInstance &&
            this.form.latitude &&
            this.form.longitude
          ) {
            this.updateMapMarker([this.form.latitude, this.form.longitude]);
          }
        } else {
          // se non c'è un evento, resetta il form
          this.form = {
            title: "",
            description: "",
            allDay: false,
            startHour: 9,
            startMinute: 0,
            endHour: 10,
            endMinute: 0,
            repeat: false,
            repeatFrequency: "weekly",
            repeatDuration: "1",
            repeatId: null,
            location: "",
            latitude: null,
            longitude: null,
          };
        }
      },
    },
  },

  methods: {
    pad(n) {
      return n.toString().padStart(2, "0");
    },

    /**
     * Valida e formatta gli orari di inizio e fine evento.
     * - Controlla che tutti i campi siano compilati.
     * - Verifica che l'orario di fine sia successivo a quello di inizio.
     * - Restituisce orari formattati come stringa HH:mm oppure un messaggio di errore.
     */
    formattaData(sh, sm, eh, em) {
      // Se uno dei campi orari è mancante, restituisci errore
      if (sh === null || sm === null || eh === null || em === null)
        return { error: "Compila tutti i campi orari." };

      // Calcola i minuti totali dall'inizio della giornata per start e end
      const startTotal = sh * 60 + sm;
      const endTotal = eh * 60 + em;

      // L'orario di fine deve essere dopo quello di inizio
      if (endTotal <= startTotal) {
        return {
          error: "L'orario di fine deve essere successivo a quello di inizio.",
        };
      }

      // Restituisci orari formattati come stringa HH:mm
      return {
        startTime: `${this.pad(sh)}:${this.pad(sm)}`,
        endTime: `${this.pad(eh)}:${this.pad(em)}`,
        error: null,
      };
    },

    initLeafletMap() {
      // Inizializza la mappa Leaflet solo se non già presente e se la libreria è caricata
      if (this.leafletMap || !window.L) return;
      // Coordinate di default: Italia centrale se non specificate
      const defaultLat = this.form.latitude || 41.8719;
      const defaultLng = this.form.longitude || 12.5674;
      // Crea la mappa centrata sulle coordinate di default
      this.leafletMap = window.L.map("map").setView(
        [defaultLat, defaultLng],
        6
      );
      // Aggiungi layer delle tile OpenStreetMap
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(this.leafletMap);
      // Aggiungi marker trascinabile sulla mappa
      this.leafletMarker = window.L.marker([defaultLat, defaultLng], {
        draggable: true,
      }).addTo(this.leafletMap);
      // Aggiorna latitudine/longitudine quando il marker viene trascinato
      this.leafletMarker.on("dragend", (e) => {
        const pos = e.target.getLatLng();
        this.form.latitude = pos.lat;
        this.form.longitude = pos.lng;
        this.reverseGeocodeNominatim(pos.lat, pos.lng);
      });
      // Permetti di posizionare il marker cliccando sulla mappa
      this.leafletMap.on("click", (e) => {
        this.leafletMarker.setLatLng(e.latlng);
        this.form.latitude = e.latlng.lat;
        this.form.longitude = e.latlng.lng;
        this.reverseGeocodeNominatim(e.latlng.lat, e.latlng.lng);
      });
      // Se già presenti coordinate, centra la mappa e il marker su di esse
      if (this.form.latitude && this.form.longitude) {
        this.leafletMarker.setLatLng([this.form.latitude, this.form.longitude]);
        this.leafletMap.setView([this.form.latitude, this.form.longitude], 13);
      }
    },
    async searchLocation() {
      // Ricerca una posizione tramite Nominatim (OpenStreetMap) in base alla query inserita
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }
      this.isSearching = true;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          this.searchQuery
        )}&addressdetails=1&limit=5`;
        const res = await fetch(url, { headers: { "Accept-Language": "it" } });
        const data = await res.json();
        this.searchResults = data; // aggiorna i risultati della ricerca
      } catch (e) {
        this.searchResults = [];
      }
      this.isSearching = false;
    },

    // Aggiorna la posizione selezionata dall'utente dalla lista dei risultati
    selectLocation(result) {
      this.form.latitude = parseFloat(result.lat);
      this.form.longitude = parseFloat(result.lon);
      this.form.location = result.display_name;
      // Aggiorna il marker e centra la mappa sulla nuova posizione
      if (this.leafletMap && this.leafletMarker) {
        this.leafletMarker.setLatLng([this.form.latitude, this.form.longitude]);
        this.leafletMap.setView([this.form.latitude, this.form.longitude], 15);
      }
      this.searchResults = [];
      this.searchQuery = result.display_name;
    },

    // Effettua il reverse geocoding per ottenere l'indirizzo da coordinate lat/lng
    async reverseGeocodeNominatim(lat, lng) {
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "it" } });
        const data = await res.json();
        if (data && data.display_name) {
          this.form.location = data.display_name;
          this.searchQuery = data.display_name;
        }
      } catch (e) {
        // Errore ignorato intenzionalmente
      }
    },
    onSubmit() {
      if (!this.form.title.trim()) {
        alert("Inserisci un titolo per l'evento.");
        return;
      }

      let startTime = "00:00";
      let endTime = "23:59";
      if (!this.form.allDay) {
        const {
          startTime: s,
          endTime: e,
          error,
        } = this.formattaData(
          this.form.startHour,
          this.form.startMinute,
          this.form.endHour,
          this.form.endMinute
        );
        if (error) {
          alert(error);
          return;
        }
        startTime = s;
        endTime = e;
      }

      const eventObj = {
        title: this.form.title.trim(),
        description: this.form.description.trim(),
        allDay: this.form.allDay,
        startTime,
        endTime,
        repeat: this.form.repeat,
        repeatFrequency: this.form.repeat ? this.form.repeatFrequency : null,
        repeatDuration: this.form.repeat
          ? parseInt(this.form.repeatDuration)
          : null,
        location: this.form.location,
        latitude: this.form.latitude,
        longitude: this.form.longitude,
      };

      // invio evento salvato + modalità di modifica se ricorrente
      this.$emit(
        "save",
        { ...eventObj, repeatId: this.form.repeatId },
        this.repeatEditMode
      );
    },
  },
};
</script>

<style scoped>
.event-form-container {
  font-family: "Inter", "Segoe UI", system-ui, -apple-system, sans-serif;
  max-width: 650px;
  margin: 0 auto 1em auto;
}

.event-form {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 24px;
  color: #1a202c;
}

.form-title {
  color: #2d3748;
  margin-top: 0;
  margin-bottom: 24px;
  font-weight: 600;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #f8fafc;
  color: #2d3748;
}

.form-control:focus {
  outline: none;
  border-color: #3182ce;
  box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.15);
}

.form-control::placeholder {
  color: #a0aec0;
}

textarea.form-control {
  resize: vertical;
  min-height: 80px;
}

.time-selectors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.time-input-group {
  display: flex;
  align-items: center;
}

.time-select {
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: #f8fafc;
  color: #2d3748;
  flex: 1;
  font-size: 0.95rem;
}

.time-separator {
  margin: 0 8px;
  color: #4a5568;
  font-weight: bold;
}

/* Checkboxes e radio buttons stilizzati */
.checkbox-group,
.radio-group {
  margin-bottom: 16px;
}

.checkbox-container,
.radio-container {
  position: relative;
  padding-left: 30px;
  cursor: pointer;
  display: block;
  margin-bottom: 8px;
  font-size: 0.95rem;
  user-select: none;
  color: #4a5568;
}

.checkbox-container input,
.radio-container input {
  position: absolute;
  opacity: 0;
  height: 0;
  width: 0;
}

.checkmark,
.radio-checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
}

.checkmark {
  border-radius: 4px;
}

.radio-checkmark {
  border-radius: 50%;
}

.checkbox-container:hover input ~ .checkmark,
.radio-container:hover input ~ .radio-checkmark {
  background-color: #edf2f7;
}

.checkbox-container input:checked ~ .checkmark,
.radio-container input:checked ~ .radio-checkmark {
  background-color: #3182ce;
  border-color: #3182ce;
}

.checkmark:after,
.radio-checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after,
.radio-container input:checked ~ .radio-checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 7px;
  top: 3px;
  width: 4px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.radio-container .radio-checkmark:after {
  left: 6px;
  top: 6px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}

/* Mappe e località */
.event-map {
  width: 100%;
  height: 280px;
  margin: 10px 0 15px 0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.coords {
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #4a5568;
  margin-bottom: 20px;
  background-color: #f1f5f9;
  padding: 8px 12px;
  border-radius: 6px;
}

.location-icon {
  margin-right: 8px;
  font-size: 1rem;
}

/* Pulsanti */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 10px 18px;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-save {
  background-color: #3182ce;
  color: white;
}

.btn-save:hover {
  background-color: #2c5282;
}

.btn-cancel {
  background-color: #e2e8f0;
  color: #4a5568;
}

.btn-cancel:hover {
  background-color: #cbd5e0;
}

/* Opzioni di ripetizione */
.repeat-options {
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.location-search-group {
  position: relative;
  z-index: 1;
}
/* Varie località sopra l'input */
.search-results {
  position: absolute;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #e2e8f0;
  z-index: 1;
  max-height: 180px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin: 0;
  padding: 0;
  list-style: none;
}
.search-results-above {
  bottom: 100%;
  border-radius: 6px 6px 0 0;
  position: absolute;
}
.search-results:not(.search-results-above) {
  top: 100%;
  border-radius: 0 0 6px 6px;
}
.search-results li {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.95rem;
  color: #2d3748;
  border-bottom: 1px solid #f1f5f9;
  transition: background 0.15s;
}
.search-results li:last-child {
  border-bottom: none;
}
.search-results li:hover {
  background: #ebf8ff;
}

/* Modalità di ripetizione */
.repeat-edit-mode {
  margin-top: 20px;
  padding: 20px;
  border-radius: 8px;
  background-color: #ebf8ff;
  border: 1px solid #bee3f8;
}

.repeat-edit-header {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  color: #2b6cb0;
}

.repeat-icon {
  margin-right: 8px;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .event-form {
    padding: 10px;
  }

  .time-selectors,
  .repeat-options {
    flex-direction: column;
    gap: 10px;
  }

  .time-input,
  .repeat-option {
    min-width: 100%;
  }

  .form-actions {
    flex-direction: column;
  }

  button {
    width: 100%;
    margin-bottom: 5px;
  }

  .event-map {
    height: 200px;
  }
}

@media (max-width: 480px) {
  .event-form {
    padding: 8px;
  }

  .form-group {
    margin-bottom: 10px;
  }

  .event-map {
    height: 180px;
  }

  h3 {
    font-size: 1.1rem;
    margin: 10px 0;
  }
}
</style>
