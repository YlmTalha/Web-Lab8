import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
