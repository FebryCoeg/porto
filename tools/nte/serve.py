"""Server lokal yang meniru GitHub Pages: path yang tidak ada dilayani dengan 404.html
(dipakai website database supaya URL bersih seperti /esper/iroi bisa dibuka langsung).

Pemakaian: python tools/nte/serve.py [port]
"""
import http.server
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5500


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def send_error(self, code, message=None, explain=None):
        if code == 404 and (ROOT / "404.html").exists():
            body = (ROOT / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().send_error(code, message, explain)


if __name__ == "__main__":
    os.chdir(ROOT)
    http.server.ThreadingHTTPServer(("", PORT), Handler).serve_forever()
