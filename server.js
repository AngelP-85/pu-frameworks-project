const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const authRouter = require('./routers/auth-router');
const employeeRouter = require('./routers/employee-router');
const reviewRouter = require('./routers/review-router');
const authenticateJWT = require('./services/authenticate-jwt');
const logRequest = require('./services/log-request');
const apiLimiter = require('./services/api-limiter');
const prometheusMiddleware = require('express-prometheus-middleware');

const publicRoutes = require('./config/publicRoutes');

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

// Configure and add the Prometheus middleware
app.use(
    prometheusMiddleware({
        metricsPath: '/metrics', // The endpoint to expose the metrics
        collectDefaultMetrics: true, // Collect default Node.js and process metrics
        requestDurationBuckets: [0.1, 0.5, 1, 1.5], // Histogram buckets for request duration
    }),
);

// Apply the rate limiter to your endpoints starting with /api/
app.use('/api/', apiLimiter);

// Log all incoming requests
app.use(logRequest);

// Authentication Router
app.use('/api/auth', authRouter);

// Apply the middleware globally
app.use(authenticateJWT(publicRoutes));

// Business logic related routers
app.use('/api/employees', employeeRouter);
app.use('/api/reviews', reviewRouter);

// Handle not found routes
app.use((req, res, next) => {
    res.status(404).send('Not Found');
});

// Handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
