import 'source-map-support/register'; // enable sourcemaps in node
import http from 'http';
import path from 'path';
import chalk from 'chalk';
import connect from 'connect';
import connectRoute from 'connect-route';
import bodyParser from 'body-parser';
import serveStatic from 'serve-static';
import serveFavicon from 'serve-favicon';
import rapidMixAdapters from 'rapid-mix-adapters';
import xmm from 'xmm-node';

const port = 3000;

// use only default configuration (gmm)
const gmmXmm = new xmm('gmm');

/**
 * Simple server-side endpoint for `mano.XmmProcessor`
 */
function train(req, res) {
  const xmmConfig = rapidMixAdapters.rapidMixToXmmConfig(req.body.configuration);
  const xmmTrainingSet = rapidMixAdapters.rapidMixToXmmTrainingSet(req.body.trainingSet);

  gmmXmm.setConfig(xmmConfig);
  gmmXmm.setTrainingSet(xmmTrainingSet);
  gmmXmm.train((err, model) => {
    if (err)
      console.error(err.stack);

    const rapidMixModel = rapidMixAdapters.xmmToRapidMixModel(model);
    const rapidMixHttpResponse = {
      docType: 'rapid-mix:ml:http-response',
      docVersion: '1.0.0',
      model: rapidMixModel,
    };

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rapidMixHttpResponse));
  });
}

/**
 * Server boilerplate code
 */
const app = connect();
app.use(serveFavicon('./public/favicon.ico'));
app.use(serveStatic('./public'));
app.use(bodyParser.json());
// client-side `xmmProcessor` create an Ajax request with POST method
app.use(connectRoute(router => router.post('/train', train)));

const server = http.createServer(app);
server.listen(port, () => console.log(chalk.cyan(`server started: http://127.0.0.1:${port}`)));
