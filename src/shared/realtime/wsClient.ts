const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://k8s.mectest.ru/test-app";
const API_TOKEN = process.env.EXPO_PUBLIC_API_TOKEN ?? "";
const WS_URL = process.env.EXPO_PUBLIC_WS_URL ?? `${API_BASE_URL}/ws`;

type WsEventMessage = {
  event?: string;
  type?: string;
  data?: unknown;
  [key: string]: unknown;
};

type MessageHandler = (message: WsEventMessage) => void;

let socket: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let manuallyClosed = false;
const messageHandlers = new Set<MessageHandler>();

function normalizeWsUrl(rawUrl: string): string {
  if (rawUrl.startsWith("https://")) {
    return rawUrl.replace("https://", "wss://");
  }
  if (rawUrl.startsWith("http://")) {
    return rawUrl.replace("http://", "ws://");
  }
  return rawUrl;
}

function scheduleReconnect() {
  if (manuallyClosed || reconnectTimer) {
    return;
  }
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectWs();
  }, 2000);
}

function handleRawMessage(payload: string) {
  try {
    const parsed = JSON.parse(payload) as WsEventMessage;
    for (const handler of messageHandlers) {
      handler(parsed);
    }
  } catch {
    if (__DEV__) {
      console.log("[ws] non-json message:", payload);
    }
  }
}

export function connectWs() {
  if (
    socket &&
    (socket.readyState === WebSocket.OPEN ||
      socket.readyState === WebSocket.CONNECTING)
  ) {
    return;
  }
  manuallyClosed = false;
  const wsUrl = normalizeWsUrl(WS_URL);
  const separator = wsUrl.includes("?") ? "&" : "?";
  // Token is passed as a query param because the server does not support
  // Sec-WebSocket-Protocol-based auth. Migrate to the protocol header once
  // the backend adds support for it.
  const authUrl = API_TOKEN
    ? `${wsUrl}${separator}token=${encodeURIComponent(API_TOKEN)}`
    : wsUrl;

  if (__DEV__) {
    console.log("[ws] connecting:", wsUrl);
  }

  socket = new WebSocket(authUrl);
  socket.onopen = () => {
    if (__DEV__) {
      console.log("[ws] connected");
    }
  };
  socket.onmessage = (event) => {
    handleRawMessage(String(event.data));
  };
  socket.onerror = (error) => {
    if (__DEV__) {
      console.log("[ws] error:", error.type);
    }
  };
  socket.onclose = () => {
    if (__DEV__) {
      console.log("[ws] closed");
    }
    socket = null;
    scheduleReconnect();
  };
}

export function disconnectWs() {
  manuallyClosed = true;
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.close();
    socket = null;
  }
}

export function subscribeWsMessages(handler: MessageHandler) {
  messageHandlers.add(handler);
  return () => {
    messageHandlers.delete(handler);
  };
}
