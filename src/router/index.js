import BlockNotes from "@/components/BlockNotes.vue";
import CalendarPage from "@/components/calendar/CalendarPreview.vue";
import HomePage from "@/components/HomePage.vue";
import LogIn from "@/components/LogIn.vue";
import PomodoroTimer from "@/components/PomodoroTimer.vue";
import SignUp from "@/components/SignUp.vue";
import TimeMachine from "@/components/TimeMachine.vue";
import Relazione from "@/components/RelazioneDoc.vue";
import { createRouter, createWebHistory } from "vue-router";
import ForgotPassword from "@/components/ForgotPassword.vue";
import ResetPassword from "@/components/ResetPassword.vue";
import UserProfile from "@/components/UserProfile.vue";
import { isAuthenticated } from "@/utils/auth";
//import { ref } from 'vue';

const routes = [
  { path: "/notes", component: BlockNotes, meta: { requiresAuth: true } },
  { path: "/calendar", component: CalendarPage, meta: { requiresAuth: true } },
  { path: "/signup", component: SignUp },
  { path: "/pomodoro", component: PomodoroTimer, meta: { requiresAuth: true } },
  { path: "/doc", component: Relazione, meta: { requiresAuth: true } },
  { path: "/timeMachine", component: TimeMachine, meta: { requiresAuth: true } },
  { path: "/home", component: HomePage, meta: { requiresAuth: true } },
  { path: "/login", component: LogIn, meta: { layout: 'auth' } },
  { path: "/", component: LogIn, meta: { layout: 'auth' } }, // Da rivedere
  { path: "/forgotpassword", component: ForgotPassword, meta: { layout: 'auth' } },
  { path: "/resetpassword/:token", component: ResetPassword, meta: { layout: 'auth' } },
  { path: "/profile", component: UserProfile, meta: { requiresAuth: true } },
];


/*const uri = process.env.MONGO_URI;*/


/*
Routing lato client. Permette la navigazione tra i componenti
La funzione createRouter viene chiamata per creare una nuova istanza del router,
prendendo come argomento le opzioni di configurazione per il router.

  La prima opzione, 'history', è impostata sul risultato della chiamata a createWebHistory()
e configura il router per utilizzare la modalità di cronologia HTML5, che sfrutta l'API 
di cronologia del browser per gestire la navigazione senza ricaricare la pagina.

La seconda opzione, 'routes', è l'array predefinito di definizioni di rotte (quello
con `path` ed il componente definito sopra).
*/
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Aggiunta della guardia per la navigazione
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next("/login"); // Se non sei autenticato, vai alla pagina di login
  } else if (isAuthenticated() && to.path === "/") {
    next("/home"); // Se sei autenticato, vai alla rotta home
  } else {
    next(); // Permesso di navigare se autenticato o se la rotta non richiede autenticazione
  }
});

export default router;
