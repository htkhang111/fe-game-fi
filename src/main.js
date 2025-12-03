import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import CSS gốc của bạn (Hãy chắc chắn bạn đã copy file style.css vào thư mục src/assets/css/)
import './assets/css/style.css'

const app = createApp(App)

app.use(createPinia()) // Kích hoạt Pinia
app.use(router)      // Kích hoạt Router

app.mount('#app')