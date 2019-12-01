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

const print = (msg: string) => console.log(msg);
const printNewline = () => console.log();
const printExit = (msg: string, code: number = 1) => {
  print(msg);
  printNewline();
  process.exit(1);
};

const appName = `pritnlctl v${getPackageVersion()}`;
const command = process.argv.pop() || '';
const SupportedCommands = ['start', 'stop', 'help'];

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
  print('Usage: pritunlctl');
  printNewline();
  print('with no arguments, attempts to start VPN connection if down');
  print('prints status regardless');
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

  const otp = await prompt('Enter OTP code');
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
  printNewline();
  print(appName);

  if (command === 'help' || unrecognizedCommand()) {
    return printHelp();
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
