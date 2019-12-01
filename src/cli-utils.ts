import readline from 'readline';
import { readFileSync } from 'fs';

export const prompt = (message: string): Promise<string> => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(`${message}: `, answer => {
      rl.close();
      resolve(answer);
    });
  });
};

export const getPackageVersion = () => {
  const manifest = readFileSync('package.json', { encoding: 'utf8' });
  return JSON.parse(manifest).version;
};

export const sleep = (afterMilliseconds: number) =>
  new Promise(resolve => setTimeout(resolve, afterMilliseconds));
