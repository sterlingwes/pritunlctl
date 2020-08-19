import fs from 'fs';
import { getPritunlResourcePath } from '../env';

let cachedToken: string;

const authPaths = [
  `${getPritunlResourcePath()}/auth`, // earlier versions of Pritunl
  '/var/run/pritunl.auth',
];

export const getAuthToken = (): string => {
  if (cachedToken) return cachedToken;
  const path = authPaths.find((possiblePath) => fs.existsSync(possiblePath));
  if (!path) throw new Error('Unable to locate auth file required to talk to pritunl service');
  const token = fs.readFileSync(path, { encoding: 'utf8' });
  cachedToken = token;
  return token;
};
