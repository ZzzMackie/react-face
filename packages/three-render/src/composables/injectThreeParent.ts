import { inject, Ref } from 'vue';
import { Object3D } from 'three';
import { PARENT_INJECTION_KEY } from '../constants';

/**
 * 注入父对象的组合式API
 * @returns 父对象引用
 */
export function injectThreeParent(): Ref<Object3D | null> {
  const parent = inject(PARENT_INJECTION_KEY, null);
  
  if (!parent) {
    console.warn('No parent object provided. Make sure this component is used within a ThreeObject or ThreeMesh component.');
    return { value: null } as Ref<Object3D | null>;
  }
  
  return parent;
} 