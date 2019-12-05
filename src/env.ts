import { existsSync } from 'fs';

let unixSocket = false;
const unixPath = '/var/run/pritunl.sock';
const serviceHost = '127.0.0.1:9770';

export const resolveConnectionMode = async () => {
  unixSocket = existsSync(unixPath);
  return unixSocket;
};

export const shouldUseSocket = () => unixSocket;

export const getServiceAddress = () => {
  return (
    process.env.PRITUNL_SERVICE_ADDRESS ||
    (unixSocket ? `http://unix:${unixPath}:` : `http://${serviceHost}`)
  );
};

export const getServiceSocketAddress = () => {
  return (
    process.env.PRITUNL_SERVICE_SOCKET_ADDRESS ||
    (unixSocket ? `ws+unix://${unixPath}:` : `ws://${serviceHost}`)
  );
};

export const getUsername = () => {
  return process.env.PRITUNL_USERNAME || 'pritunl';
};

const getPritunlPath = () => {
  return process.env.PRITUNL_PATH || '/Applications/Pritunl.app';
};

export const getPritunlResourcePath = () => {
  return `${getPritunlPath()}/Contents/Resources`;
};

export const getServiceWait = (): number => {
  const wait = parseInt(process.env.PRITUNL_TIMEOUT || '', 10);
  return wait || 15000;
};

export const getDebug = (): boolean => {
  return !!process.env.PRITUNL_DEBUG;
};
