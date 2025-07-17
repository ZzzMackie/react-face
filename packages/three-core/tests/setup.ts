// 模拟 WebGL 上下文
const mockWebGLContext = {
  canvas: document.createElement('canvas'),
  drawArrays: jest.fn(),
  drawElements: jest.fn(),
  createBuffer: jest.fn(() => ({})),
  bindBuffer: jest.fn(),
  bufferData: jest.fn(),
  createProgram: jest.fn(() => ({})),
  createShader: jest.fn(() => ({})),
  shaderSource: jest.fn(),
  compileShader: jest.fn(),
  attachShader: jest.fn(),
  linkProgram: jest.fn(),
  useProgram: jest.fn(),
  getAttribLocation: jest.fn(() => 0),
  getUniformLocation: jest.fn(() => ({})),
  uniformMatrix4fv: jest.fn(),
  uniform3fv: jest.fn(),
  uniform1f: jest.fn(),
  uniform1i: jest.fn(),
  enableVertexAttribArray: jest.fn(),
  vertexAttribPointer: jest.fn(),
  clearColor: jest.fn(),
  clear: jest.fn(),
  viewport: jest.fn(),
  enable: jest.fn(),
  disable: jest.fn(),
  blendFunc: jest.fn(),
  depthFunc: jest.fn(),
  cullFace: jest.fn(),
  frontFace: jest.fn(),
  polygonOffset: jest.fn(),
  lineWidth: jest.fn(),
  pointSize: jest.fn(),
  scissor: jest.fn(),
  colorMask: jest.fn(),
  depthMask: jest.fn(),
  stencilMask: jest.fn(),
  stencilFunc: jest.fn(),
  stencilOp: jest.fn(),
  clearDepth: jest.fn(),
  clearStencil: jest.fn(),
  createTexture: jest.fn(() => ({})),
  bindTexture: jest.fn(),
  texImage2D: jest.fn(),
  texParameteri: jest.fn(),
  generateMipmap: jest.fn(),
  createFramebuffer: jest.fn(() => ({})),
  bindFramebuffer: jest.fn(),
  framebufferTexture2D: jest.fn(),
  checkFramebufferStatus: jest.fn(() => 36053), // FRAMEBUFFER_COMPLETE
  createRenderbuffer: jest.fn(() => ({})),
  bindRenderbuffer: jest.fn(),
  renderbufferStorage: jest.fn(),
  framebufferRenderbuffer: jest.fn(),
  deleteFramebuffer: jest.fn(),
  deleteRenderbuffer: jest.fn(),
  deleteTexture: jest.fn(),
  deleteBuffer: jest.fn(),
  deleteProgram: jest.fn(),
  deleteShader: jest.fn(),
  getError: jest.fn(() => 0),
  getParameter: jest.fn((param) => {
    switch (param) {
      case 34921: return 8; // MAX_VERTEX_UNIFORM_VECTORS
      case 34922: return 8; // MAX_FRAGMENT_UNIFORM_VECTORS
      case 35660: return 16; // MAX_VERTEX_ATTRIBS
      case 34047: return 4096; // MAX_TEXTURE_SIZE
      case 34930: return 16; // MAX_VERTEX_TEXTURE_IMAGE_UNITS
      case 35661: return 8; // MAX_VERTEX_UNIFORM_VECTORS
      case 35662: return 8; // MAX_VARYING_VECTORS
      case 35720: return 8; // MAX_COMBINED_TEXTURE_IMAGE_UNITS
      case 35721: return 8; // MAX_VERTEX_UNIFORM_VECTORS
      case 35722: return 8; // MAX_FRAGMENT_UNIFORM_VECTORS
      default: return 0;
    }
  }),
  getExtension: jest.fn((name) => {
    if (name === 'WEBGL_debug_renderer_info') {
      return {
        UNMASKED_VENDOR_WEBGL: 0x9245,
        UNMASKED_RENDERER_WEBGL: 0x9246
      };
    }
    return null;
  })
};

// 模拟 HTMLCanvasElement
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  value: jest.fn((contextId) => {
    if (contextId === 'webgl' || contextId === 'webgl2') {
      return mockWebGLContext;
    }
    return null;
  })
});

// 模拟 Three.js 核心类
const mockThree = {
  Ray: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    copy: jest.fn(),
    clone: jest.fn(),
    lookAt: jest.fn(),
    at: jest.fn(),
    recast: jest.fn(),
    intersectSphere: jest.fn(),
    intersectPlane: jest.fn(),
    intersectBox: jest.fn(),
    intersectTriangle: jest.fn(),
    applyMatrix4: jest.fn()
  })),
  Vector3: jest.fn().mockImplementation((x = 0, y = 0, z = 0) => ({
    x, y, z,
    set: jest.fn(),
    copy: jest.fn(),
    clone: jest.fn(),
    add: jest.fn(),
    sub: jest.fn(),
    multiply: jest.fn(),
    divide: jest.fn(),
    length: jest.fn(() => Math.sqrt(x * x + y * y + z * z)),
    normalize: jest.fn(),
    distanceTo: jest.fn(),
    dot: jest.fn(),
    cross: jest.fn()
  })),
  Matrix4: jest.fn().mockImplementation(() => ({
    elements: new Array(16).fill(0),
    set: jest.fn(),
    copy: jest.fn(),
    clone: jest.fn(),
    multiply: jest.fn(),
    multiplyMatrices: jest.fn(),
    makeTranslation: jest.fn(),
    makeRotationX: jest.fn(),
    makeRotationY: jest.fn(),
    makeRotationZ: jest.fn(),
    makeScale: jest.fn(),
    compose: jest.fn(),
    decompose: jest.fn(),
    lookAt: jest.fn(),
    invert: jest.fn(),
    transpose: jest.fn()
  })),
  Quaternion: jest.fn().mockImplementation(() => ({
    x: 0, y: 0, z: 0, w: 1,
    set: jest.fn(),
    copy: jest.fn(),
    clone: jest.fn(),
    setFromAxisAngle: jest.fn(),
    setFromEuler: jest.fn(),
    setFromRotationMatrix: jest.fn(),
    multiply: jest.fn(),
    multiplyQuaternions: jest.fn(),
    slerp: jest.fn(),
    normalize: jest.fn()
  })),
  Euler: jest.fn().mockImplementation(() => ({
    x: 0, y: 0, z: 0,
    order: 'XYZ',
    set: jest.fn(),
    copy: jest.fn(),
    clone: jest.fn(),
    setFromRotationMatrix: jest.fn(),
    setFromQuaternion: jest.fn(),
    reorder: jest.fn()
  })),
  Sphere: jest.fn().mockImplementation(() => ({
    center: { x: 0, y: 0, z: 0 },
    radius: 1,
    set: jest.fn(),
    copy: jest.fn(),
    clone: jest.fn(),
    setFromPoints: jest.fn(),
    containsPoint: jest.fn(),
    distanceToPoint: jest.fn(),
    intersectsSphere: jest.fn(),
    intersectsBox: jest.fn(),
    intersectsPlane: jest.fn(),
    clampPoint: jest.fn(),
    getBoundingBox: jest.fn(),
    applyMatrix4: jest.fn(),
    translate: jest.fn(),
    expandByPoint: jest.fn(),
    expandByScalar: jest.fn(),
    union: jest.fn(),
    equals: jest.fn(),
    isEmpty: jest.fn()
  })),
  Box3: jest.fn().mockImplementation(() => ({
    min: { x: -1, y: -1, z: -1 },
    max: { x: 1, y: 1, z: 1 },
    set: jest.fn(),
    copy: jest.fn(),
    clone: jest.fn(),
    makeEmpty: jest.fn(),
    isEmpty: jest.fn(),
    getCenter: jest.fn(),
    getSize: jest.fn(),
    expandByPoint: jest.fn(),
    expandByVector: jest.fn(),
    expandByScalar: jest.fn(),
    containsPoint: jest.fn(),
    containsBox: jest.fn(),
    getParameter: jest.fn(),
    intersectsBox: jest.fn(),
    intersectsSphere: jest.fn(),
    intersectsPlane: jest.fn(),
    clampPoint: jest.fn(),
    distanceToPoint: jest.fn(),
    getBoundingSphere: jest.fn(),
    intersect: jest.fn(),
    union: jest.fn(),
    applyMatrix4: jest.fn(),
    translate: jest.fn(),
    equals: jest.fn()
  })),
  Plane: jest.fn().mockImplementation(() => ({
    normal: { x: 0, y: 1, z: 0 },
    constant: 0,
    set: jest.fn(),
    copy: jest.fn(),
    clone: jest.fn(),
    setComponents: jest.fn(),
    setFromNormalAndCoplanarPoint: jest.fn(),
    setFromCoplanarPoints: jest.fn(),
    normalize: jest.fn(),
    negate: jest.fn(),
    distanceToPoint: jest.fn(),
    distanceToSphere: jest.fn(),
    projectPoint: jest.fn(),
    intersectLine: jest.fn(),
    intersectsLine: jest.fn(),
    intersectsBox: jest.fn(),
    intersectsSphere: jest.fn(),
    coplanarPoint: jest.fn(),
    applyMatrix4: jest.fn(),
    translate: jest.fn(),
    equals: jest.fn()
  })),
  Triangle: jest.fn().mockImplementation(() => ({
    a: { x: 0, y: 0, z: 0 },
    b: { x: 1, y: 0, z: 0 },
    c: { x: 0, y: 1, z: 0 },
    set: jest.fn(),
    copy: jest.fn(),
    clone: jest.fn(),
    setFromPointsAndIndices: jest.fn(),
    setFromAttributeAndIndices: jest.fn(),
    getNormal: jest.fn(),
    getBarycoord: jest.fn(),
    getUV: jest.fn(),
    getInterpolation: jest.fn(),
    getPlaneConstant: jest.fn(),
    getArea: jest.fn(),
    getMidpoint: jest.fn(),
    getNormal: jest.fn(),
    getBarycoord: jest.fn(),
    getUV: jest.fn(),
    getInterpolation: jest.fn(),
    getPlaneConstant: jest.fn(),
    getArea: jest.fn(),
    getMidpoint: jest.fn()
  }))
};

// 模拟 three/examples 模块
jest.mock('three/examples/jsm/controls/OrbitControls', () => ({
  OrbitControls: jest.fn().mockImplementation(() => ({
    enabled: true,
    target: { x: 0, y: 0, z: 0 },
    minDistance: 0,
    maxDistance: Infinity,
    minZoom: 0,
    maxZoom: Infinity,
    minPolarAngle: 0,
    maxPolarAngle: Math.PI,
    minAzimuthAngle: -Infinity,
    maxAzimuthAngle: Infinity,
    enableDamping: false,
    dampingFactor: 0.05,
    enableZoom: true,
    zoomSpeed: 1.0,
    enableRotate: true,
    rotateSpeed: 1.0,
    enablePan: true,
    panSpeed: 1.0,
    screenSpacePanning: true,
    keyPanSpeed: 7.0,
    autoRotate: false,
    autoRotateSpeed: 2.0,
    enableKeys: true,
    keyCodes: { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 },
    mouseButtons: { LEFT: 0, MIDDLE: 1, RIGHT: 2 },
    touches: { ONE: 1, TWO: 2 },
    update: jest.fn(),
    reset: jest.fn(),
    saveState: jest.fn(),
    restoreState: jest.fn(),
    dispose: jest.fn(),
    getAzimuthalAngle: jest.fn(() => 0),
    getPolarAngle: jest.fn(() => 0),
    listenToKeyEvents: jest.fn(),
    stopListenToKeyEvents: jest.fn()
  }))
}));

jest.mock('three/examples/jsm/controls/TransformControls', () => ({
  TransformControls: jest.fn().mockImplementation(() => ({
    size: 1,
    showX: true,
    showY: true,
    showZ: true,
    mode: 'translate',
    translationSnap: null,
    rotationSnap: null,
    scaleSnap: null,
    space: 'local',
    enabled: true,
    dragging: false,
    object: null,
    attach: jest.fn(),
    detach: jest.fn(),
    getMode: jest.fn(() => 'translate'),
    setMode: jest.fn(),
    setTranslationSnap: jest.fn(),
    setRotationSnap: jest.fn(),
    setScaleSnap: jest.fn(),
    setSize: jest.fn(),
    setSpace: jest.fn(),
    setTra: jest.fn(),
    setRot: jest.fn(),
    setScale: jest.fn(),
    setX: jest.fn(),
    setY: jest.fn(),
    setZ: jest.fn(),
    update: jest.fn(),
    dispose: jest.fn()
  }))
}));

// 模拟 three 模块
jest.mock('three', () => ({
  ...mockThree,
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    setClearColor: jest.fn(),
    render: jest.fn(),
    dispose: jest.fn(),
    domElement: document.createElement('canvas'),
    capabilities: {
      isWebGL2: true,
      maxTextureSize: 4096,
      maxAnisotropy: 16
    },
    info: {
      render: { calls: 0, triangles: 0, points: 0, lines: 0 },
      memory: { geometries: 0, textures: 0 }
    }
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
    remove: jest.fn(),
    children: [],
    background: null,
    fog: null
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn(), copy: jest.fn() },
    lookAt: jest.fn(),
    updateMatrix: jest.fn(),
    updateMatrixWorld: jest.fn(),
    fov: 75,
    aspect: 1,
    near: 0.1,
    far: 1000
  })),
  AmbientLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    intensity: 1
  })),
  DirectionalLight: jest.fn().mockImplementation(() => ({
    position: { set: jest.fn() },
    intensity: 1,
    castShadow: false
  })),
  Color: jest.fn().mockImplementation(() => ({
    setHex: jest.fn(),
    setRGB: jest.fn(),
    getHex: jest.fn(() => 0x000000)
  })),
  Clock: jest.fn().mockImplementation(() => ({
    getDelta: jest.fn(() => 0.016),
    getElapsedTime: jest.fn(() => 0)
  }))
}));

// 模拟 requestAnimationFrame
global.requestAnimationFrame = jest.fn((callback) => {
  return setTimeout(callback, 16);
});

// 模拟 cancelAnimationFrame
global.cancelAnimationFrame = jest.fn((id) => {
  clearTimeout(id);
});

// 模拟 ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟 IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// 模拟 AudioContext
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { setValueAtTime: jest.fn() }
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: { setValueAtTime: jest.fn() }
  })),
  createBufferSource: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    buffer: null
  })),
  createAnalyser: jest.fn(() => ({
    connect: jest.fn(),
    frequencyBinCount: 1024,
    getByteFrequencyData: jest.fn(),
    getByteTimeDomainData: jest.fn()
  })),
  decodeAudioData: jest.fn(() => Promise.resolve({})),
  suspend: jest.fn(),
  resume: jest.fn(),
  close: jest.fn()
}));

// 模拟 Web Audio API
global.AudioBuffer = jest.fn().mockImplementation(() => ({
  duration: 1.0,
  numberOfChannels: 2,
  length: 44100,
  sampleRate: 44100,
  getChannelData: jest.fn(() => new Float32Array(44100))
}));

// 模拟 localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// 模拟 sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// 模拟 IndexedDB
global.indexedDB = {
  open: jest.fn(() => ({
    result: {
      createObjectStore: jest.fn(),
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          put: jest.fn(() => ({})),
          get: jest.fn(() => ({})),
          delete: jest.fn(() => ({})),
          clear: jest.fn(() => ({})),
          openCursor: jest.fn(() => ({})),
          count: jest.fn(() => ({})),
        })),
      })),
    },
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
  })),
  deleteDatabase: jest.fn(),
};

// 模拟 File API
global.File = jest.fn().mockImplementation(() => ({
  name: 'test.txt',
  size: 1024,
  type: 'text/plain',
  lastModified: Date.now(),
}));

global.FileReader = jest.fn().mockImplementation(() => ({
  readAsText: jest.fn(),
  readAsArrayBuffer: jest.fn(),
  result: null,
  onload: null,
  onerror: null,
}));

// 模拟 Blob
global.Blob = jest.fn().mockImplementation(() => ({
  size: 1024,
  type: 'application/octet-stream',
  arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(1024))),
  text: jest.fn(() => Promise.resolve('test')),
}));

// 模拟 URL
global.URL = {
  createObjectURL: jest.fn(() => 'blob:test'),
  revokeObjectURL: jest.fn(),
};

// 模拟 fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
    text: () => Promise.resolve('test'),
  })
);

// 模拟 XMLHttpRequest
global.XMLHttpRequest = jest.fn().mockImplementation(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: 'test',
  response: 'test',
  onreadystatechange: null,
  onload: null,
  onerror: null,
}));

// 模拟 performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    memory: {
      usedJSHeapSize: 1024 * 1024, // 1MB
      totalJSHeapSize: 2 * 1024 * 1024, // 2MB
      jsHeapSizeLimit: 10 * 1024 * 1024 // 10MB
    }
  },
  writable: true
});

// 模拟 console methods
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// 模拟 Error constructor
global.Error = jest.fn().mockImplementation((message) => ({
  message,
  name: 'Error',
  stack: 'Error stack'
}));

// 模拟 setTimeout and setInterval
global.setTimeout = jest.fn((callback, delay) => {
  // 避免递归调用
  return 1; // 返回一个模拟的 timer ID
});

global.setInterval = jest.fn((callback, delay) => {
  // 避免递归调用
  return 2; // 返回一个模拟的 timer ID
});

global.clearTimeout = jest.fn((id) => {
  // 避免递归调用
});

global.clearInterval = jest.fn((id) => {
  // 避免递归调用
});

// Mock essential three/examples loaders with proper default exports
// Remove all loader mocks to avoid recursive stack overflow
// Tests will use real Three.js modules instead 