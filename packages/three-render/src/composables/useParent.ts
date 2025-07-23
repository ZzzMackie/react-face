import { ref, provide, Ref } from 'vue';
import { Object3D } from 'three';
import { PARENT_INJECTION_KEY } from '../constants';

/**
 * 提供父对象给子组件使用的组合式API
 * @param object 父对象
 */
export function useParent(object: Ref<Object3D | null>) {
  provide(PARENT_INJECTION_KEY, object);
  return object;
} 