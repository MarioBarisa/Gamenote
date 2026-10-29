import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import { useUserStore } from './stores/user'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)

app.use(pinia)
useUserStore(pinia).initializeAuth().catch(() => { /* Pogrešku prikazuje početni ekran. */ })
app.use(router)

app.mount('#app')
