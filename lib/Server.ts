import http from 'http';
import url from 'url';

import { IRequestMessage, validateRequestMessage } from './types/HttpMessage';
import { instance as config } from './config';
import { ChatRoom } from './ChatRoom';

const SUCCESS = JSON.stringify({
  s: true
});
const ERR_INVALID_REQUEST = JSON.stringify({
  s: false,
  e: 'ERR_INVALID_REQUEST'
});
const ERR_WRONG_JSON = JSON.stringify({
  s: false,
  e: 'ERR_WRONG_JSON'
});
const ERR_UNEXPECTED = JSON.stringify({
  s: false,
  e: 'ERR_UNEXPECTED'
});

function createRequestListener (server: Server): http.RequestListener {
  return async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const mUrl = new url.URL(req.url || '/', 'http://localhost');
    // Remove leading and trailing slash and spliting
    //const paths = mUrl.pathname.replace(/^\/|\/+$/g, '').split('/');
    if (!(mUrl.pathname === '/ec' || mUrl.pathname === '/ec/')) return;
    
    if (('' + req.method).toUpperCase() === 'POST') { // Normal parse mode
      new Promise((resolve, reject) => {
        let content: string = '';

        req.on('data', chunk => {
          content += chunk;
        });

        req.on('end', () => {
          try {
            // Parse
            let data: IRequestMessage|null = null;

            try {
              data = JSON.parse(content);
            } catch (err) {
              server.logger.warn(`request JSON parse error:`, err);
              res.write(ERR_WRONG_JSON);
              res.end();
              return reject();
            }
            
            // Message validation test
            if (!(data = validateRequestMessage(data))) {
              server.logger.warn(`invalid request from ${ req.connection.remoteAddress }`);
              res.write(ERR_INVALID_REQUEST);
              res.end();
              return reject();
            }

            const room: ChatRoom = server.ensureGetChatRoom(data.r);
            room.middleware(req, res, data)
              .then(() => resolve()).catch((err: any) => reject(err));
          } catch (err) {
            return reject(err);
          }
        });

        req.on('error', err => {
          server.logger.error('socket error');
          return reject(err);
        });
      }).then(() => {
        res.write(SUCCESS);
        res.end();
      }).catch(err => {
        if (err) {
          server.logger.error('unexpected error:', err);
          res.write(ERR_UNEXPECTED);
          res.end();
        }
      });
    } else {  // fallback parse mode

    }
  }
}

export class Server {
  _httpServer: http.Server;
  logger: any;
  rooms: Map<string, ChatRoom>;

  constructor (logger: any) {
    this.logger = logger;
    this.rooms = new Map();

    this._httpServer = http.createServer(createRequestListener(this));
  }

  start (): void {
    const port: number = config.get('serverPort');
    this._httpServer.listen(port, () => {
      this.logger.info(`Server start on ${ port }port. Waiting client...`);
    });
  }

  ensureGetChatRoom (id: string): ChatRoom {
    const room: ChatRoom|undefined = this.rooms.get(id);
    if (room) return room;
    else {
      this.logger.info(`create ChatRoom "${id}"`);
      const room = new ChatRoom(this, id);
      this.rooms.set(id, room);
      return room;
    }
  }

  removeChatRoom (id: string): boolean {
    const success = this.rooms['delete'](id);
    if (success) this.logger.info(`remove ChatRoom "${id}"`);
    return success;
  }
}
