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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
