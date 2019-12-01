import request from 'request-promise-native';
import { path, getBaseHeaders } from './utils';

export enum PingResult {
  Unknown,
  Unavailable,
  Unauthorized,
  Up,
}

export const ping = async (): Promise<PingResult> => {
  let response;
  try {
    const headers = getBaseHeaders();
    response = await request(path('ping'), { headers });
    return PingResult.Up;
  } catch (e) {
    if (e.name === 'RequestError') {
      return PingResult.Unavailable;
    }

    if (e.name === 'StatusCodeError') {
      if (e.statusCode === 401) return PingResult.Unauthorized;
    }

    throw e;
  }
};
