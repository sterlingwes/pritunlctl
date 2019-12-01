import fs from 'fs';
import { getPritunlResourcePath } from '../env';

let cachedToken: string;

export const getAuthToken = (): string => {
  if (cachedToken) return cachedToken;
  const path = `${getPritunlResourcePath()}/auth`;
  const token = fs.readFileSync(path, { encoding: 'utf8' });
  cachedToken = token;
  return token;
};
