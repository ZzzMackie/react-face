<template>
  <div class="three-resource-manager">
    <slot></slot>
  </div>
</template>

<script>
import { provide, ref, reactive, onMounted, onBeforeUnmount, inject } from 'vue';
import { ENGINE_INJECTION_KEY } from '../../constants';

export const RESOURCE_MANAGER_INJECTION_KEY = Symbol('ThreeResourceManager');

export default {
  props: {
    preload: {
      type: Boolean,
      default: false
    },
    maxConcurrent: {
      type: Number,
      default: 5
    },
    timeout: {
      type: Number,
      default: 30000 // 30秒超时
    }
  },
  emits: ['ready', 'progress', 'complete', 'error'],
  setup(props, { emit, slots }) {
    // 引擎引用
    const engine = inject(ENGINE_INJECTION_KEY, null);
    
    // 资源集合
    const resources = reactive(new Map());
    
    // 加载队列
    const loadingQueue = ref([]);
    
    // 当前正在加载的资源数量
    const loadingCount = ref(0);
    
    // 总进度
    const progress = ref(0);
    
    // 是否已完成所有加载
    const isComplete = ref(false);
    
    // 是否初始化完成
    const isReady = ref(false);
    
    // 加载器管理
    const loaders = reactive({
      texture: null,
      cubeTexture: null,
      model: null,
      audio: null,
      font: null,
    });
    
    // 初始化加载器
    const initLoaders = async () => {
      if (!engine || !engine.value) return;
      
      const THREE = engine.value.constructor.THREE;
      
      // 基本加载器
      loaders.texture = new THREE.TextureLoader();
      loaders.cubeTexture = new THREE.CubeTextureLoader();
      
      // 动态加载高级加载器
      try {
        const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
        const { DRACOLoader } = await import('three/examples/jsm/loaders/DRACOLoader.js');
        const { AudioLoader } = await import('three/examples/jsm/loaders/AudioLoader.js');
        const { FontLoader } = await import('three/examples/jsm/loaders/FontLoader.js');
        
        // 模型加载器
        loaders.model = new GLTFLoader();
        
        // 设置DRACO解码器
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
        loaders.model.setDRACOLoader(dracoLoader);
        
        // 音频加载器
        loaders.audio = new AudioLoader();
        
        // 字体加载器
        loaders.font = new FontLoader();
      } catch (error) {
        console.error('Failed to load advanced loaders:', error);
      }
      
      isReady.value = true;
      emit('ready', { loaders });
    };
    
    // 获取资源
    const getResource = (id) => {
      return resources.get(id);
    };
    
    // 添加资源
    const addResource = (id, resource) => {
      resources.set(id, resource);
      return resource;
    };
    
    // 移除资源
    const removeResource = (id) => {
      if (resources.has(id)) {
        const resource = resources.get(id);
        
        // 处理不同类型资源的清理
        if (resource.dispose && typeof resource.dispose === 'function') {
          resource.dispose();
        }
        
        resources.delete(id);
        return true;
      }
      return false;
    };
    
    // 清理所有资源
    const clearResources = () => {
      resources.forEach((resource, id) => {
        removeResource(id);
      });
      resources.clear();
    };
    
    // 添加加载任务
    const addLoadingTask = (task) => {
      loadingQueue.value.push(task);
      processQueue();
    };
    
    // 处理加载队列
    const processQueue = () => {
      if (loadingCount.value >= props.maxConcurrent || loadingQueue.value.length === 0) {
        return;
      }
      
      // 获取下一个任务
      const task = loadingQueue.value.shift();
      loadingCount.value++;
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        if (task.onTimeout) task.onTimeout();
        loadingCount.value--;
        updateProgress();
        processQueue();
      }, props.timeout);
      
      // 执行任务
      task.execute()
        .then((result) => {
          clearTimeout(timeoutId);
          
          // 如果任务有自己的完成回调
          if (task.onComplete) task.onComplete(result);
          
          loadingCount.value--;
          updateProgress();
          processQueue();
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          
          // 如果任务有自己的错误回调
          if (task.onError) task.onError(error);
          
          loadingCount.value--;
          updateProgress();
          processQueue();
          
          // 触发全局错误事件
          emit('error', { task, error });
        });
    };
    
    // 更新总进度
    const updateProgress = () => {
      const totalTasks = resources.size;
      const completedTasks = totalTasks - loadingQueue.value.length - loadingCount.value;
      
      if (totalTasks === 0) {
        progress.value = 1;
      } else {
        progress.value = completedTasks / totalTasks;
      }
      
      emit('progress', { 
        progress: progress.value,
        completed: completedTasks,
        total: totalTasks,
        remaining: loadingQueue.value.length + loadingCount.value
      });
      
      // 如果所有资源加载完成
      if (completedTasks === totalTasks && !isComplete.value) {
        isComplete.value = true;
        emit('complete', { resources });
      }
    };
    
    // 加载纹理
    const loadTexture = (url, id = url) => {
      return new Promise((resolve, reject) => {
        if (!loaders.texture) {
          reject(new Error('Texture loader not initialized'));
          return;
        }
        
        // 检查是否已经加载
        if (resources.has(id)) {
          resolve(resources.get(id));
          return;
        }
        
        // 创建加载任务
        addLoadingTask({
          execute: () => {
            return new Promise((resolve, reject) => {
              loaders.texture.load(
                url,
                (texture) => {
                  resolve(texture);
                },
                (progress) => {
                  // 纹理加载进度
                },
                (error) => {
                  reject(error);
                }
              );
            });
          },
          onComplete: (texture) => {
            addResource(id, texture);
            resolve(texture);
          },
          onError: (error) => {
            console.error(`Failed to load texture: ${url}`, error);
            reject(error);
          },
          onTimeout: () => {
            const error = new Error(`Texture loading timeout: ${url}`);
            console.error(error);
            reject(error);
          }
        });
      });
    };
    
    // 加载立方体纹理
    const loadCubeTexture = (urls, id = urls.join(',')) => {
      return new Promise((resolve, reject) => {
        if (!loaders.cubeTexture) {
          reject(new Error('CubeTexture loader not initialized'));
          return;
        }
        
        // 检查是否已经加载
        if (resources.has(id)) {
          resolve(resources.get(id));
          return;
        }
        
        // 创建加载任务
        addLoadingTask({
          execute: () => {
            return new Promise((resolve, reject) => {
              loaders.cubeTexture.load(
                urls,
                (texture) => {
                  resolve(texture);
                },
                (progress) => {
                  // 纹理加载进度
                },
                (error) => {
                  reject(error);
                }
              );
            });
          },
          onComplete: (texture) => {
            addResource(id, texture);
            resolve(texture);
          },
          onError: (error) => {
            console.error(`Failed to load cube texture: ${urls.join(', ')}`, error);
            reject(error);
          },
          onTimeout: () => {
            const error = new Error(`Cube texture loading timeout: ${urls.join(', ')}`);
            console.error(error);
            reject(error);
          }
        });
      });
    };
    
    // 加载模型
    const loadModel = (url, id = url) => {
      return new Promise((resolve, reject) => {
        if (!loaders.model) {
          reject(new Error('Model loader not initialized'));
          return;
        }
        
        // 检查是否已经加载
        if (resources.has(id)) {
          resolve(resources.get(id));
          return;
        }
        
        // 创建加载任务
        addLoadingTask({
          execute: () => {
            return new Promise((resolve, reject) => {
              loaders.model.load(
                url,
                (gltf) => {
                  resolve(gltf);
                },
                (progress) => {
                  // 模型加载进度
                },
                (error) => {
                  reject(error);
                }
              );
            });
          },
          onComplete: (gltf) => {
            addResource(id, gltf);
            resolve(gltf);
          },
          onError: (error) => {
            console.error(`Failed to load model: ${url}`, error);
            reject(error);
          },
          onTimeout: () => {
            const error = new Error(`Model loading timeout: ${url}`);
            console.error(error);
            reject(error);
          }
        });
      });
    };
    
    // 加载音频
    const loadAudio = (url, id = url) => {
      return new Promise((resolve, reject) => {
        if (!loaders.audio) {
          reject(new Error('Audio loader not initialized'));
          return;
        }
        
        // 检查是否已经加载
        if (resources.has(id)) {
          resolve(resources.get(id));
          return;
        }
        
        // 创建加载任务
        addLoadingTask({
          execute: () => {
            return new Promise((resolve, reject) => {
              loaders.audio.load(
                url,
                (audioBuffer) => {
                  resolve(audioBuffer);
                },
                (progress) => {
                  // 音频加载进度
                },
                (error) => {
                  reject(error);
                }
              );
            });
          },
          onComplete: (audioBuffer) => {
            addResource(id, audioBuffer);
            resolve(audioBuffer);
          },
          onError: (error) => {
            console.error(`Failed to load audio: ${url}`, error);
            reject(error);
          },
          onTimeout: () => {
            const error = new Error(`Audio loading timeout: ${url}`);
            console.error(error);
            reject(error);
          }
        });
      });
    };
    
    // 加载字体
    const loadFont = (url, id = url) => {
      return new Promise((resolve, reject) => {
        if (!loaders.font) {
          reject(new Error('Font loader not initialized'));
          return;
        }
        
        // 检查是否已经加载
        if (resources.has(id)) {
          resolve(resources.get(id));
          return;
        }
        
        // 创建加载任务
        addLoadingTask({
          execute: () => {
            return new Promise((resolve, reject) => {
              loaders.font.load(
                url,
                (font) => {
                  resolve(font);
                },
                (progress) => {
                  // 字体加载进度
                },
                (error) => {
                  reject(error);
                }
              );
            });
          },
          onComplete: (font) => {
            addResource(id, font);
            resolve(font);
          },
          onError: (error) => {
            console.error(`Failed to load font: ${url}`, error);
            reject(error);
          },
          onTimeout: () => {
            const error = new Error(`Font loading timeout: ${url}`);
            console.error(error);
            reject(error);
          }
        });
      });
    };
    
    // 提供资源管理器
    provide(RESOURCE_MANAGER_INJECTION_KEY, {
      resources,
      loaders,
      progress,
      isComplete,
      isReady,
      getResource,
      addResource,
      removeResource,
      clearResources,
      loadTexture,
      loadCubeTexture,
      loadModel,
      loadAudio,
      loadFont
    });
    
    // 组件挂载和卸载
    onMounted(() => {
      initLoaders();
    });
    
    onBeforeUnmount(() => {
      clearResources();
    });
    
    return {
      resources,
      loaders,
      progress,
      isComplete,
      isReady,
      getResource,
      addResource,
      removeResource,
      clearResources,
      loadTexture,
      loadCubeTexture,
      loadModel,
      loadAudio,
      loadFont
    };
  }
};
</script>

<style scoped>
.three-resource-manager {
  display: none;
}
</style> 