import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import 'bootstrap/dist/css/bootstrap.min.css';

const app = createApp(App);
app.use(router);
app.use(FontAwesomeIcon);
app.mount('#app');
