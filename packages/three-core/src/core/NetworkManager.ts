import * as THREE from 'three';
// Local Manager interface
export interface Manager {
  initialize(): Promise<void>;
  dispose(): void;
}
import { createSignal } from './Signal';

export interface NetworkConfig {
  enableNetworking?: boolean;
  autoConnect?: boolean;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  url?: string;
  protocols?: string | string[];
  heartbeatInterval?: number;
  maxMessageSize?: number;
  binaryType?: BinaryType;
  messageCompression?: boolean;
  authToken?: string;
  roomId?: string;
  userId?: string;
  debug?: boolean;
}

export interface NetworkMessage {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  sender: string;
  room?: string;
  target?: string;
  priority?: 'high' | 'normal' | 'low';
  reliable?: boolean;
  compressed?: boolean;
}

export interface NetworkRoom {
  id: string;
  name: string;
  users: string[];
  data?: any;
  private?: boolean;
  maxUsers?: number;
}

export interface NetworkUser {
  id: string;
  name?: string;
  role?: string;
  data?: any;
  isConnected?: boolean;
  lastSeen?: number;
}

export interface NetworkStats {
  sentMessages: number;
  receivedMessages: number;
  sentBytes: number;
  receivedBytes: number;
  latency: number;
  connectionUptime: number;
  reconnectAttempts: number;
  messageQueue: number;
}

/**
 * 网络管理器
 * 负责管理 WebSocket 连接和实时数据同步
 */
export class NetworkManager implements Manager {
  // Add test expected properties
  public readonly name = 'NetworkManager'.toLowerCase().replace('Manager', '');
  public initialized = false;
  private engine: unknown;
  private config: NetworkConfig;
  private socket: WebSocket | null = null;
  private connectionStartTime: number = 0;
  private reconnectCount: number = 0;
  private heartbeatInterval: number | null = null;
  private messageQueue: NetworkMessage[] = [];
  private pendingMessages: Map<string, { resolve: Function, reject: Function, timeout: number }> = new Map();
  private rooms: Map<string, NetworkRoom> = new Map();
  private users: Map<string, NetworkUser> = new Map();
  private messageHandlers: Map<string, ((message: NetworkMessage) => void)[]> = new Map();
  private stats: NetworkStats = {
    sentMessages: 0,
    receivedMessages: 0,
    sentBytes: 0,
    receivedBytes: 0,
    latency: 0,
    connectionUptime: 0,
    reconnectAttempts: 0,
    messageQueue: 0
  };
  private lastPingTime: number = 0;
  private isReconnecting: boolean = false;
  private reconnectTimer: number | null = null;
  private compressionSupported: boolean = false;

  // 信号系统
  public readonly connected = createSignal<{ url: string, userId: string } | null>(null);
  public readonly disconnected = createSignal<{ code: number, reason: string } | null>(null);
  public readonly messageReceived = createSignal<NetworkMessage | null>(null);
  public readonly messageSent = createSignal<NetworkMessage | null>(null);
  public readonly error = createSignal<Error | null>(null);
  public readonly roomJoined = createSignal<NetworkRoom | null>(null);
  public readonly roomLeft = createSignal<string | null>(null);
  public readonly userJoined = createSignal<NetworkUser | null>(null);
  public readonly userLeft = createSignal<string | null>(null);
  public readonly reconnecting = createSignal<number | null>(null);
  public readonly reconnected = createSignal<boolean | null>(null);

  constructor(engine: unknown, config: NetworkConfig = {}) {
    this.engine = engine;
    this.config = {
      enableNetworking: true,
      autoConnect: false,
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      url: 'ws://localhost:8080',
      heartbeatInterval: 30000,
      maxMessageSize: 1024 * 1024, // 1MB
      binaryType: 'arraybuffer',
      messageCompression: false,
      debug: false,
      ...config
    };

    // 检查是否支持压缩
    this.compressionSupported = typeof CompressionStream !== 'undefined';
    if (this.config.messageCompression && !this.compressionSupported) {
      console.warn('Message compression is enabled but not supported by this browser');
      this.config.messageCompression = false;
    }
  }

  async initialize(): Promise<void> {
    // 初始化网络系统
    this.initialized = true;
    
    if (this.config.autoConnect && this.config.url) {
      await this.connect(this.config.url, this.config.protocols);
    }
    
    console.log('🌐 NetworkManager initialized with config:', this.config);
  }

  dispose(): void {
    // 断开连接
    this.disconnect();
    
    // 清理资源
    this.clearHeartbeat();
    this.clearReconnectTimer();
    this.clearPendingMessages();
    this.messageQueue = [];
    this.messageHandlers.clear();
    this.rooms.clear();
    this.users.clear();
    
    this.initialized = false;
  }

  /**
   * 连接到 WebSocket 服务器
   */
  async connect(url: string = this.config.url!, protocols?: string | string[]): Promise<void> {
    if (this.socket && (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN)) {
      console.warn('Already connected or connecting to WebSocket server');
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(url, protocols);
        
        // 设置二进制数据类型
        this.socket.binaryType = this.config.binaryType!;
        
        // 连接建立时
        this.socket.onopen = (event) => {
          this.connectionStartTime = Date.now();
          this.reconnectCount = 0;
          this.isReconnecting = false;
          
          // 发送认证信息
          if (this.config.authToken) {
            this.sendAuthMessage();
          }
          
          // 启动心跳
          this.startHeartbeat();
          
          // 处理队列中的消息
          this.processMessageQueue();
          
          // 发送连接信号
          this.connected.emit({ 
            url, 
            userId: this.config.userId || 'anonymous'
          });
          
          this.log('Connected to WebSocket server:', url);
          resolve();
        };
        
        // 接收消息时
        this.socket.onmessage = async (event) => {
          try {
            let data = event.data;
            
            // 处理二进制数据
            if (data instanceof ArrayBuffer) {
              // 如果启用了压缩，解压数据
              if (this.config.messageCompression && this.compressionSupported) {
                data = await this.decompressData(data);
              }
              
              // 转换为字符串
              const decoder = new TextDecoder();
              data = decoder.decode(data);
            }
            
            // 解析消息
            const message = JSON.parse(data) as NetworkMessage;
            
            // 更新统计信息
            this.stats.receivedMessages++;
            this.stats.receivedBytes += data.length;
            
            // 处理特殊消息类型
            if (message.type === 'pong') {
              this.handlePongMessage(message);
              return;
            } else if (message.type === 'system') {
              this.handleSystemMessage(message);
              return;
            } else if (message.type === 'room') {
              this.handleRoomMessage(message);
              return;
            } else if (message.type === 'user') {
              this.handleUserMessage(message);
              return;
            }
            
            // 处理待处理的消息
            if (this.pendingMessages.has(message.id)) {
              const pending = this.pendingMessages.get(message.id)!;
              clearTimeout(pending.timeout);
              this.pendingMessages.delete(message.id);
              pending.resolve(message);
            }
            
            // 调用消息处理器
            this.triggerMessageHandlers(message);
            
            // 发送消息接收信号
            this.messageReceived.emit(message);
            
            this.log('Received message:', message);
          } catch (error) {
            this.error.emit(error as Error);
            console.error('Error processing received message:', error);
          }
        };
        
        // 连接关闭时
        this.socket.onclose = (event) => {
          const wasConnected = this.connectionStartTime > 0;
          
          // 清理心跳
          this.clearHeartbeat();
          
          // 发送断开连接信号
          this.disconnected.emit({
            code: event.code,
            reason: event.reason
          });
          
          this.log('Disconnected from WebSocket server:', event.code, event.reason);
          
          // 如果是意外断开且配置了重连，尝试重连
          if (wasConnected && event.code !== 1000 && !this.isReconnecting && this.config.reconnectAttempts! > 0) {
            this.attemptReconnect();
          } else {
            reject(new Error(`WebSocket disconnected: ${event.code} ${event.reason}`));
          }
        };
        
        // 发生错误时
        this.socket.onerror = (event) => {
          const error = new Error('WebSocket error');
          this.error.emit(error);
          console.error('WebSocket error:', event);
          
          // 如果连接尚未建立，拒绝 Promise
          if (this.connectionStartTime === 0) {
            reject(error);
          }
        };
      } catch (error) {
        this.error.emit(error as Error);
        console.error('Error connecting to WebSocket server:', error);
        reject(error);
      }
    });
  }

  /**
   * 断开 WebSocket 连接
   */
  disconnect(code: number = 1000, reason: string = 'Normal closure'): void {
    if (this.socket) {
      // 清理心跳和重连计时器
      this.clearHeartbeat();
      this.clearReconnectTimer();
      
      // 如果连接已建立，正常关闭
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close(code, reason);
      }
      
      this.socket = null;
      this.connectionStartTime = 0;
    }
  }

  /**
   * 发送消息
   */
  async send(type: string, data: any, options: {
    target?: string;
    room?: string;
    priority?: 'high' | 'normal' | 'low';
    reliable?: boolean;
    timeout?: number;
    compressed?: boolean;
  } = {}): Promise<NetworkMessage | void> {
    // 创建消息对象
    const message: NetworkMessage = {
      id: this.generateId(),
      type,
      data,
      timestamp: Date.now(),
      sender: this.config.userId || 'anonymous',
      target: options.target,
      room: options.room,
      priority: options.priority || 'normal',
      reliable: options.reliable !== false,
      compressed: options.compressed !== false && this.config.messageCompression
    };
    
    // 如果不需要可靠传输，直接发送
    if (!options.reliable) {
      return this.sendMessage(message);
    }
    
    // 可靠传输，等待确认
    return new Promise((resolve, reject) => {
      // 设置超时
      const timeout = window.setTimeout(() => {
        this.pendingMessages.delete(message.id);
        reject(new Error(`Message ${message.id} timed out`));
      }, options.timeout || 10000);
      
      // 存储待处理消息
      this.pendingMessages.set(message.id, {
        resolve,
        reject,
        timeout
      });
      
      // 发送消息
      this.sendMessage(message).catch((error) => {
        clearTimeout(timeout);
        this.pendingMessages.delete(message.id);
        reject(error);
      });
    });
  }

  /**
   * 发送消息（内部方法）
   */
  private async sendMessage(message: NetworkMessage): Promise<void> {
    // 如果未连接，加入队列
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.messageQueue.push(message);
      this.stats.messageQueue = this.messageQueue.length;
      return;
    }
    
    try {
      let data: string | ArrayBuffer = JSON.stringify(message);
      
      // 如果启用了压缩，压缩数据
      if (message.compressed && this.compressionSupported) {
        const encoder = new TextEncoder();
        const uint8Array = encoder.encode(data);
        data = await this.compressData(uint8Array);
      }
      
      // 检查消息大小
      const messageSize = data.length;
      if (messageSize > this.config.maxMessageSize!) {
        throw new Error(`Message size (${messageSize}) exceeds maximum allowed size (${this.config.maxMessageSize})`);
      }
      
      // 发送消息
      this.socket.send(data);
      
      // 更新统计信息
      this.stats.sentMessages++;
      this.stats.sentBytes += messageSize;
      
      // 发送消息发送信号
      this.messageSent.emit(message);
      
      this.log('Sent message:', message);
    } catch (error) {
      this.error.emit(error as Error);
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * 处理队列中的消息
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;
    
    this.log(`Processing message queue: ${this.messageQueue.length} messages`);
    
    // 按优先级排序
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[a.priority || 'normal'] - priorityOrder[b.priority || 'normal'];
    });
    
    // 处理队列中的消息
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    this.stats.messageQueue = 0;
    
    for (const message of queue) {
      this.sendMessage(message).catch((error) => {
        console.error('Error sending queued message:', error);
      });
    }
  }

  /**
   * 压缩数据
   */
  private async compressData(data: Uint8Array): Promise<ArrayBuffer> {
    if (!this.compressionSupported) {
      return data.buffer;
    }
    
    try {
      const cs = new CompressionStream('deflate');
      const writer = cs.writable.getWriter();
      writer.write(data);
      writer.close();
      
      return new Response(cs.readable).arrayBuffer();
    } catch (error) {
      console.error('Error compressing data:', error);
      return data.buffer;
    }
  }

  /**
   * 解压数据
   */
  private async decompressData(data: ArrayBuffer): Promise<ArrayBuffer> {
    if (!this.compressionSupported) {
      return data;
    }
    
    try {
      const ds = new DecompressionStream('deflate');
      const writer = ds.writable.getWriter();
      writer.write(new Uint8Array(data));
      writer.close();
      
      return new Response(ds.readable).arrayBuffer();
    } catch (error) {
      console.error('Error decompressing data:', error);
      return data;
    }
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    if (!this.config.heartbeatInterval || this.heartbeatInterval !== null) return;
    
    this.heartbeatInterval = window.setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.lastPingTime = Date.now();
        this.sendMessage({
          id: this.generateId(),
          type: 'ping',
          data: { time: this.lastPingTime },
          timestamp: this.lastPingTime,
          sender: this.config.userId || 'anonymous'
        }).catch((error) => {
          console.error('Error sending ping:', error);
        });
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * 清理心跳
   */
  private clearHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 清理重连计时器
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * 清理待处理消息
   */
  private clearPendingMessages(): void {
    this.pendingMessages.forEach(({ timeout }) => {
      clearTimeout(timeout);
    });
    this.pendingMessages.clear();
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    if (this.isReconnecting || this.reconnectCount >= this.config.reconnectAttempts!) return;
    
    this.isReconnecting = true;
    this.reconnectCount++;
    this.stats.reconnectAttempts = this.reconnectCount;
    
    this.log(`Attempting to reconnect (${this.reconnectCount}/${this.config.reconnectAttempts})...`);
    this.reconnecting.emit(this.reconnectCount);
    
    this.clearReconnectTimer();
    this.reconnectTimer = window.setTimeout(async () => {
      try {
        await this.connect(this.config.url, this.config.protocols);
        this.reconnected.emit(true);
      } catch (error) {
        this.log('Reconnection failed:', error);
        
        // 如果还有重连次数，继续尝试
        if (this.reconnectCount < this.config.reconnectAttempts!) {
          this.attemptReconnect();
        } else {
          this.isReconnecting = false;
          this.reconnected.emit(false);
          this.error.emit(new Error(`Failed to reconnect after ${this.config.reconnectAttempts} attempts`));
        }
      }
    }, this.config.reconnectInterval);
  }

  /**
   * 发送认证消息
   */
  private sendAuthMessage(): void {
    this.sendMessage({
      id: this.generateId(),
      type: 'auth',
      data: {
        token: this.config.authToken,
        userId: this.config.userId,
        roomId: this.config.roomId
      },
      timestamp: Date.now(),
      sender: this.config.userId || 'anonymous'
    }).catch((error) => {
      console.error('Error sending auth message:', error);
    });
  }

  /**
   * 处理 pong 消息
   */
  private handlePongMessage(message: NetworkMessage): void {
    if (this.lastPingTime > 0) {
      this.stats.latency = Date.now() - this.lastPingTime;
      this.lastPingTime = 0;
    }
  }

  /**
   * 处理系统消息
   */
  private handleSystemMessage(message: NetworkMessage): void {
    this.log('Received system message:', message);
    
    // 处理系统消息
    if (message.data.type === 'error') {
      this.error.emit(new Error(message.data.message));
    }
  }

  /**
   * 处理房间消息
   */
  private handleRoomMessage(message: NetworkMessage): void {
    this.log('Received room message:', message);
    
    // 处理房间消息
    if (message.data.action === 'join') {
      const room: NetworkRoom = message.data.room;
      this.rooms.set(room.id, room);
      this.roomJoined.emit(room);
    } else if (message.data.action === 'leave') {
      const roomId = message.data.roomId;
      this.rooms.delete(roomId);
      this.roomLeft.emit(roomId);
    } else if (message.data.action === 'update') {
      const room: NetworkRoom = message.data.room;
      this.rooms.set(room.id, room);
    }
  }

  /**
   * 处理用户消息
   */
  private handleUserMessage(message: NetworkMessage): void {
    this.log('Received user message:', message);
    
    // 处理用户消息
    if (message.data.action === 'join') {
      const user: NetworkUser = message.data.user;
      this.users.set(user.id, user);
      this.userJoined.emit(user);
    } else if (message.data.action === 'leave') {
      const userId = message.data.userId;
      this.users.delete(userId);
      this.userLeft.emit(userId);
    } else if (message.data.action === 'update') {
      const user: NetworkUser = message.data.user;
      this.users.set(user.id, user);
    }
  }

  /**
   * 触发消息处理器
   */
  private triggerMessageHandlers(message: NetworkMessage): void {
    // 获取消息类型的处理器
    const handlers = this.messageHandlers.get(message.type) || [];
    
    // 调用处理器
    for (const handler of handlers) {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in message handler for type '${message.type}':`, error);
      }
    }
  }

  /**
   * 生成唯一 ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 日志输出
   */
  private log(...args: any[]): void {
    if (this.config.debug) {
      console.log('[NetworkManager]', ...args);
    }
  }

  /**
   * 获取连接状态
   */
  public getConnectionState(): 'connecting' | 'open' | 'closing' | 'closed' | 'reconnecting' {
    if (this.isReconnecting) return 'reconnecting';
    if (!this.socket) return 'closed';
    
    switch (this.socket.readyState) {
      case WebSocket.CONNECTING: return 'connecting';
      case WebSocket.OPEN: return 'open';
      case WebSocket.CLOSING: return 'closing';
      case WebSocket.CLOSED: return 'closed';
      default: return 'closed';
    }
  }

  /**
   * 获取网络统计信息
   */
  public getStats(): NetworkStats {
    if (this.connectionStartTime > 0) {
      this.stats.connectionUptime = Math.floor((Date.now() - this.connectionStartTime) / 1000);
    }
    
    return { ...this.stats };
  }

  /**
   * 获取房间列表
   */
  public getRooms(): NetworkRoom[] {
    return Array.from(this.rooms.values());
  }

  /**
   * 获取用户列表
   */
  public getUsers(): NetworkUser[] {
    return Array.from(this.users.values());
  }

  /**
   * 加入房间
   */
  public async joinRoom(roomId: string, options: { password?: string, data?: any } = {}): Promise<NetworkRoom> {
    const response = await this.send('room', {
      action: 'join',
      roomId,
      password: options.password,
      data: options.data
    }, { reliable: true }) as NetworkMessage;
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    const room = response.data.room as NetworkRoom;
    this.rooms.set(room.id, room);
    
    return room;
  }

  /**
   * 离开房间
   */
  public async leaveRoom(roomId: string): Promise<void> {
    await this.send('room', {
      action: 'leave',
      roomId
    }, { reliable: true });
    
    this.rooms.delete(roomId);
  }

  /**
   * 创建房间
   */
  public async createRoom(options: {
    name: string;
    private?: boolean;
    password?: string;
    maxUsers?: number;
    data?: any;
  }): Promise<NetworkRoom> {
    const response = await this.send('room', {
      action: 'create',
      ...options
    }, { reliable: true }) as NetworkMessage;
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    const room = response.data.room as NetworkRoom;
    this.rooms.set(room.id, room);
    
    return room;
  }

  /**
   * 更新用户数据
   */
  public async updateUserData(data: any): Promise<void> {
    await this.send('user', {
      action: 'update',
      data
    }, { reliable: true });
  }

  /**
   * 添加消息处理器
   */
  public addMessageHandler(type: string, handler: (message: NetworkMessage) => void): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)!.push(handler);
  }

  /**
   * 移除消息处理器
   */
  public removeMessageHandler(type: string, handler: (message: NetworkMessage) => void): void {
    if (!this.messageHandlers.has(type)) return;
    
    const handlers = this.messageHandlers.get(type)!;
    const index = handlers.indexOf(handler);
    
    if (index !== -1) {
      handlers.splice(index, 1);
    }
    
    if (handlers.length === 0) {
      this.messageHandlers.delete(type);
    }
  }

  /**
   * 广播消息到房间
   */
  public async broadcastToRoom(roomId: string, type: string, data: any, options: {
    priority?: 'high' | 'normal' | 'low';
    compressed?: boolean;
  } = {}): Promise<void> {
    await this.send(type, data, {
      room: roomId,
      priority: options.priority,
      compressed: options.compressed
    });
  }

  /**
   * 发送私信给用户
   */
  public async sendToUser(userId: string, type: string, data: any, options: {
    priority?: 'high' | 'normal' | 'low';
    reliable?: boolean;
    compressed?: boolean;
  } = {}): Promise<NetworkMessage | void> {
    return this.send(type, data, {
      target: userId,
      priority: options.priority,
      reliable: options.reliable,
      compressed: options.compressed
    });
  }
} 