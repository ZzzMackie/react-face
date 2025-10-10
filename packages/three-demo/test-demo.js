const fs = require('fs')
const path = require('path')

console.log('🧪 测试 Three.js 演示包...')

// 检查必要文件是否存在
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'index.html',
  'src/main.ts',
  'src/App.vue',
  'src/demos/BasicScene.vue',
  'src/demos/GeometryDemo.vue',
  'src/demos/MaterialDemo.vue',
  'src/demos/LightingDemo.vue',
  'src/demos/AnimationDemo.vue',
  'src/demos/PhysicsDemo.vue'
]

let allFilesExist = true

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file)
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - 文件不存在`)
    allFilesExist = false
  }
})

if (allFilesExist) {
  console.log('\n🎉 所有文件都存在！')
  console.log('\n📋 下一步：')
  console.log('1. 确保已安装依赖：pnpm install')
  console.log('2. 启动开发服务器：pnpm dev')
  console.log('3. 在浏览器中打开 http://localhost:3001')
} else {
  console.log('\n❌ 缺少一些文件，请检查项目结构')
  process.exit(1)
} 