const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register, prefix: 'collegekhoj_' });

const httpRequestDuration = new client.Histogram({
  name: 'collegekhoj_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});

const httpRequestCounter = new client.Counter({
  name: 'collegekhoj_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpErrorCounter = new client.Counter({
  name: 'collegekhoj_http_errors_total',
  help: 'Total number of HTTP responses with status >= 500',
  labelNames: ['method', 'route'],
});

register.registerMetric(httpRequestDuration);
register.registerMetric(httpRequestCounter);
register.registerMetric(httpErrorCounter);

function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    // Use the matched route pattern (not the raw URL) to keep label cardinality bounded.
    const route = (req.route && req.baseUrl + req.route.path) || req.path;
    const durationSeconds = Number(process.hrtime.bigint() - start) / 1e9;

    httpRequestDuration.observe(
      { method: req.method, route, status_code: res.statusCode },
      durationSeconds
    );
    httpRequestCounter.inc({ method: req.method, route, status_code: res.statusCode });
    if (res.statusCode >= 500) {
      httpErrorCounter.inc({ method: req.method, route });
    }
  });
  next();
}

async function metricsEndpoint(req, res) {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
}

module.exports = { metricsMiddleware, metricsEndpoint };
