<template>
  <div class="calendar-grid" role="grid" tabindex="0" aria-label="Calendario">
    <div class="calendar-days">
      <div>Lun</div>
      <div>Mar</div>
      <div>Mer</div>
      <div>Gio</div>
      <div>Ven</div>
      <div>Sab</div>
      <div>Dom</div>
    </div>
    
    <!-- celle vuote iniziali per allineare il primo giorno del mese alla colonna corretta -->
    <button v-for="n in firstDayOffset" :key="'offset-' + n" class="empty-day" disabled aria-hidden="true" tabindex="-1"></button>
    
    <!-- generazione dei giorni del mese -->
    <button
      v-for="day in daysInMonth"
      :key="day"
      :class="[
        'day',
        {
          today: isToday(day),
          'has-event': hasEvent(day),
          selected: day === selectedDay,
        },
      ]"
      @click="() => selectDay(day)"
      :aria-label="`Giorno ${day}${hasEvent(day) ? ', con eventi' : ''}`"
    >
      {{ day }}
    </button>
  </div>
</template>

<script>
import { computed } from "vue";

export default {
  name: "CalendarGrid",
  props: {
    currentYear: Number,
    currentMonth: Number,
    selectedDay: Number,
    events: Object,
    virtualDate: Date, //data impostata dalla time machine
  },
  emits: ["select-day"],
  setup(props, { emit }) {
    const daysInMonth = computed(() => {
      return new Date(props.currentYear, props.currentMonth + 1, 0).getDate();
    });
    // offset per allineare il primo giorno del mese (es: se inizia di mercoledì, offset = 2)
    const firstDayOffset = computed(() => {
      const firstDay = new Date(
        props.currentYear,
        props.currentMonth,
        1
      ).getDay();
      //considero lunedì come primo giorno della settimana (0), non domenica
      return firstDay === 0 ? 6 : firstDay - 1;
    });

    function isToday(day) {
      let today;
      if (props.virtualDate instanceof Date) {
        today = props.virtualDate;
      } else if (typeof props.virtualDate === "string") {
        today = new Date(props.virtualDate);
      } else {
        today = new Date();
      }
      return (
        props.currentYear === today.getFullYear() &&
        props.currentMonth === today.getMonth() &&
        day === today.getDate()
      );
    }

    function hasEvent(day) {
      const key = `${props.currentYear}-${String(
        props.currentMonth + 1
      ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      return (
        props.events[key] &&
        props.events[key].some((ev) => ev.repeat && ev.repeat !== "none")
      );
    }

    function selectDay(day) {
      emit("select-day", day);
    }

    return {
      daysInMonth,
      firstDayOffset,
      isToday,
      hasEvent,
      selectDay,
    };
  },
};
</script>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(7, 1fr);
  gap: 4px;
  padding: 8px;
  border-radius: 8px;
}

.calendar-days {
  display: contents;
}

.calendar-days div {
  text-align: center;
  font-weight: bold;
  padding: 8px 0;
}

.day,
.empty-day {
  padding: 8px;
  text-align: center;
  border-radius: 4px;
}

.day {
  border: 1px solid #ccc;
  cursor: pointer;
  background: white;
}

.day.today {
  background-color: #5fe1f2;
}

.day.has-event {
  background-color: #ffffff;
  border-color: rgb(92, 92, 90);
}

.day.selected {
  border: 2px solid #007bff;
}

.day:hover {
  background-color: #90f5b2;
}

.empty-day {
  background: transparent;
  border-style: none;
}

/* Stile responsive per telefoni */
@media (max-width: 768px) {
  .calendar-grid {
    gap: 2px;
    padding: 4px;
  }

  .day,
  .empty-day {
    padding: 6px 0;
  }
}

@media (max-width: 480px) {
  .calendar-grid {
    gap: 1px;
    padding: 2px;
  }

  .calendar-days div {
    font-size: 0.8rem;
    padding: 4px 0;
  }

  .day,
  .empty-day {
    padding: 4px 0;
    font-size: 0.9rem;
  }
}
</style>
