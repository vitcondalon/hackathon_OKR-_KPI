const app = require('./app');
const env = require('./config/env');

app.listen(env.port, env.host, () => {
  console.log(`Backend running on http://${env.host}:${env.port}${env.apiPrefix}`);
});
