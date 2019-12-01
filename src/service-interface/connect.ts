import request from 'request-promise-native';

import { getProfileData, getProfile, getProfileId } from '../pritunl';
import { path, getBaseHeaders } from './utils';
import { getUsername } from '../env';
import { Maybe } from '../types';

type RequestPayload = {
  id: string;
  password: string;
  data: string;
  reconnect: boolean;
  server_box_public_key?: Maybe<string>;
  server_public_key: string;
  timeout: boolean;
  token_ttl: number;
  username: string;
};

const makePayload = (password: string): RequestPayload => {
  const id = getProfileId();
  const data = getProfileData();
  const { token_ttl, server_public_key } = getProfile();

  return {
    id,
    data,
    reconnect: true,
    timeout: true,
    token_ttl,
    server_public_key: server_public_key.join('\n'),
    username: getUsername(),
    password,
  };
};

export const connect = async (password: string): Promise<void> => {
  await request({
    uri: path('profile'),
    method: 'POST',
    headers: getBaseHeaders(),
    json: true,
    body: makePayload(password),
  });
};
