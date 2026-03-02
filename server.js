const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const WEB_DIR = path.join(__dirname, "web");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === "/api/ping") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ ok: true, now: Date.now() }));
    return;
  }

  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const unsafePath = path.join(WEB_DIR, pathname);
  const safePath = path.normalize(unsafePath);
  if (!safePath.startsWith(WEB_DIR)) {
    res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Forbidden");
    return;
  }

  fs.stat(safePath, (err, stat) => {
    if (!err && stat.isFile()) {
      sendFile(safePath, res);
      return;
    }
    sendFile(path.join(WEB_DIR, "index.html"), res);
  });
});

server.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});
