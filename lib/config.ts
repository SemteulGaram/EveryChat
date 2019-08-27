import fs from 'fs';

import logger from './logger';

export interface IConfig {
  serverPort: number;
  maxQueueSize: number;
  maxConcurrentTransferCount: number;
}

export class Config {
  static DEFAULT_CONFIG: string;
  ready: boolean;
  path: string;
  private _v: IConfig;

  constructor (path: string) {
    this.path = path;
    this._v = JSON.parse(Config.DEFAULT_CONFIG);
    this.ready = false;
  }

  async init(): Promise<Config> {
    try {
      this._v = JSON.parse(await fs.promises.readFile(this.path, 'utf-8'));
      this.ready = true;
      return this;
    } catch (err) {
      if (err.code === 'ENOENT') {
        logger.debug('Config not found. Create one...');
        await this._createConfig();
        logger.info('Config created. Edit "config.json" and restart service');
        process.exit(0);
      }
      throw err;
    }
  }

  get(key: keyof IConfig): any {
    if (!this.ready) throw new Error('Config must initialize before use.');
    return this._v[key];
  }

  async _createConfig() {
    return await fs.promises.writeFile(this.path, Config.DEFAULT_CONFIG, 'utf-8');
  }
}
Config.DEFAULT_CONFIG = `{
  "serverPort": 7111,
  "maxQueueSize": 8,
  "maxConcurrentTransferCount": 4
}`;

export const instance = new Config('./config.json');
