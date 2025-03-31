 
/* eslint-disable no-useless-escape */
import * as THREE from 'three';
const name = 'threejs-editor';

const storage: { [key: string]: string | boolean | number } = {
  language: 'en',

  autosave: true,

  'project/title': 'Scene Name',
  'project/editable': false,
  'project/vr': false,

  'project/renderer/antialias': true,
  'project/renderer/shadows': true,
  'project/renderer/shadowType': 1, // PCF
  'project/renderer/toneMapping': 4, // ACESFilmic
  'project/renderer/toneMappingExposure': 1,
  'project/renderer/ClearColor/backgroundColor': '#f8f8f8',
  'project/renderer/ClearColor/backgroundOpacity': 1,

  'settings/history': false,

  'settings/shortcuts/translate': 'w',
  'settings/shortcuts/rotate': 'e',
  'settings/shortcuts/scale': 'r',
  'settings/shortcuts/undo': 'z',
  'settings/shortcuts/focus': 'f',

  'THREE/UVMapping': THREE.UVMapping,
  'THREE/CubeReflectionMapping': THREE.CubeReflectionMapping,
  'THREE/CubeRefractionMapping': THREE.CubeRefractionMapping,
  'THREE/EquirectangularReflectionMapping': THREE.EquirectangularReflectionMapping,
  'THREE/EquirectangularRefractionMapping': THREE.EquirectangularRefractionMapping,
  'THREE/CubeUVReflectionMapping': THREE.CubeUVReflectionMapping
};
export default class Config {
  constructor() {}
  getKey(key: string) {
    return storage[key];
  }

  setKey(...args: []) {
    // key, value, key, value ...

    for (let i = 0, l = args.length; i < l; i += 2) {
      storage[args[i]] = args[i + 1];
    }

    // 将 Date 对象格式化为 HH:MM:SS 的字符串
    const timeString = new Date().toLocaleTimeString([], {hour12: false});
    const match = timeString.match(/\d\d\:\d\d\:\d\d/);

    // 检查 match 是否为 null
    if (match) {
      console.log('[' + match[0] + ']', 'Saved config to LocalStorage.');
    } else {
      console.log('[时间格式匹配失败]', 'Saved config to LocalStorage.');
    }
  }
  clear() {
    delete window.localStorage[name];
  }
}
