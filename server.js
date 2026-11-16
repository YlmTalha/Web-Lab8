import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

// ----- Data (hard-coded, no database) -----

const COURSES = [
  { id: 1, title: 'Web Programming', credits: 6 },
  { id: 2, title: 'Operating Systems', credits: 6 },
  { id: 3, title: 'Database Management Systems', credits: 5 },
  { id: 4, title: 'Software Engineering', credits: 5 },
];

// ----- Middleware (registered before all routes) -----

let requestsServed = 0;

// 1) Request logger: one line per request, then pass control on
function logger(req, res, next) {
  console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
}

// 2) Request counter: counts every request that reaches the server,
//    including static files and 404s, because it runs before everything else
function requestCounter(req, res, next) {
  requestsServed += 1;
  next();
}

app.use(logger);
app.use(requestCounter);

// ----- Routes -----

app.get('/hello', (req, res) => {
  // res.send with a string defaults to text/html, so set plain text explicitly
  res.type('text/plain').send("Hello from Talha's server");
});

app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send('User-agent: *\nDisallow: /api/admin\n');
});

app.get('/old-page', (req, res) => {
  // 301 = moved permanently: the old address will not come back
  res.redirect(301, '/hello');
});

// ----- API routes -----

app.get('/api/courses', (req, res) => {
  res.json(COURSES);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    nodeVersion: process.version, // e.g. "v24.15.0"
    uptimeSeconds: Math.round(process.uptime()), // seconds since the process started
  });
});

app.get('/api/headers', (req, res) => {
  res.json({
    userAgent: req.get('User-Agent') ?? null,
    accept: req.get('Accept') ?? null,
  });
});

app.post('/api/subscribe', (req, res) => {
  // 201 Created: the request created something new (a subscription)
  res.status(201).json({ subscribed: true });
});

app.get('/api/admin', (req, res) => {
  // 403 Forbidden: the server understood the request but refuses it
  res.status(403).json({ error: 'Forbidden' });
});

app.get('/api/stats', (req, res) => {
  res.json({ requestsServed });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
