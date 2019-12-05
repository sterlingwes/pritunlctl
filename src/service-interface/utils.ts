import { getServiceAddress, getServiceSocketAddress, shouldUseSocket } from '../env';
import { getAuthToken } from '../pritunl';

export const path = (path: string) => `${getServiceAddress()}/${path}`;

export const socketPath = (path: string) => `${getServiceSocketAddress()}/${path}`;

export const getBaseHeaders = () => {
  const baseHeaders = { 'Auth-Key': getAuthToken(), 'User-Agent': 'pritunl' };

  if (shouldUseSocket()) {
    return {
      ...baseHeaders,
      Host: 'unix',
    };
  }

  return baseHeaders;
};
