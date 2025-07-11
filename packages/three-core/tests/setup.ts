import '@testing-library/jest-dom';

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
  onload: null,
  onerror: null,
  onprogress: null,
}));

// 模拟 console 方法
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// 设置测试超时
jest.setTimeout(10000);

// 清理函数
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
}); 