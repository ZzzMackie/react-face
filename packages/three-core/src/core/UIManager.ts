import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface UIConfig {
  enableRaycasting?: boolean;
  enableHover?: boolean;
  enableClick?: boolean;
  hoverDistance?: number;
}

export interface UIElement {
  id: string;
  mesh: THREE.Mesh;
  interactive: boolean;
  hovered: boolean;
  clicked: boolean;
  onHover?: () => void;
  onUnhover?: () => void;
  onClick?: () => void;
}

/**
 * UI 管理�?
 * 负责管理交互�?UI 元素
 */
export class UIManager implements Manager {
  // Add test expected properties
  public readonly name = 'UIManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private elements: Map<string, UIElement> = new Map();
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private camera: THREE.Camera | null = null;
  private config: UIConfig;

  // 信号系统
  public readonly elementAdded = createSignal<UIElement | null>(null);
  public readonly elementRemoved = createSignal<string | null>(null);
  public readonly elementHovered = createSignal<string | null>(null);
  public readonly elementUnhovered = createSignal<string | null>(null);
  public readonly elementClicked = createSignal<string | null>(null);

  constructor(engine: unknown, config: UIConfig = {}) {
    this.engine = engine;
    this.config = {
      enableRaycasting: true,
      enableHover: true,
      enableClick: true,
      hoverDistance: 10,
      ...config
    };
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
  }

  async initialize(): Promise<void> {
    this.setupEventListeners();
  this.initialized = true;}

  dispose(): void {
    this.removeAllElements();
    this.removeEventListeners();
  this.initialized = false;}

  private setupEventListeners(): void {
    if (this.config.enableHover) {
      document.addEventListener('mousemove', this.onMouseMove.bind(this));
    }
    
    if (this.config.enableClick) {
      document.addEventListener('click', this.onClick.bind(this));
    }
  }

  private removeEventListeners(): void {
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
    document.removeEventListener('click', this.onClick.bind(this));
  }

  private onMouseMove(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    this.updateHover();
  }

  private onClick(event: MouseEvent): void {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    this.updateClick();
  }

  private updateHover(): void {
    if (!this.camera) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.elements.values()).map(element => element.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    // 重置所有元素的悬停状�?
    this.elements.forEach(element => {
      if (element.hovered) {
        element.hovered = false;
        element.onUnhover?.();
        this.elementUnhovered.emit(element.id);
      }
    });

    // 设置新悬停的元素
    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object;
      const element = Array.from(this.elements.values()).find(el => el.mesh === intersectedMesh);
      
      if (element && element.interactive) {
        element.hovered = true;
        element.onHover?.();
        this.elementHovered.emit(element.id);
      }
    }
  }

  private updateClick(): void {
    if (!this.camera) return;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = Array.from(this.elements.values()).map(element => element.mesh);
    const intersects = this.raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const intersectedMesh = intersects[0].object;
      const element = Array.from(this.elements.values()).find(el => el.mesh === intersectedMesh);
      
      if (element && element.interactive) {
        element.clicked = true;
        element.onClick?.();
        this.elementClicked.emit(element.id);
      }
    }
  }

  addElement(
    id: string,
    mesh: THREE.Mesh,
    interactive: boolean = true,
    callbacks?: {
      onHover?: () => void;
      onUnhover?: () => void;
      onClick?: () => void;
    }
  ): void {
    const element: UIElement = {
      id,
      mesh,
      interactive,
      hovered: false,
      clicked: false,
      ...callbacks
    };

    this.elements.set(id, element);
    this.elementAdded.emit(element);
  }

  removeElement(id: string): void {
    if (this.elements.has(id)) {
      this.elements.delete(id);
      this.elementRemoved.emit(id);
    }
  }

  getElement(id: string): UIElement | undefined {
    return this.elements.get(id);
  }

  hasElement(id: string): boolean {
    return this.elements.has(id);
  }

  setElementInteractive(id: string, interactive: boolean): void {
    const element = this.elements.get(id);
    if (element) {
      element.interactive = interactive;
    }
  }

  setElementCallbacks(
    id: string,
    callbacks: {
      onHover?: () => void;
      onUnhover?: () => void;
      onClick?: () => void;
    }
  ): void {
    const element = this.elements.get(id);
    if (element) {
      Object.assign(element, callbacks);
    }
  }

  setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  getAllElements(): UIElement[] {
    return Array.from(this.elements.values());
  }

  getInteractiveElements(): UIElement[] {
    return Array.from(this.elements.values()).filter(element => element.interactive);
  }

  removeAllElements(): void {
    this.elements.clear();
  }

  update(): void {
    // 更新逻辑可以在这里添�?
  }
}