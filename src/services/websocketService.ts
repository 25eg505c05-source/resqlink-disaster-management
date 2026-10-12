type WebSocketEventHandler = (data: any) => void;

class WebSocketService {
  private handlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private isConnected: boolean = false;
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;

  constructor() {
    this.connect();
  }

  public connect(): void {
    const wsUrl = import.meta.env.VITE_WS_URL;
    if (wsUrl && typeof WebSocket !== 'undefined') {
      try {
        this.ws = new WebSocket(wsUrl);
        this.ws.onopen = () => {
          this.isConnected = true;
          this.dispatchLocal('SYSTEM', { status: 'CONNECTED', transport: 'STOMP_WEBSOCKET' });
        };
        this.ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.topic && parsed.payload) {
              this.dispatchLocal(parsed.topic, parsed.payload);
            }
          } catch {
            // Ignore non-json frames
          }
        };
        this.ws.onclose = () => {
          this.isConnected = false;
          this.reconnectTimer = setTimeout(() => this.connect(), 5000);
        };
        this.ws.onerror = () => {
          this.isConnected = false;
        };
      } catch {
        this.isConnected = false;
      }
    } else {
      // Local in-memory event bus mode
      this.isConnected = true;
    }
  }

  public subscribe(topic: string, handler: WebSocketEventHandler): () => void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set());
    }
    this.handlers.get(topic)!.add(handler);

    return () => {
      const set = this.handlers.get(topic);
      if (set) {
        set.delete(handler);
      }
    };
  }

  public broadcast(topic: string, payload: any): void {
    // If real WebSocket is connected, send frame
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify({ topic, payload }));
      } catch {
        // Fallback to local dispatch
      }
    }
    // Also dispatch to local listeners
    this.dispatchLocal(topic, payload);
  }

  private dispatchLocal(topic: string, data: any): void {
    const set = this.handlers.get(topic);
    if (set) {
      set.forEach(handler => {
        try {
          handler(data);
        } catch (err) {
          console.error(`Error in WebSocket subscriber for topic ${topic}:`, err);
        }
      });
    }

    // Also trigger wildcard subscribers
    const allSet = this.handlers.get('*');
    if (allSet) {
      allSet.forEach(handler => handler({ topic, data }));
    }
  }

  public getStatus(): { isConnected: boolean } {
    return { isConnected: this.isConnected };
  }
}

export const websocketService = new WebSocketService();
