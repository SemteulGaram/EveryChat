import http from 'http';
import url from 'url';

import { instance as config } from './config';

function createRequestListener (server: Server): http.RequestListener {
  return async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const mUrl = new url.URL(req.url || '/', 'http://localhost');
    // Remove leading and trailing slash and spliting
    //const paths = mUrl.pathname.replace(/^\/|\/+$/g, '').split('/');
    if (!mUrl.pathname.startsWith('/ec')) return;
    
    if (('' + req.method).toUpperCase() === 'POST') { // Normal parse mode
      new Promise((resolve, reject) => {
        let content: string = '';

        req.on('data', chunk => {
          content += chunk;
        });

        req.on('end', () => {
          try {
            const data = JSON.parse(content);
            // Parse
            if (!data || !data.m || !data.m.length) {
              server.logger.warn(`invalid request from ${ req.connection.remoteAddress }`);
              res.statusCode = 400;
              res.write('ERR_WRONG_REQUEST');
              res.end();
              return reject();
            }
            
            // Send messages to target route
            for (let msg of data.m) {
              this.logger[this.NAME](msg);
            }
            targetRoute.sendMessage(data.m);
          } catch (err) {
            this.logger.error(`${ this.NAME } response JSON parse error:`, err);
            res.statusCode = 400;
            res.write('ERR_WRONG_JSON');
            res.end();
            return reject();
          }
          resolve();
        });

        req.on('error', err => {
          this.logger.error('socket error');
          reject(err);
        });
      }).then(() => {
        res.statusCode = 200;
        res.write('SUCCESS');
        res.end();
      }).catch(err => {
        if (err) {
          this.logger.error('Unexpected error:', err);
          res.statusCode = 500;
          res.write('ERR_UNEXPECTED');
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

  constructor (logger: any) {
    this.logger = logger;

    this._httpServer = http.createServer(createRequestListener(this));  
  }

  start (): void {
    const port: number = config.get('serverPort');
    this._httpServer.listen(port, () => {
      this.logger.info(`Server start on ${ port }port. Waiting client...`);
    });
  }
}
