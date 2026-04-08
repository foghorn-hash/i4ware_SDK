import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

import i18n from './i18n';

const i18n = createI18n({
  legacy: false,
  locale: 'fi',
  fallbackLocale: 'en',
  messages: { en, fi, sv },
});

createApp(App)
  .use(router)
  .use(createPinia())
  .use(i18n)
  .mount('#app');