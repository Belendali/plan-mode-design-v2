#!/usr/bin/env python3
"""Dev server with no-store cache headers so edits show up on plain refresh."""
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    ThreadingHTTPServer(('', 8454), NoCacheHandler).serve_forever()
