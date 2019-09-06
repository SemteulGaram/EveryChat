import http from 'http';

import { Server, ClientConnection } from './internals';
import { createUid } from './utils';
import { IRequestMessage } from './types/HttpMessage';

export interface IChatRoomOptions {
  name?: string;
}

export class ChatRoom {
  ctx: Server;
  id: string;
  name: string;
  clients: Array<ClientConnection>;
  logger: any;

  constructor (ctx: Server, id: string, options: IChatRoomOptions = {}) {
    this.ctx = ctx;
    this.logger = ctx.logger;
    this.id = id;
    this.name = options.name || id;
    this.clients = [];
  }

  createClientConnection (name?: string): string {
    const uid: string = createUid();
    const client: ClientConnection = new ClientConnection(this, uid, name || 'Unknown');
    this.clients.push(client);
    return uid;
  }

  removeClientConnection (client: ClientConnection): boolean {
    const index = this.clients.indexOf(client);
    if (index !== -1) {
      this.clients.splice(index, 1);
      return true;
    }
    return false;
  }

  remoteClientById (id: string): void {
    this.clients.reduceRight((pv: ClientConnection, cv: ClientConnection, i: number, a: Array<ClientConnection>) => {
      if (pv.id === id) this.clients.splice(i, 1);
      return cv;
    });
  }

  middleware (req: http.IncomingMessage, res: http.ServerResponse, data: IRequestMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      
    });
  }
}
