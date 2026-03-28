<template>
  <div id="app" :class="appLayoutClass">
    <nav v-if="showNav">
      <router-link id="logo-container" to="/home" title="Pagina principale">
        <h1><i id="logo">Selfie🤳</i></h1>
      </router-link>

      <article id="time-machine">
        <router-link class="link-time-machine" to="/timeMachine" title="Modifica il tempo">
          <span class="time-icon">⏱️</span>
          <span>Time Machine</span>
        </router-link>
      </article>

      <!-- Menù dropdown per dispositivi mobili -->
      <div id="dropdown" :class="{ open: dropdownOpen }">
        <button id="dropdown-button" @click="toggleDropdown" :aria-expanded="dropdownOpen">
          <span class="menu-icon">☰</span>
          <span>Menù</span>
        </button>
        <div id="dropdown-content" v-show="dropdownOpen">
          <router-link class="dropdown-link" to="/notes" title="Vai alla pagina Note" @click="closeDropdown">
            <span class="link-icon">📝</span>Note
          </router-link>
          <router-link class="dropdown-link" to="/calendar" title="Vai alla pagina Calendario" @click="closeDropdown">
            <span class="link-icon">📅</span>Calendario
          </router-link>
          <router-link class="dropdown-link" to="/pomodoro" title="Vai alla pagina Pomodoro" @click="closeDropdown">
            <span class="link-icon">🍅</span>Pomodoro
          </router-link>
          <router-link class="dropdown-link" to="/profile" title="Vai alla pagina Profilo" @click="closeDropdown">
            <span class="link-icon">👤</span>Profilo
          </router-link>
        </div>
      </div>

      <!-- Menu normale per desktop -->
      <section id="desktop-menu">
        <router-link class="menu-link notes" to="/notes" title="Vai alla pagina Note">
          <span class="link-icon">📝</span>Note
        </router-link>
        <router-link class="menu-link calendar" to="/calendar" title="Vai alla pagina Calendario">
          <span class="link-icon">📅</span>Calendario
        </router-link>
        <router-link class="menu-link pomodoro" to="/pomodoro" title="Vai alla pagina Pomodoro">
          <span class="link-icon">🍅</span>Pomodoro
        </router-link>
        <router-link class="menu-link profile" to="/profile" title="Vai alla pagina Profilo">
          <span class="link-icon">👤</span>Profilo
        </router-link>
      </section>
    </nav>

    <router-view />

    <footer v-if="showNav">
      <div id="footer-content">
        <p>Questo è un progetto universitario per il corso di Tecnologie Web dell'Alma Mater Studiorum.</p>
        <router-link id="doc-link" to="/doc" title="Documentazione del progetto" >Documentazione</router-link >
        <p id="copyright">Copyright © 2025 Matteo Toccarelli, Riccardo Cianci, Alice Zamagni.Tutti i diritti sono riservati.<br />Il progetto contiene anche codice del professore del corso sotto il diritto d'autore © 2024-2025 Fabio Vitali.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { isAuthenticated } from "./utils/auth";

export default {
  name: "App",

  computed: {
    appLayoutClass() {
      if (this.$route.meta.layout === "auth") {
        return "auth-layout";
      }
      return "default-layout";
    },
  },

  setup() {
    const route = useRoute();
  const dropdownOpen = ref(false);

    // Percorsi dove nav e footer non devono essere mostrati
    const noNavPathPrefixes = [
      "/login",
      "/signup",
      "/forgotpassword",
      "/resetpassword",
    ];

    // Computed property per verificare l'autenticazione
    const isAuthenticated1 = computed(() => {
      return isAuthenticated();
    });

    const showNav = computed(() => {
      // Controlla se il percorso corrente corrisponde a uno dei prefissi "no nav"
      const isNoNavPath = noNavPathPrefixes.some(
        (prefix) => route.path === prefix || route.path.startsWith(prefix + "/")
      );

      // Nascondi la nav se è un percorso "no nav" OPPURE se l'utente non è autenticato e si trova alla root
      return !isNoNavPath && !(route.path === "/" && !isAuthenticated1.value);
    });

    // Dropdown logic
    function toggleDropdown() {
      dropdownOpen.value = !dropdownOpen.value;
    }
    function closeDropdown() {
      dropdownOpen.value = false;
    }

    // Chiudi dropdown quando cambia route
    watch(
      () => route.path,
      () => {
        dropdownOpen.value = false;
      }
    );

    return { showNav, isAuthenticated1, dropdownOpen, toggleDropdown, closeDropdown };
  },
};
</script>

<style>
/* Variabili CSS per la coerenza del design */
:root {
  --primary-gradient: linear-gradient(135deg, #2d4a7a 0%, #357ba7 100%);
  --primary-color: #2d4a7a;
  --secondary-color: #00d2ff;
  --accent-color: #ba2815;
  --light-bg: #f9fafb;
  --card-bg: #ffffff;
  --card-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --border-radius: 1em;
  --text-color: #2c3e50;
  --text-light: #ffffff;
}

#app {
  background-image: url("@/assets/calendario.jpg");
  background-size: cover;
  background-position: center;
  font-family: "Poppins", Helvetica, Arial, sans-serif;
  width: 100%;
  min-height: 100vh;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--text-color);
}

/* Navbar */
nav {
  position: sticky;
  top: 0;
  width: 100%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5em 1em;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 100;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

/* Stile del logo */
#logo-container {
  text-decoration: none;
  padding: 0.5em 1em;
  border-radius: var(--border-radius);
  transition: transform 0.3s ease;
}
#logo-container:hover {
  transform: scale(1.05);
}

#logo {
  color: var(--text-light);
  font-weight: 700;
  font-size: 1.8em;
  text-shadow: 2px 2px rgba(0, 0, 0, 0.2);
}

/* Time Machine */
#time-machine {
  position: relative;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
  border-radius: var(--border-radius);
  padding: 0.6em 1.2em;
  margin: 0 1em;
  border: 2px solid rgba(255, 255, 255, 0.4);
  animation: accendi 3s infinite alternate;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

#time-machine:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);
}

.link-time-machine {
  display: flex;
  align-items: center;
  gap: 0.5em;
  color: white;
  font-weight: 600;
  text-decoration: none;
  font-size: 1.1em;
}

.time-icon {
  font-size: 1.3em;
}

@keyframes accendi {
  0% {
    box-shadow: 0 0 5px rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
  }
  100% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
    border-color: rgba(255, 255, 255, 0.8);
  }
}

/* Menù desktop */
#desktop-menu {
  display: flex;
  gap: 0.8em;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 0.5em;
  color: white;
  text-decoration: none;
  font-weight: 600;
  padding: 0.8em 1.2em;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.menu-link:hover {
  transform: translateY(-3px);
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.link-icon {
  font-size: 1.2em;
}

/* Stili specifici per ciascun link del menu */
.notes:hover {
  background: rgba(144, 238, 144, 0.3);
}

.calendar:hover {
  background: rgba(255, 182, 193, 0.3);
}

.pomodoro:hover {
  background: rgba(255, 69, 0, 0.3);
}

.profile:hover {
  background: rgba(173, 216, 230, 0.3);
}

/* Dropdown per mobile */
#dropdown {
  display: none;
  position: relative;
}

#dropdown-button {
  display: flex;
  align-items: center;
  gap: 0.5em;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.8em 1.2em;
  border-radius: var(--border-radius);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

#dropdown-button:hover {
  background: rgba(255, 255, 255, 0.25);
}

.menu-icon {
  font-size: 1.2em;
}

#dropdown-content {
  display: block;
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 0.5em;
  background: white;
  border-radius: var(--border-radius);
  box-shadow: var(--card-shadow);
  overflow: hidden;
  width: 200px;
  z-index: 101;
  animation: fadeInDown 0.3s ease;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#dropdown.open #dropdown-content {
  display: block;
}

.dropdown-link {
  display: flex;
  align-items: center;
  gap: 0.5em;
  padding: 1em;
  color: var(--text-color);
  text-decoration: none;
  transition: background 0.3s ease;
  font-weight: 500;
}

.dropdown-link:hover {
  background: var(--light-bg);
}

/* Footer */
footer {
  width: 100%;
  background: #111;
  color: #fff;
  padding: 0.7em 0 0.5em 0;
  margin-top: 0.5em;
  border-radius: var(--border-radius) var(--border-radius) 0 0;
  font-size: 0.95em;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.08);
}

#footer-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1em;
  text-align: center;
}


#doc-link {
  display: inline-block;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  margin: 0.5em 0 0.2em 0;
  padding: 0.3em 1em;
  border-radius: 1.2em;
  background: rgba(255,255,255,0.08);
  transition: all 0.2s ease;
  font-size: 0.97em;
}
#doc-link:hover {
  background: rgba(255,255,255,0.18);
  transform: translateY(-1px);
}

#copyright {
  font-size: 0.75em;
  opacity: 0.7;
  margin-top: 0.7em;
  line-height: 1.3;
}

/* Adattamento dimensione schermo */
@media (max-width: 856px) {
  nav {
    padding: 0.8em;
  }

  #desktop-menu {
    display: none;
  }

  #dropdown {
    display: block;
  }

  #time-machine {
    margin: 0;
    margin-left: auto;
    margin-right: 1em;
  }

  .logo-container {
    padding: 0.5em;
  }

  .logo {
    font-size: 1.5em;
  }
}

@media (max-width: 500px) {
  .link-time-machine span:not(.time-icon) {
    display: none;
  }

  #time-machine {
    padding: 0.6em;
  }

  .time-icon {
    font-size: 1.5em;
  }
}
</style>
