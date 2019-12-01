import request from 'request-promise-native';
import { path, getBaseHeaders } from './utils';

export enum ConnectionStatus {
  DOWN,
  UP,
}

export const status = async (): Promise<ConnectionStatus> => {
  const response = await request(path('status'), {
    headers: getBaseHeaders(),
    json: true,
  });
  return response.status ? ConnectionStatus.UP : ConnectionStatus.DOWN;
};
