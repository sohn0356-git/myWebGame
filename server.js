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
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0] || "/");
  const rel = clean === "/" ? "/index.html" : clean;
  const filePath = path.join(WEB_DIR, rel);
  if (!filePath.startsWith(WEB_DIR)) return null;
  return filePath;
}

http
  .createServer((req, res) => {
    const filePath = resolveFile(req.url || "/");
    if (!filePath) {
      res.writeHead(400);
      res.end("Bad request");
      return;
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        if (path.basename(filePath) !== "index.html") {
          fs.readFile(path.join(WEB_DIR, "index.html"), (indexErr, indexData) => {
            if (indexErr) {
              res.writeHead(404);
              res.end("Not found");
              return;
            }
            res.writeHead(200, { "Content-Type": MIME[".html"] });
            res.end(indexData);
          });
          return;
        }

        res.writeHead(404);
        res.end("Not found");
        return;
      }

      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
    });
  })
  .listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
