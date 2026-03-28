<template>
  <section class="event-list" aria-label="Eventi del giorno selezionato">
    <header>
      <h3>Eventi del {{ selectedDateString }}</h3>
      <button @click="$emit('close')" class="button-event secondary">Chiudi</button>
    </header>

    <p v-if="events.length === 0" class="no-events">Nessun evento per questa data</p>

    <ul v-else>
      <li v-for="(event, index) in events" :key="index" class="event-item">
        <div class="event-content">
          <h4>{{ event.titolo }}</h4>
          <p class="event-description">{{ event.descr }}</p>
          <p v-if="event.location" class="event-location">
            <span class="location-icon">📍</span>
            {{ event.location }}
          </p>
          <p class="event-time">
            <span class="time-icon">🕒</span>{{event.allDay ? "Tutto il giorno" : event.startTime + " - " + event.endTime}}
          </p>
        </div>
        <div class="event-actions">
          <button @click="$emit('edit-event', index)" title="Modifica"  class="action-button edit">✏️</button>
          <button @click="$emit('delete-event', index)" title="Elimina" class="action-button delete">🗑️</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script>
export default {
  props: {
    selectedDateString: String,
    events: Array,
  },
};
</script>

<style scoped>
/* Importa il font Poppins se non è già incluso nell'app */
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

.event-list {
  font-family: "Poppins", sans-serif;
  background: linear-gradient(135deg, #608dcb 0%, #00d2ff 100%);
  border-radius: 1em;
  padding: 1.5em;
  color: white;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  margin-bottom: 2em;
}

.event-list header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  padding-bottom: 0.8em;
}

.event-list h3 {
  margin: 0;
  font-size: 1.4em;
  font-weight: 600;
}

.event-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.event-item {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  margin-bottom: 1em;
  border-radius: 0.8em;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.event-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.event-content {
  padding: 1.2em;
  flex-grow: 1;
}

.event-item h4 {
  margin: 0 0 0.5em 0;
  color: #1a56a9;
  font-size: 1.1em;
}

.event-description {
  margin: 0.5em 0;
  font-size: 0.95em;
  color: #444;
}

.event-time {
  font-size: 0.9em;
  color: #666;
  display: flex;
  align-items: center;
  margin: 0.5em 0 0 0;
}

.time-icon {
  margin-right: 0.5em;
}

.event-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(240, 240, 240, 0.8);
  padding: 0.5em 0.2em;
  gap: 0.3em;
}

.event-location {
  font-size: 0.95em;
  color: #1a56a9;
  margin: 0.2em 0 0.2em 0;
  display: flex;
  align-items: center;
  gap: 0.3em;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  max-width: 100%;
}
.location-icon {
  font-size: 1em;
  margin-right: 0.3em;
}

.action-button {
  background: none;
  border: none;
  font-size: 1.2em;
  width: 2.2em;
  height: 2.2em;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
  padding: 0;
}

.action-button.edit:hover {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 193, 7, 0.25) 60%,
    transparent 100%
  );
}

.action-button.edit:hover {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 193, 7, 0.13) 35%,
    transparent 100%
  );
}
.action-button.delete:hover {
  background: radial-gradient(
    circle at 50% 50%,
    rgba(220, 53, 69, 0.10) 35%,
    transparent 100%
  );
}

.button-event {
  padding: 0.6em 1.2em;
  font-size: 0.9em;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  color: white;
  border: none;
  border-radius: 5em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button-event.secondary {
  background: rgba(255, 255, 255, 0.3);
}

.button-event:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.4);
}

.button-event:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .event-list {
    padding: 10px;
  }

  .list-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }

  .close-btn {
    align-self: flex-end;
  }
}

@media (max-width: 480px) {
  .event-list {
    max-width: 90%;
    padding: 8px;
    margin: 1em auto;
  }

  .event-actions {
    width: auto;
    flex-direction: column;
    align-items: center;
    margin-top: 5px;
    gap: 0.5em;
    padding: 0.2em 0;
  }

  .action-button {
    width: 2.2em;
    height: 2.2em;
    min-width: 2.2em;
    min-height: 2.2em;
  }

  h3 {
    font-size: 1.1rem;
    margin: 5px 0;
  }
}
</style>
