/**
 * main.js
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Composables
import { createApp } from 'vue'
import axios from 'axios'

axios.defaults.baseURL = `${process.env.VUE_APP_BASE_URL}:${process.env.VUE_APP_BASE_PORT}`

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
