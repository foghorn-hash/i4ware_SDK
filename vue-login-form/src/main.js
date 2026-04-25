import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';
import i18n from './i18n';

createApp(App)
  .use(router)
  .use(createPinia())
  .use(i18n)
  .mount('#app');