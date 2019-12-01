import { execSync } from 'child_process';
import { Maybe } from './types';

const account = process.env.USER;
const service = 'pritunlctl';

export const setKey = (pass: string) => {
  const command = `/usr/bin/security add-generic-password -a ${account} -s ${service} -w "${pass}"`;
  const buffer = execSync(command);
  console.log(buffer.toString('utf8'));
};

export const getKey = (): Maybe<string> => {
  const command = `/usr/bin/security find-generic-password -a ${account} -s ${service} -w`;
  let buffer;
  try {
    buffer = execSync(command, { stdio: 'pipe' });
  } catch (e) {
    // not found
    return null;
  }

  const stdout = buffer.toString('utf8');
  return stdout.replace(/\n/, '');
};

export const rmKey = () => {
  const command = `/usr/bin/security delete-generic-password -a ${account} -s ${service}`;
  try {
    execSync(command);
  } catch (e) {}
};
