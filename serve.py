#!/usr/bin/env python3
"""Локальный сервер для разработки: отдаёт файлы без кэширования.
Запуск:  python3 serve.py [порт]   →  http://localhost:8080
"""
import sys, http.server, socketserver

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()
    def log_message(self, *a): pass

with socketserver.TCPServer(('', PORT), Handler) as httpd:
    print(f'AG Peptides → http://localhost:{PORT}  (Ctrl+C для остановки)')
    httpd.serve_forever()
