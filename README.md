# Assignment 8 - First Express Server

A small information server for a made-up study programme ("Biruni Web Studies"), built with Node.js and Express 5.
It serves a web page from `public/`, offers several API routes, logs every request and counts how many it has served.

## How to install and run

Requirements: Node.js (current LTS).

```bash
git clone https://github.com/YlmTalha/Web-Lab8.git
cd Web-Lab8
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

Output of `curl --include` against the running server (`npm run dev`). It covers a successful JSON response (200), the redirect (301), a 404 on an `/api` path (JSON), a 404 on a page path (text), the 403 response and the 201 response.

```text
$ curl --include http://localhost:3000/api/courses
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 208
ETag: W/"d0-jk7GTXGJNG3B11UjNcudPpzj63c"
Date: Mon, 16 Nov 2026 17:19:02 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Web Programming","credits":6},{"id":2,"title":"Operating Systems","credits":6},{"id":3,"title":"Database Management Systems","credits":5},{"id":4,"title":"Software Engineering","credits":5}]

$ curl --include http://localhost:3000/old-page
HTTP/1.1 301 Moved Permanently
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 40
Date: Mon, 16 Nov 2026 17:19:02 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Moved Permanently. Redirecting to /hello

$ curl --include http://localhost:3000/api/nope
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-bm7tJgu8FHlq5QU+Y6gDxOGPfRc"
Date: Mon, 16 Nov 2026 17:19:02 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}

$ curl --include http://localhost:3000/nope
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 21
ETag: W/"15-o+niRM6mpkOxJ7mcVvkkpvwkLEI"
Date: Mon, 16 Nov 2026 17:19:02 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Page not found: /nope

$ curl --include http://localhost:3000/api/admin
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-TLNzmZqKxaTuFdX/dVWWPBu44/c"
Date: Mon, 16 Nov 2026 17:19:02 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}

$ curl --include -X POST http://localhost:3000/api/subscribe
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-oWAPIqDXuocNexKhPYW9ayyk98c"
Date: Mon, 16 Nov 2026 17:19:02 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```


## Reasoning questions

### Route order
Experiment: I moved the 404 fallback to the top, right after the two middlewares. Every request then returned 404: `/` gave "Page not found: /", `/hello` gave "Page not found: /hello" and `/api/courses` gave `{"error":"Not found"}`. Express checks middleware and routes in the order they are registered. `app.use` without a path matches every request and sends a response without calling `next()`, so the real routes below it were never reached. That is why the fallback must be registered last.

### Middleware
Experiment: I removed `next()` from the logger. The server still printed the log line (for example `GET /hello`), but the browser kept loading and never got an answer; with curl the request timed out. The logger neither sent a response nor passed the request on, so the request was left hanging. Every middleware must either send a response or call `next()`.

### Status codes
`POST /api/subscribe` answers 201 Created because the request created something new (a subscription), and 201 says exactly that, while 200 only means "OK". A missing page must be a 404 because programs read the status code, not the text: browsers, search engines and `fetch` (`res.ok`) would treat a 200 as a success, and a search engine could even index the error page.

### Configuration
The port comes from `process.env.PORT` because the environment should decide it, not the code. Hosting platforms (for example Render or Heroku) give the app a port through this variable, and port 3000 may already be in use on another machine. With the fallback (`|| 3000`) the server still works locally without any setup.

### Dependencies
`node_modules` is not committed because it is very large and can be rebuilt exactly from `package.json` and `package-lock.json`. After cloning, a teammate only has to run `npm install` and then `npm start` (or `npm run dev`).

### Same origin
If `index.html` is opened directly from disk (`file://`), relative URLs like `/api/courses` point to files on the disk, not to the server, so the buttons fail. Even with a full URL like `http://localhost:3000/api/courses`, the page and the API would have different origins, and the browser would block reading the response unless the server allowed it with CORS headers. This restriction is called the Same-Origin Policy.

## Self-study notes

### Node version and running time of the process
The Node.js `process` object has `process.version` (for example `"v24.15.0"`) and `process.uptime()`, which returns the seconds since the process started as a decimal number. In `/api/status` I use both and round the uptime with `Math.round`.

### Sending a response with a specific content type
`res.send` with a string sets `Content-Type: text/html` by default. For `/hello`, `/robots.txt` and the non-API 404, I call `res.type('text/plain')` before `res.send`, so the header becomes `text/plain; charset=utf-8`. `res.json` sets `application/json` automatically.

### Displaying JSON neatly in the page
In `public/app.js` I check the `Content-Type` of the response. For JSON I use `JSON.stringify(data, null, 2)`, where the third argument adds two spaces of indentation, and I put the text in a `<pre>` element, which keeps the line breaks and spaces.

## Challenges
The hardest part was route order and the 404 fallback. In Express 4 examples the fallback is written as `app.get('*', ...)`, but Express 5 does not accept this, so I used `app.use` without a path at the end of the file. I only understood why it has to be last after the experiment where I moved it to the top and every page returned 404.
