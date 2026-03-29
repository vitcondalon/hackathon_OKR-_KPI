const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const cycleRoutes = require('./routes/cycleRoutes');
const objectiveRoutes = require('./routes/objectiveRoutes');
const keyResultRoutes = require('./routes/keyResultRoutes');
const checkinRoutes = require('./routes/checkinRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const kpiRoutes = require('./routes/kpiRoutes');
const swaggerRoutes = require('./docs/swaggerRoutes');
const { notFoundMiddleware, errorMiddleware } = require('./middlewares/errorMiddleware');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: true,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'okr-kpi-backend' });
});

app.use(`${env.apiPrefix}/docs`, swaggerRoutes);
app.use(`${env.apiPrefix}/auth`, authRoutes);
app.use(`${env.apiPrefix}/users`, userRoutes);
app.use(`${env.apiPrefix}/departments`, departmentRoutes);
app.use(`${env.apiPrefix}/cycles`, cycleRoutes);
app.use(`${env.apiPrefix}/objectives`, objectiveRoutes);
app.use(`${env.apiPrefix}/key-results`, keyResultRoutes);
app.use(`${env.apiPrefix}/checkins`, checkinRoutes);
app.use(`${env.apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${env.apiPrefix}/kpis`, kpiRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
