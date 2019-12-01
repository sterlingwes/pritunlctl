import Spinner from 'ora';
import {
  connect,
  disconnect,
  status,
  ping,
  waitForConnect,
  PingResult,
  ConnectionStatus,
  WaitResult,
} from './service-interface';
import { prompt, getPackageVersion, sleep } from './cli-utils';
import { getServiceAddress, getServiceWait } from './env';
import { getKey, setKey, rmKey } from './keychain';

const print = (msg: string) => console.log(msg);
const printNewline = () => console.log();
const printExit = (msg: string, code: number = 1) => {
  print(msg);
  printNewline();
  process.exit(1);
};

const appName = `pritnlctl v${getPackageVersion()}`;
const command = process.argv.pop() || '';
const SupportedCommands = ['start', 'stop', 'config', 'help'];

const messages = {
  ping: {
    [PingResult.Unauthorized]: 'pritunl-service is up but our request was unauthorized',
    [PingResult.Unavailable]: `pritunl-service is not available at ${getServiceAddress()}`,
    [PingResult.Unknown]: `unexpected error trying to reach pritunl-service`,
  },

  status: {
    [ConnectionStatus.DOWN]: 'VPN disconnected',
    [ConnectionStatus.UP]: 'VPN connected',
  },

  events: {
    [WaitResult.AuthFailure]: 'authentication failed',
    [WaitResult.TimedOut]: 'timed out waiting for connection event',
    [WaitResult.Unknown]: 'event socket closed unexpectedly',
    [WaitResult.Disconnected]: 'VPN disconnected',
  },
};

const printStatus = (statusResult: ConnectionStatus) => {
  print(`Status: ${messages.status[statusResult]}`);
  printNewline();
};

const printHelp = () => {
  printNewline();
  print(appName);
  print('Usage: pritunlctl <command>');
  printNewline();
  print('commands:');
  printNewline();
  SupportedCommands.map(key => print(`- ${key}`));
  printNewline();
};

const unrecognizedCommand = () => {
  return SupportedCommands.includes(command) === false;
};

const start = async () => {
  const statusResult = await status();
  if (statusResult === ConnectionStatus.UP) {
    printStatus(statusResult);
    return;
  }

  let otp;
  const totp = require('totp-generator');
  const otpToken = getKey();
  if (otpToken) {
    otp = totp(otpToken);
  } else {
    otp = await prompt('Enter OTP code');
  }

  const spinner = Spinner('Establishing connection...').start();
  await connect(otp);
  const waitResult = await waitForConnect();
  if (waitResult === WaitResult.Connected) {
    spinner.succeed('VPN connected');
    return;
  }

  spinner.warn(messages.events[waitResult]);
  printNewline();
};

const stop = async () => {
  const statusResult = await status();
  if (statusResult === ConnectionStatus.DOWN) {
    printStatus(statusResult);
    return;
  }

  const spinner = Spinner('Triggering disconnect...').start();
  await disconnect();
  const waitResult = await waitForConnect();
  if (waitResult === WaitResult.Disconnected) {
    spinner.succeed('VPN disconnected');
    return;
  }

  const postStatus = await status();
  printStatus(postStatus);
};

const run = async () => {
  if (command === 'help' || unrecognizedCommand()) {
    return printHelp();
  }

  if (command === 'config') {
    print('pritunlctl can generate your OTP code from a token saved on your keychain');
    const token = await prompt('Enter your Pritunl OTP token (leave empty to delete)');
    if (token) {
      setKey(token);
    } else {
      rmKey();
    }
    return;
  }

  const pingResult = await ping();
  if (pingResult !== PingResult.Up) {
    printExit(`Ping error: ${messages.ping[pingResult]}`);
  }

  if (command === 'stop') {
    await stop();
    return;
  }

  await start();
};

run();
