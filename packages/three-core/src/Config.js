/* eslint-disable no-useless-escape */
import * as THREE from 'three';
const name = 'threejs-editor';

const storage = {
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
  getKey(key) {
    return storage[key];
  }

  setKey() {
    // key, value, key, value ...

    for (let i = 0, l = arguments.length; i < l; i += 2) {
      storage[arguments[i]] = arguments[i + 1];
    }

    console.log('[' + /\d\d\:\d\d\:\d\d/.exec(new Date())[0] + ']', 'Saved config to LocalStorage.');
  }

  clear() {
    delete window.localStorage[name];
  }
}
