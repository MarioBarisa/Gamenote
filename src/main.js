import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router' // Dodaj ovo

const app = createApp(App)
app.use(createPinia())
app.use(router) // Dodaj ovo
app.mount('#app')
