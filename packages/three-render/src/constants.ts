import { InjectionKey } from 'vue';

// 画布注入键
export const CANVAS_INJECTION_KEY = Symbol('canvas') as InjectionKey<any>;

// 场景注入键
export const SCENE_INJECTION_KEY = Symbol('scene') as InjectionKey<any>;

// 相机注入键
export const CAMERA_INJECTION_KEY = Symbol('camera') as InjectionKey<any>;

// 父对象注入键
export const PARENT_INJECTION_KEY = Symbol('parent') as InjectionKey<any>;

// 物理世界注入键
export const PHYSICS_WORLD_INJECTION_KEY = Symbol('physics-world') as InjectionKey<any>;

// 后处理注入键
export const POSTPROCESSING_INJECTION_KEY = Symbol('postprocessing') as InjectionKey<any>;

// 射线投射器注入键
export const RAYCASTER_INJECTION_KEY = Symbol('raycaster') as InjectionKey<any>;

// 资源管理器注入键
export const RESOURCE_MANAGER_INJECTION_KEY = Symbol('resource-manager') as InjectionKey<any>;

// 控制器注入键
export const CONTROLS_INJECTION_KEY = Symbol('controls') as InjectionKey<any>;

// 性能监控注入键
export const STATS_INJECTION_KEY = Symbol('stats') as InjectionKey<any>;

// 动画混合器注入键
export const ANIMATION_MIXER_INJECTION_KEY = Symbol('animation-mixer') as InjectionKey<any>;

// 动画剪辑注入键
export const ANIMATION_CLIP_INJECTION_KEY = Symbol('animation-clip') as InjectionKey<any>;

// 粒子系统注入键
export const PARTICLE_SYSTEM_INJECTION_KEY = Symbol('particle-system') as InjectionKey<any>;

// 粒子发射器注入键
export const PARTICLE_EMITTER_INJECTION_KEY = Symbol('particle-emitter') as InjectionKey<any>;

// 事件管理器注入键
export const EVENTS_INJECTION_KEY = Symbol('events') as InjectionKey<any>; 