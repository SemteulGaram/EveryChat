import http from 'http';
import url from 'url';

import { instance as config } from './config';
import { RouteKakao, RouteMinecraft } from './internals';

function createRequestListener (server: Server): http.RequestListener {
  return async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
    const mUrl = new url.URL(req.url || '/', 'http://localhost');
    // Remove leading and trailing slash
    const paths = mUrl.pathname.replace(/^\/|\/+$/g, '').split('/');
    if (paths[0] === 'k') {
      await server.routeKakao.middleware(req, res, paths, mUrl);
    } else if (paths[0] === 'm') {
      await server.routeMinecraft.middleware(req, res, paths, mUrl);
    }
  }
}

export class Server {
  _httpServer: http.Server;
  logger: any;
  routeKakao: RouteKakao;
  routeMinecraft: RouteMinecraft;

  constructor (logger: any) {
    this.logger = logger;

    this.routeKakao = new RouteKakao(this);
    this.routeMinecraft = new RouteMinecraft(this);
    this.routeKakao.setTargetRoute(this.routeMinecraft);
    this.routeMinecraft.setTargetRoute(this.routeKakao);

    this._httpServer = http.createServer(createRequestListener(this));  
  }

  start (): void {
    const port: number = config.get('serverPort');
    this._httpServer.listen(port, () => {
      this.logger.running(`Server start on ${ port }port. Waiting client...`);
    });
  }
}
