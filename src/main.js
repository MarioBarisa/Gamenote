import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import router from './router'
import { useUserStore } from './stores/user'
import { pageFailure } from './services/pageFailure'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

const app = createApp(App)
window.addEventListener('vite:preloadError', event => {
  event.preventDefault()
  pageFailure.value = true
})

app.use(pinia)
useUserStore(pinia).initializeAuth().catch(() => { /* Pogrešku prikazuje početni ekran. */ })
app.use(router)

if (['/', '/privacy', '/tos'].includes(window.location.pathname.replace(/\/+$/, '') || '/')) {
  router.isReady().then(() => app.mount('#app')).catch(() => app.mount('#app'))
} else {
  app.mount('#app')
}
