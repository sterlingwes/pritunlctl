import { getServiceAddress } from '../env';
import { getAuthToken } from '../pritunl';

export const path = (path: string) => `${getServiceAddress()}/${path}`;

export const getBaseHeaders = () => ({
  'Auth-Key': getAuthToken(),
  'User-Agent': 'pritunl',
});
