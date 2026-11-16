# Assignment 8 - First Express Server

A small information server for a made-up study programme ("Biruni Web Studies"), built with Node.js and Express 5.
It serves a web page from `public/`, offers several API routes, logs every request and counts how many it has served.

## How to install and run

Requirements: Node.js (current LTS).

```bash
git clone https://github.com/YlmTalha/<repo-name>.git
cd <repo-name>
npm install        # installs express from package.json / package-lock.json
npm start          # node server.js
npm run dev        # node --watch server.js (restarts on file changes)
```

The server starts on `http://localhost:3000`. Another port can be used with `PORT=4000 npm start`.

## File organization

```
.
├─ server.js          Express app: middleware, static files, routes, 404 fallback
├─ public/
│  ├─ index.html      programme description and one button per API route
│  ├─ styles.css      page styles (external, no inline styles)
│  └─ app.js          fetch() calls, shows status code and response body
├─ package.json       "type": "module", start / dev scripts, express dependency
├─ package-lock.json  exact dependency versions
└─ .gitignore         node_modules/ and .env
```

## Routes

| Method | Path | Response |
|---|---|---|
| GET | `/` | `public/index.html` (via `express.static`) |
| GET | `/hello` | 200, plain text |
| GET | `/robots.txt` | 200, plain text |
| GET | `/old-page` | 301 redirect to `/hello` |
| GET | `/api/courses` | 200, JSON array of courses |
| GET | `/api/status` | 200, JSON `{ status, nodeVersion, uptimeSeconds }` |
| GET | `/api/headers` | 200, JSON with the User-Agent and Accept headers |
| POST | `/api/subscribe` | 201, JSON `{ "subscribed": true }` |
| GET | `/api/admin` | 403, JSON `{ "error": "Forbidden" }` |
| GET | `/api/stats` | 200, JSON `{ "requestsServed": <number> }` |
| any | anything else | 404, JSON `{ "error": "Not found" }` under `/api`, plain text otherwise |

## Middleware: order and counting rules

The order in `server.js` is: **logger → request counter → `express.static` → routes → 404 fallback**.

- The logger and the counter are registered first, so they run for every request before anything can send a response. Both call `next()` so the request continues.
- Because of this order, the counter counts **every request that reaches the server**: page loads, static files (`styles.css`, `app.js`), API calls, 404s and the `/api/stats` request itself. I chose this because the number should show the real load on the server. If the counter were placed after `express.static`, static files would not be counted, because `express.static` ends the request when it finds a file.
- The 404 fallback is registered last, so it only runs when no route matched and never hides a real route.

## Testing evidence (curl)

_TODO: paste curl output_

## Reasoning questions

### Route order
_TODO_

### Middleware
_TODO_

### Status codes
_TODO_

### Configuration
_TODO_

### Dependencies
_TODO_

### Same origin
_TODO_

## Self-study notes

### Node version and running time of the process
_TODO_

### Sending a response with a specific content type
_TODO_

### Displaying JSON neatly in the page
_TODO_

## Challenges
_TODO_
