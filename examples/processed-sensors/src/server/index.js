import 'source-map-support/register';
import http from 'http';
import uws from 'uws';
import chalk from 'chalk';
import connect from 'connect';
import connectRoute from 'connect-route';
import path from 'path';
import portfinder from 'portfinder';
import serveStatic from 'serve-static';
import serveFavicon from 'serve-favicon';
import template from 'ejs-template';
import osc from 'osc';
// not very clean but...
import { getTranspiler } from '../../bin/runner';
import * as lfo from 'waves-lfo/node';


const cwd = process.cwd();
portfinder.basePort = 3000;

portfinder.getPortPromise()
  .then(port => {
    const app = connect();

    app.use(serveFavicon('./public/favicon.ico'));
    app.use(serveStatic('./public'));
    app.use(template.middleware({
      basedir: path.join(cwd, 'src', 'client'),
      autoreload: true,
    }));

    app.use(connectRoute(router => {
      const serve = (name, req, res) => {
        const transpiler = getTranspiler();
        // bundle the js file that correspond to the client
        const entryPoint = path.join(cwd, 'dist', 'client', `${name}.js`);
        const outFile = path.join(cwd, 'public', `${name}-bundle.js`);

        transpiler.bundle(entryPoint, outFile, () => {
          res.endTemplate('template.ejs', { name });
        });
      };

      router.get('/', (req, res, next) => serve('index', req, res));
      router.get('/:name', (req, res, next) => serve(req.params.name, req, res));
    }));

    console.log('PHONE -----------------------------------------------');

    const server = http.createServer(app);
    server.listen(port, () => console.log(chalk.cyan(`server started: http://127.0.0.1:${port}`)));

    // lfo routing
    console.log(chalk.grey('socket receive on port: 5000'));
    console.log(chalk.grey('socket send on port:    5010'));

    // pipe phone to desktop client
    const socketReceive = new lfo.source.SocketReceive({ port: 5000 });
    const socketSend = new lfo.sink.SocketSend({ port: 5010 });
    // const logger = new lfo.sink.Logger({ data: false, time: true });

    socketReceive.connect(socketSend);


    console.log('R-ioT -----------------------------------------------');

    console.log(chalk.grey('osc receive on port:    5001'));
    console.log(chalk.grey('socket send on port:    5011'));

    // listen osc from max
    const riotOscReceive = new osc.UDPPort({
      localAddress: '127.0.0.1',
      localPort: 5001,
    });

    const riotEventIn = new lfo.source.EventIn({
      frameSize: 6,
      frameRate: 0,
      frameType: 'vector',
    });

    const riotSocketSend = new lfo.sink.SocketSend({ port: 5011 });

    riotEventIn.connect(riotSocketSend);
    riotEventIn.start();

    riotOscReceive.on('message', (message) => {
      // console.log(message.args);
      riotEventIn.process(null, message.args);
    });

    riotOscReceive.open();

    console.log('-----------------------------------------------------');
  })
  .catch(err => console.error(err.stack));
