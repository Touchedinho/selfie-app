<template>
  <!-- sezione laterale che mostra gli eventi della giornata corrente -->
  <aside class="today-events">
    <h3>Eventi di oggi <span>({{ todayDateString }})</span></h3>
    <p v-if="events.length === 0" class="no-events">Nessun evento per oggi</p>
    <ul v-else>
      <li v-for="(event, idx) in events" :key="idx" class="event-item">
        <h4>{{ event.titolo }}</h4>
        <p class="event-time">
          <span class="time-badge" :class="{ 'all-day': event.allDay }">{{event.allDay ? "Tutto il giorno" : event.startTime + " - " + event.endTime}}
          </span>
        </p>
      </li>
    </ul>
  </aside>
</template>

<script>
export default {
  props: {
    events: Array,
    todayDateString: String,
  },
};
</script>

<style scoped>
/* Importa il font Poppins se non è già incluso nell'app */
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap");

.today-events {
  font-family: "Poppins", sans-serif;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 1em;
  padding: 1.5em;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  height: fit-content;
  border: none;
  position: relative;
  overflow: hidden;
}

.today-events::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, #608dcb 0%, #00d2ff 100%);
}

.today-events h3 {
  color: #1a56a9;
  font-size: 1.3em;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 1.2em;
  padding-bottom: 0.5em;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.today-events h3 span {
  font-size: 0.8em;
  opacity: 0.7;
  font-weight: normal;
}

.today-events ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.event-item {
  background: white;
  margin-bottom: 1em;
  border-radius: 0.7em;
  overflow: hidden;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
  padding: 1em;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border-left: 3px solid #1a56a9;
}

.event-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 12px rgba(0, 0, 0, 0.12);
}

.event-item h4 {
  margin: 0 0 0.5em 0;
  color: #333;
  font-size: 1em;
}

.event-time {
  font-size: 0.85em;
  margin: 0;
}

.time-badge {
  display: inline-block;
  background: #e9f5ff;
  color: #1a56a9;
  padding: 0.3em 0.7em;
  border-radius: 2em;
  font-weight: 500;
}

.time-badge.all-day {
  background: #e3f2fd;
  color: #0d47a1;
}

.no-events {
  text-align: center;
  padding: 1.5em;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 0.8em;
  font-style: italic;
  color: #666;
}

@media (max-width: 768px) {
  .today-events {
    margin-top: 15px;
    padding: 10px;
  }
}

@media (max-width: 480px) {
  .today-events {
    padding: 8px;
    max-width: 90%;
    margin: 0 auto;
  }

  h3 {
    font-size: 1.1rem;
    margin-bottom: 10px;
    padding-bottom: 5px;
  }

  .event-item {
    padding: 6px;
    margin-bottom: 6px;
    font-size: 0.9em;
  }
}
</style>
