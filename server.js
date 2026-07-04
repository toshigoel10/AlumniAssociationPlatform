const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, 'Frontend');

const users = [];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function sendFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  if (pathname === '/api/register' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const existingUser = users.find((u) => u.email === data.email);
        if (existingUser) {
          sendJson(res, 409, { success: false, message: 'User already exists' });
          return;
        }
        const newUser = {
          id: Date.now().toString(),
          fullName: data.fullName || '',
          email: data.email,
          password: data.password || '',
          batch: data.batch || ''
        };
        users.push(newUser);
        sendJson(res, 201, { success: true, user: { id: newUser.id, fullName: newUser.fullName, email: newUser.email, batch: newUser.batch } });
      } catch {
        sendJson(res, 400, { success: false, message: 'Invalid JSON' });
      }
    });
    return;
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const user = users.find((u) => u.email === data.email && u.password === data.password);
        if (!user) {
          sendJson(res, 401, { success: false, message: 'Invalid credentials' });
          return;
        }
        sendJson(res, 200, { success: true, user: { id: user.id, fullName: user.fullName, email: user.email, batch: user.batch } });
      } catch {
        sendJson(res, 400, { success: false, message: 'Invalid JSON' });
      }
    });
    return;
  }

  if (pathname === '/api/me') {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    const user = users.find((u) => u.id === token);
    if (!user) {
      sendJson(res, 401, { success: false, message: 'Unauthorized' });
      return;
    }
    sendJson(res, 200, { success: true, user: { id: user.id, fullName: user.fullName, email: user.email, batch: user.batch } });
    return;
  }

  if (pathname === '/') {
    sendFile(res, path.join(ROOT, 'index.html'), mimeTypes['.html']);
    return;
  }

  const requestedPath = path.join(ROOT, pathname);
  const isSafePath = requestedPath.startsWith(ROOT);
  if (isSafePath && fs.existsSync(requestedPath) && fs.statSync(requestedPath).isFile()) {
    const ext = path.extname(requestedPath).toLowerCase();
    sendFile(res, requestedPath, mimeTypes[ext] || 'application/octet-stream');
    return;
  }

  if (pathname !== '/favicon.ico') {
    sendFile(res, path.join(ROOT, 'index.html'), mimeTypes['.html']);
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
