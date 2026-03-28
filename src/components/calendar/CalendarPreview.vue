<template>
  <section class="calendar-preview">
    <!-- Selettori mese/anno -->
    <div class="calendar-box">
      <div class="calendar-header">
        <h1>Calendario</h1>
        <div class="selectors" aria-label="Selezione mese e anno">
          <button @click="changeMonth(-1)" aria-label="Mese precedente" class="nav-button">
            <span class="nav-icon">«</span>
          </button>
          
          <!-- selettore mese -->
          <label class="selector-label">
            <span class="visually-hidden">Mese</span>
            <select v-model="currentMonth" class="month-year-select">
              <option v-for="(m, i) in months" :key="i" :value="i">
                {{ m }}
              </option>
            </select>
          </label>
          
          <!-- selettore anno -->
          <label class="selector-label">
            <span class="visually-hidden">Anno</span>
            <select v-model="currentYear" class="month-year-select">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </label>
          
          <button  @click="changeMonth(1)" aria-label="Mese successivo" class="nav-button">
            <span class="nav-icon">»</span>
          </button>
        </div>
      </div>

      <Calendar :currentYear="currentYear" :currentMonth="currentMonth" :selectedDay="selectedDay" :events="events" :virtualDate="virtualDate" @select-day="selectDay" />
    </div>

    <!-- lista eventi per il giorno selezionato -->
    <div class="events-container">
      <EventList v-if="selectedDay !== null && !showForm" :selectedDateString="selectedDateString" :events="eventsForSelectedDay" @close="closeEventList" @edit-event="editEvent" @delete-event="deleteEvent" />

      <!-- form per aggiungere o modificare eventi -->
      <EventForm v-if="showForm" :modelValue="formModel" :editIndex="editIndex" @save="saveEvent" @cancel="closeForm" />

      <!-- eventi del giorno corrente -->
      <TodayEvents :events="eventsForToday"  :todayDateString="todayDateString"/>

      <button v-if="selectedDay !== null && !showForm" @click="openNewEventForm" class="new-event-button">
        <span class="button-icon">+</span> Nuovo Evento
      </button>
    </div>
  </section>
</template>

<script>
// Script section unchanged
let backendHost = `http://${window.location.hostname}:${window.location.port}`;

import { getVirtualTime } from "@/api";
import { computed, onMounted, reactive, ref } from "vue";
import Calendar from "./CalendarGrid.vue";
import EventForm from "./EventForm.vue";
import EventList from "./EventList.vue";
import TodayEvents from "./TodayEvents.vue";

export default {
  name: "CalendarPreview",
  components: {
    Calendar,
    EventList,
    EventForm,
    TodayEvents,
  },

  setup() {
    const currentDate = ref(new Date());
    // se la data virtuale è impostata, la uso come data corrente
    const virtualDate = computed(() => {
      return typeof currentDate.value === "string"
        ? new Date(currentDate.value)
        : currentDate.value;
    });
    // mese e anno iniziali si basano su virtualDate, vengono modificati dinamicamente dall'utente
    const currentYear = ref(virtualDate.value.getFullYear());
    const currentMonth = ref(virtualDate.value.getMonth());
    // tiene traccia del giorno cliccato per mostrare dettagli eventi
    const selectedDay = ref(null);
    // oggetto reattivo per gli eventi, chiave: data in formato YYYY-MM-DD
    const events = reactive({});

    // funzione per recuperare gli eventi dal backend
    async function fetchEvents() {
      const author = window.localStorage.getItem("username") || "Anonimo";
      try {
        const res = await fetch(
          `${backendHost}/api/calendar/getAll?author=${encodeURIComponent(
            author
          )}`
        );
        if (!res.ok) {
          Object.keys(events).forEach((k) => delete events[k]);
          return;
        }
        const data = await res.json();

        const eventsTemp = {};
        // svuota events
        Object.keys(events).forEach((k) => delete events[k]);
        // inserisci eventi per ogni giorno
        for (const ev of data.eventi) {
          // Correggi la data per il fuso orario locale
          const d = new Date(ev.data_ev);
          const localDate = new Date(
            d.getFullYear(),
            d.getMonth(),
            d.getDate(),
            d.getHours(),
            d.getMinutes(),
            d.getSeconds()
          );
          const key = formatDateKey(
            localDate.getFullYear(),
            localDate.getMonth() + 1,
            localDate.getDate()
          );
          if (!eventsTemp[key]) eventsTemp[key] = [];
          eventsTemp[key].push(ev);
        }

        // aggiorna reactive events
        Object.keys(events).forEach((k) => delete events[k]);
        for (const key in eventsTemp) {
          events[key] = eventsTemp[key];
        }
      } catch (err) {
        Object.keys(events).forEach((k) => delete events[k]);
      }
    }

    onMounted(async () => {
      // Recupera la data virtuale dal backend (Time Machine)
      try {
        const timeStr = await getVirtualTime();
        let dateIso = timeStr;
        // Se la risposta è un oggetto con proprietà "time", estrai la stringa ISO
        if (timeStr && typeof timeStr === "object" && timeStr.time) {
          dateIso = timeStr.time;
        }
        // Se la data virtuale è valida, aggiorna lo stato del calendario
        if (dateIso && typeof dateIso === "string" && dateIso.trim() !== "") {
          const parsed = new Date(dateIso);
          if (!isNaN(parsed)) {
            currentDate.value = parsed; // imposta la data virtuale come data corrente
            currentYear.value = parsed.getFullYear(); // aggiorna l'anno
            currentMonth.value = parsed.getMonth(); // aggiorna il mese
          } else {
            // Se la data virtuale non è valida, mantieni la data reale
            console.warn("Data virtuale non valida, uso quella reale.");
          }
        }
      } catch (e) {
        // In caso di errore nel recupero della data virtuale, mostra un warning
        console.warn("Errore nel recupero della Time Machine:", e);
      }
      // Dopo aver impostato la data, recupera gli eventi dal backend
      await fetchEvents();
    });

    const months = [
      "Gennaio",
      "Febbraio",
      "Marzo",
      "Aprile",
      "Maggio",
      "Giugno",
      "Luglio",
      "Agosto",
      "Settembre",
      "Ottobre",
      "Novembre",
      "Dicembre",
    ];

    const years = [];
    // creo un array di anni da 5 anni prima a 5 anni dopo l'anno corrente, costruisco così un range di 11 anni centrati
    //sull'anno corrente per avere una navigazione temporale ragionevole senza aprire l'interfaccia a valori arbitrari
    for (let y = currentYear.value - 5; y <= currentYear.value + 5; y++)
      years.push(y);

    // tiene traccia della visibilità del form per aggiungere/modificare eventi
    const showForm = ref(false);
    // tiene traccia dell'indice dell'evento da modificare (se presente)
    const editIndex = ref(null);
    // funzione per formattare la chiave della data in YYYY-MM-DD
    function formatDateKey(y, m, d) {
      return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }

    // aggiunge un evento alla struttura dati locale `events`
    function addEventToDate(key, eventObj) {
      if (!events[key]) events[key] = [];
      events[key].push(eventObj);
    }

    const selectedDateString = computed(() => {
      if (selectedDay.value === null) return "";
      return `${selectedDay.value} ${months[currentMonth.value]} ${
        currentYear.value
      }`;
    });

    // restituisce gli eventi per il giorno selezionato
    const eventsForSelectedDay = computed(() => {
      if (selectedDay.value === null) return [];
      const key = formatDateKey(
        currentYear.value,
        currentMonth.value + 1,
        selectedDay.value
      );
      const result = [...(events[key] || [])];

      // Espandi eventi ricorrenti
      const selectedDate = new Date(
        currentYear.value,
        currentMonth.value,
        selectedDay.value
      );
      Object.values(events)
        .flat()
        .forEach((ev) => {
          if (
            !ev.repeat ||
            !ev.repeatFrequency ||
            !ev.repeatDuration ||
            !ev.date
          )
            return;
          // Calcola la data di inizio
          const startDate = new Date(ev.date);
          if (isNaN(startDate)) return;
          // Calcola la data di fine ripetizione
          let repeatEndDate = null;
          if (ev.repeatDuration === "forever") {
            repeatEndDate = null;
          } else {
            let monthsToAdd = 0;
            if (ev.repeatFrequency === "weekly")
              monthsToAdd = 0.25 * parseInt(ev.repeatDuration);
            else if (ev.repeatFrequency === "monthly")
              monthsToAdd = parseInt(ev.repeatDuration);
            else if (ev.repeatFrequency === "yearly")
              monthsToAdd = 12 * parseInt(ev.repeatDuration);
            repeatEndDate = new Date(startDate);
            repeatEndDate.setMonth(repeatEndDate.getMonth() + monthsToAdd);
          }

          // Genera tutte le date di occorrenza e verifica se selectedDate cade in una di esse
          let occurrence = new Date(startDate);
          while (!repeatEndDate || occurrence <= repeatEndDate) {
            if (
              occurrence.getFullYear() === selectedDate.getFullYear() &&
              occurrence.getMonth() === selectedDate.getMonth() &&
              occurrence.getDate() === selectedDate.getDate()
            ) {
              // Non duplicare se già presente (es. evento modificato singolarmente)
              if (!result.some((e) => e.id === ev.id)) {
                result.push(ev);
              }
              break;
            }
            // Avanza alla prossima occorrenza
            if (ev.repeatFrequency === "weekly")
              occurrence.setDate(occurrence.getDate() + 7);
            else if (ev.repeatFrequency === "monthly")
              occurrence.setMonth(occurrence.getMonth() + 1);
            else if (ev.repeatFrequency === "yearly")
              occurrence.setFullYear(occurrence.getFullYear() + 1);
            else break;
          }
        });
      return result;
    });

    const todayDateString = computed(
      () =>
        `${currentDate.value.getDate()} ${
          months[currentDate.value.getMonth()]
        } ${currentDate.value.getFullYear()}`
    );

    // restituisce gli eventi per il giorno corrente
    const eventsForToday = computed(() => {
      const key = formatDateKey(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        currentDate.value.getDate()
      );
      return events[key] || [];
    });

    // restituisce il modello del form per l'evento da modificare o aggiungere
    const formModel = computed(() => {
      if (editIndex.value === null || selectedDay.value === null) {
        return null;
      }
      const key = formatDateKey(
        currentYear.value,
        currentMonth.value + 1,
        selectedDay.value
      );
      return events[key]?.[editIndex.value] || null;
    });

    // resetta l'indice di modifica per evitare conflitti tra eventi
    function resetForm() {
      editIndex.value = null;
    }

    // apre il form per un nuovo evento, resetta l'indice di modifica
    function openNewEventForm() {
      resetForm();
      showForm.value = true;
    }

    // chiude il form e resetta l'indice di modifica
    function closeForm() {
      resetForm();
      showForm.value = false;
    }

    // chiude la lista degli eventi per il giorno selezionato
    function closeEventList() {
      selectedDay.value = null;
      showForm.value = false;
    }

    // seleziona un giorno sul calendario, chiude il form se aperto
    function selectDay(day) {
      selectedDay.value = day;
      showForm.value = false;
    }

    // salva o aggiorna (POST/PUT) un evento nel backend e lo aggiunge alla struttura dati locale `events`
    function saveEvent(eventObj) {
      const key = formatDateKey(
        currentYear.value,
        currentMonth.value + 1,
        selectedDay.value
      );
      let dateISO = `${currentYear.value}-${String(
        currentMonth.value + 1
      ).padStart(2, "0")}-${String(selectedDay.value).padStart(2, "0")}`;

      // Aggiungi i secondi per evitare problemi di parsing nel backend
      if (!eventObj.allDay && eventObj.startTime) {
        dateISO = `${dateISO}T${eventObj.startTime}:00`;
      }

      const author = window.localStorage.getItem("username") || "Anonimo";

      if (!author) {
        console.error("Username non trovato nel localStorage.");
        return;
      }

      const payload = {
        author,
        title: eventObj.title,
        description: eventObj.description,
        date: dateISO,
        allDay: eventObj.allDay,
        startTime: eventObj.startTime,
        endTime: eventObj.endTime,
        repeat: eventObj.repeat ? true : false,
        repeatFrequency: eventObj.repeat ? eventObj.repeatFrequency : null,
        repeatDuration: eventObj.repeat ? eventObj.repeatDuration : null,
        repeatId: eventObj.repeat
          ? eventObj.repeatId || `repeat-${Date.now()}`
          : null,
        location: eventObj.location,
        latitude: eventObj.latitude,
        longitude: eventObj.longitude,
      };

      // modifica evento esistente (PUT)
      if (editIndex.value !== null) {
        const event = events[key]?.[editIndex.value];
        if (!event) return;
        fetch(`${backendHost}/api/calendar/update/${event.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: eventObj.title,
            description: eventObj.description,
            date: dateISO,
            location: eventObj.location,
            latitude: eventObj.latitude,
            longitude: eventObj.longitude,
            allDay: eventObj.allDay,
            startTime: eventObj.startTime,
            endTime: eventObj.endTime,
          }),
        })
          .then(async (res) => {
            if (res.ok) {
              closeForm();
              fetchEvents(); // ricarico gli eventi per riflettere le modifiche
            } else {
              alert("Errore modifica evento");
            }
          })
          .catch(() => {
            alert("Errore di rete");
          });
      } else {
        // nuovo evento (POST)
        fetch(`${backendHost}/api/calendar/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
              addEventToDate(key, eventObj);
              closeForm();
              fetchEvents();
            } else {
              alert(data.error || "Errore salvataggio evento");
            }
          })
          .catch(() => {
            alert("Errore di rete");
          });
      }
    }

    // variabile per tenere traccia dell'ID di un evento ricorrente in modifica
    const editingRepeatId = ref(null);

    // funzione per modificare un evento esistente
    function editEvent(index) {
      editIndex.value = index;
      const key = formatDateKey(
        currentYear.value,
        currentMonth.value + 1,
        selectedDay.value
      );
      const ev = events[key]?.[index];
      if (ev?.repeatId) {
        editingRepeatId.value = ev.repeatId;
      }
      showForm.value = true;
    }

    // funzione per eliminare un evento o tutta la serie se è ricorrente
    function deleteEvent(index) {
      const key = formatDateKey(
        currentYear.value,
        currentMonth.value + 1,
        selectedDay.value
      );
      const eventToDelete = events[key]?.[index];
      if (!eventToDelete) return;

      // Debug: mostra il repeatId reale e l'oggetto evento
      console.log(
        "repeatId:",
        eventToDelete.repeatId,
        "id:",
        eventToDelete.id,
        "evento:",
        JSON.parse(JSON.stringify(eventToDelete))
      );
      if (eventToDelete.repeatId) {
        // Evento ricorrente: chiedi se eliminare solo questo o tutta la serie
        const scelta = window.prompt(
          "Questo evento è ricorrente. Scrivi '1' per eliminare solo questo evento, '2' per eliminare tutta la serie.",
          "1"
        );
        if (scelta === "2") {
          // Elimina tutta la serie
          if (
            !eventToDelete.repeatId ||
            typeof eventToDelete.repeatId !== "string" ||
            eventToDelete.repeatId.length < 3
          ) {
            alert(
              "Errore: repeatId non valido o mancante. Impossibile eliminare la serie."
            );
            return;
          }
          fetch(
            `${backendHost}/api/calendar/delete-series/${eventToDelete.repeatId}`,
            {
              method: "DELETE",
            }
          )
            .then((res) => {
              if (res.ok) {
                fetchEvents();
                closeEventList();
              } else {
                res
                  .json()
                  .then((data) => {
                    alert(
                      "Errore eliminazione serie di eventi: " +
                        (data?.error || "")
                    );
                  })
                  .catch(() => {
                    alert("Errore eliminazione serie di eventi.");
                  });
              }
            })
            .catch(() => {
              alert("Errore di rete");
            });
          return;
        } else if (scelta !== "1") {
          // Annulla
          return;
        }
        // Altrimenti elimina solo questa occorrenza
      } else {
        // Evento non ricorrente: conferma eliminazione
        if (!confirm("Sei sicuro di voler eliminare questo evento?")) return;
      }
      // Elimina solo questa occorrenza
      fetch(`${backendHost}/api/calendar/delete/${eventToDelete.id}`, {
        method: "DELETE",
      })
        .then((res) => {
          if (res.ok) {
            fetchEvents();
            closeEventList();
          } else {
            alert("Errore eliminazione evento");
          }
        })
        .catch(() => {
          alert("Errore di rete");
        });
    }

    function changeMonth(delta) {
      let newMonth = currentMonth.value + delta;
      let newYear = currentYear.value;
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      currentMonth.value = newMonth;
      currentYear.value = newYear;
      selectedDay.value = null;
      fetchEvents();
    }

    return {
      months,
      years,
      currentYear,
      currentMonth,
      selectedDay,
      events,
      virtualDate,
      showForm,
      editIndex,
      selectedDateString,
      eventsForSelectedDay,
      todayDateString,
      eventsForToday,
      formModel,
      openNewEventForm,
      closeForm,
      closeEventList,
      selectDay,
      saveEvent,
      editEvent,
      deleteEvent,
      changeMonth,
    };
  },
};
</script>

<style scoped>
/* Importa il font Poppins se non è già incluso nell'app */
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

.calendar-preview {
  font-family: "Poppins", sans-serif;
  max-width: 900px;
  margin: auto;
  padding: 10px;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 10px;
}

.calendar-box {
  background-image: -webkit-linear-gradient(
    rgb(246, 248, 195),
    rgb(196, 249, 196),
    rgb(170, 221, 245)
  );
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.calendar-box:hover {
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.calendar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 15px;
}

.calendar-header h1 {
  margin: 0 0 10px 0;
  color: #1a56a9;
  font-size: 1.8em;
  font-weight: 600;
}

.selectors {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 10px;
  background: rgba(255, 255, 255, 0.5);
  padding: 8px 15px;
  border-radius: 30px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}

.month-year-select {
  padding: 6px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: white;
  font-family: "Poppins", sans-serif;
  font-size: 0.9em;
  transition: all 0.2s;
  cursor: pointer;
}

.month-year-select:focus {
  outline: none;
  border-color: #1a56a9;
  box-shadow: 0 0 0 2px rgba(26, 86, 169, 0.2);
}

.nav-button {
  background: linear-gradient(135deg, #1a56a9 0%, #039bbd 100%);
  border: none;
  height: 30px;
  width: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  font-weight: bold;
  transition: transform 0.2s, background 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.nav-button:hover {
  transform: translateY(-2px);
  background: linear-gradient(135deg, #2367c0 0%, #04b2d9 100%);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
}

.nav-button:active {
  transform: translateY(0);
}

.nav-icon {
  font-size: 1.2em;
  line-height: 1;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  border: 0;
  white-space: nowrap;
  clip-path: inset(100%);
  clip: rect(0 0 0 0);
  overflow: hidden;
}

.new-event-button {
  font-family: "Poppins", sans-serif;
  background: linear-gradient(135deg, #1a56a9 0%, #039bbd 100%);
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-top: 15px;
}

.new-event-button:hover {
  transform: translateY(-3px);
  background: linear-gradient(135deg, #2367c0 0%, #04b2d9 100%);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.new-event-button:active {
  transform: translateY(-1px);
}

.button-icon {
  margin-right: 5px;
  font-size: 1.1em;
  font-weight: bold;
}

@media (max-width: 768px) {
  .calendar-preview {
    grid-template-columns: 1fr;
    width: 100%;
    padding: 5px;
  }

  .selectors {
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
  }

  .selectors select {
    min-width: 90px;
  }

  .calendar-header h1 {
    font-size: 1.5em;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .calendar-preview {
    margin: 5px auto;
    padding: 2px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .calendar-box {
    padding: 5px;
    max-width: 95%;
  }

  .selectors button {
    padding: 4px 8px;
  }

  .calendar-header h1 {
    font-size: 1.3em;
    margin: 10px 0;
  }

  .new-event-button {
    max-width: 90%;
  }

  .events-container {
    align-items: center;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
}
</style>
