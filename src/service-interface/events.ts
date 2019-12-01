import WebSocket from 'ws';
import { getBaseHeaders, path } from './utils';
import { getServiceWait, getDebug } from '../env';

type UnusedReturn = any;
type ServiceEvent = {
  id: string;
  type:
    | 'update'
    | 'output'
    | 'wakeup'
    | 'disconnected'
    | 'auth_error'
    | 'inactive'
    | 'timeout_error';
  data: EventData | void;
};
type EventData = {
  id: string; // ProfileId
  reconnect?: boolean;
  status?: 'connecting' | 'connected' | 'disconnected';
  timestamp?: number;
  server_addr?: string;
  client_addr?: string;
  output?: string | void;
};
type EventHandler = (event: {}) => UnusedReturn;
type ErrorHandler = (error: Error) => UnusedReturn;
type CloseHandler = () => UnusedReturn;

export enum WaitResult {
  Connected,
  Disconnected,
  AuthFailure,
  TimedOut,
  Unknown,
}

let socket: WebSocket;

const addHandler = (handler: EventHandler) => {
  socket.on('message', function(data: any) {
    data = JSON.parse(data);
    handler(data);
  });
};

const subscribe = (handler: EventHandler, onError: ErrorHandler, onClose: CloseHandler) => {
  const url = path('events');

  if (!socket) {
    socket = new WebSocket(url, {
      headers: getBaseHeaders(),
    });

    socket.on('onerror', onError);
    socket.on('error', onError);
    socket.on('close', onClose);
  }

  addHandler(handler);
};

let waitTimeout: NodeJS.Timeout;

const close = () => {
  socket.terminate();
  socket = null;
  if (waitTimeout) clearTimeout(waitTimeout);
};

const debugEvent = (event: ServiceEvent) => {
  const tag = 'event> ';
  if (getDebug()) {
    switch (event.type) {
      case 'output':
        console.log(tag, event.data && event.data.output);
        break;
      default:
        console.log(tag, event.type, event.data && event.data.status ? event.data.status : '');
    }
  }
};

export const waitForConnect = (timeout: number = getServiceWait()): Promise<WaitResult> => {
  return new Promise((resolve, reject) => {
    const safeResolve = (result: WaitResult) => {
      if (!socket) return;
      close();
      resolve(result);
    };

    const safeReject = (e: Error) => {
      if (!socket) return;
      close();
      reject(e);
    };

    const eventHandler = (event: ServiceEvent) => {
      if (!event) return;
      debugEvent(event);

      switch (event.type) {
        case 'update':
          if (event.data && event.data.status === 'connected') {
            safeResolve(WaitResult.Connected);
          }
          if (event.data && event.data.status === 'disconnected') {
            safeResolve(WaitResult.Disconnected);
          }
          break;
        case 'wakeup':
          socket.send('awake');
          break;
        case 'auth_error':
          safeResolve(WaitResult.AuthFailure);
          break;
      }
    };

    const onError = (e: Error) => safeReject(e);
    const onClose = () => safeResolve(WaitResult.Unknown);
    const onTimeout = () => safeResolve(WaitResult.TimedOut);

    waitTimeout = setTimeout(onTimeout, timeout);

    subscribe(eventHandler, onError, onClose);
  });
};
