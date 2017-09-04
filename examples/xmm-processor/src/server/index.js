import 'source-map-support/register';
import http from 'http';
import chalk from 'chalk';
import connect from 'connect';
import connectRoute from 'connect-route';
import path from 'path';
import portfinder from 'portfinder';
import serveStatic from 'serve-static';
import serveFavicon from 'serve-favicon';
import template from 'ejs-template';
import osc from 'osc';
import sio from 'socket.io'
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

    // broadcast control messages from mobile to desktop
    const io = sio(server);

    io.on('connection', (socket) => {
      socket.on('record', label => socket.broadcast.emit('record', label));
      socket.on('play', () => socket.broadcast.emit('play'));
      socket.on('stop', () => socket.broadcast.emit('stop'));
    });


    // lfo routing, just broadcast ProcessedSensors values
    console.log(chalk.grey('socket receive on port: 5000'));
    console.log(chalk.grey('socket send on port:    5010'));

    // pipe phone to desktop client
    const socketReceive = new lfo.source.SocketReceive({ port: 5000 });
    const socketSend = new lfo.sink.SocketSend({ port: 5010 });
    const logger = new lfo.sink.Logger({ data: false, time: true });

    socketReceive.connect(socketSend);
    // socketReceive.connect(logger);
  })
  .catch(err => console.error(err.stack));
