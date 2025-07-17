// 简单的核心功能测试
import { Engine } from './core/Engine';
import { SceneManager } from './core/SceneManager';
import { MaterialManager } from './core/MaterialManager';
import { GeometryManager } from './core/GeometryManager';

async function testCoreFunctionality() {
  console.log('🧪 Testing core functionality...');

  try {
    // 测试Engine初始化
    const engine = new Engine({
      enableManagers: ['scene', 'camera', 'renderer']
    });
    
    await engine.initialize();
    console.log('✅ Engine initialized successfully');

    // 测试SceneManager
    const sceneManager = new SceneManager(null);
    await sceneManager.initialize();
    console.log('✅ SceneManager initialized successfully');

    // 测试MaterialManager
    const materialManager = new MaterialManager(null);
    await materialManager.initialize();
    const material = materialManager.createStandardMaterial('test', 0xff0000);
    console.log('✅ MaterialManager initialized successfully');

    // 测试GeometryManager
    const geometryManager = new GeometryManager(null);
    await geometryManager.initialize();
    const geometry = geometryManager.createBoxGeometry('test', 1, 1, 1);
    console.log('✅ GeometryManager initialized successfully');

    console.log('🎉 All core functionality tests passed!');
  } catch (error) {
    console.error('❌ Core functionality test failed:', error);
  }
}

// 如果直接运行此文件，执行测试
if (require.main === module) {
  testCoreFunctionality();
}

export { testCoreFunctionality }; 