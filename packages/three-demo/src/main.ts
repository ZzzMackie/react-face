import { createApp } from 'vue'
import App from './App.vue'
import ThreeRender from 'three-render'

const app = createApp(App)

// 使用 three-render 插件
app.use(ThreeRender)

app.mount('#app') 