import request from 'request-promise-native';
import { path, getBaseHeaders } from './utils';
import { getProfileId } from '../pritunl';

export const disconnect = async (): Promise<void> => {
  await request(path('profile'), {
    method: 'DELETE',
    headers: getBaseHeaders(),
    json: true,
    body: {
      id: getProfileId(),
    },
  });
};
