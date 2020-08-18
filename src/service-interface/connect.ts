import request from 'request-promise-native';

import { getProfileData, getProfile, getProfileId, Profile } from '../pritunl';
import { path, getBaseHeaders } from './utils';
import { getUsername } from '../env';
import { Maybe } from '../types';

type RequestPayload = {
  id: string;
  password: Maybe<string>;
  data: string;
  reconnect: boolean;
  server_box_public_key?: Maybe<string>;
  server_public_key: string;
  timeout: boolean;
  token_ttl: number;
  username: string;
};

const makePayload = (password: Maybe<string>, profile: Profile): RequestPayload => {
  const id = getProfileId();
  const data = getProfileData();
  const { token_ttl, server_public_key } = profile;

  return {
    id,
    data,
    reconnect: true,
    timeout: true,
    token_ttl,
    server_box_public_key: null,
    server_public_key: server_public_key.join('\n'),
    username: getUsername(),
    password,
  };
};

export const connect = async (password?: string): Promise<void> => {
  const profile = getProfile();

  if (profile.token !== true && !password) {
    throw new Error('Password required for connect() without a profile with token');
  }

  await request({
    uri: path('profile'),
    method: 'POST',
    headers: getBaseHeaders(),
    json: true,
    body: makePayload(password, profile),
  });
};
