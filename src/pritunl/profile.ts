import fs from 'fs';
import { execSync } from 'child_process';
import { Maybe } from '../types';

const PROFILE_PATH = `${process.env.HOME}/Library/Application Support/pritunl/profiles`;

const getProfiles = () => {
  const contents = fs.readdirSync(PROFILE_PATH);
  return contents.filter((file) => /\.conf$/.test(file));
};

export const getProfileId = (): string => {
  if (process.env.PRITUNL_CTL_PROFILE_ID) {
    return process.env.PRITUNL_CTL_PROFILE_ID;
  }
  const profile = getProfiles()[0];
  if (!profile) throw new Error('Could not find Pritunl profile.');
  const [profileId] = profile.split('.');
  return profileId;
};

const getProfileConfigPath = (): string => {
  const profile = getProfileId();
  return `${PROFILE_PATH}/${profile}.conf`;
};

const getProfileOvpnPath = (): string => {
  const profile = getProfileId();
  return `${PROFILE_PATH}/${profile}.ovpn`;
};

export interface Profile {
  name: Maybe<string>;
  organization_id: string;
  organization: string;
  server_id: string;
  server: string;
  user_id: string;
  user: string;
  password_mode: string;
  token: boolean;
  token_ttl: number;
  disable_reconnect: boolean;
  autostart: boolean;
  sync_hosts: Array<string>;
  sync_hash: string;
  sync_secret: string;
  sync_token: string;
  server_public_key: Array<string>;
}

export const getProfile = (): Profile => {
  const path = getProfileConfigPath();
  const file = fs.readFileSync(path, { encoding: 'utf8' });
  return JSON.parse(file);
};

const getOvpnProfile = (): string => {
  const path = getProfileOvpnPath();
  return fs.readFileSync(path, { encoding: 'utf8' });
};

const getTlsAuth = () => {
  const profileId = getProfileId();
  const buffer = execSync(`/usr/bin/security find-generic-password -w -s pritunl -a ${profileId}`);
  return Buffer.from(buffer.toString(), 'base64').toString('utf8');
};

export const getProfileData = (): string => {
  return `${getOvpnProfile()}${getTlsAuth()}`;
};
