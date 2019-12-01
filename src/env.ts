export const getServiceAddress = () => {
  return process.env.PRITUNL_SERVICE_ADDRESS || 'http://127.0.0.1:9770';
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
  const wait = parseInt(process.env.PRITUNL_TIMEOUT, 10);
  return wait || 10000;
};

export const getDebug = (): boolean => {
  return !!process.env.PRITUNL_DEBUG;
};
