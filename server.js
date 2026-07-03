const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const HOST = '127.0.0.1';

const server = http.createServer((req, res) => {
    console.log(`[${new Date().toLocaleString()}] ${req.method} ${req.url}`);

    // Определяем путь к файлу
    let filePath = path.join(__dirname, req.url);
    
    // Если запрос к корню — отдаём index.html
    if (req.url === '/' || req.url === '') {
        filePath = path.join(__dirname, 'index.html');
    }

    // Если запрос к папке без слеша — добавляем index.html
    if (req.url.endsWith('/')) {
        filePath = path.join(__dirname, req.url, 'index.html');
    }

    // Получаем расширение файла
    const ext = path.extname(filePath).toLowerCase();
    
    // MIME-типы
    const mimeTypes = {
        '.html': 'text/html; charset=utf-8',
        '.htm': 'text/html; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.txt': 'text/plain; charset=utf-8',
        '.xml': 'application/xml; charset=utf-8',
        '.pdf': 'application/pdf',
        '.zip': 'application/zip',
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mp3': 'audio/mpeg',
        '.wav': 'audio/wav',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
        '.ttf': 'font/ttf',
        '.eot': 'application/vnd.ms-fontobject',
        '.otf': 'font/otf',
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    // Проверяем, существует ли файл
    fs.stat(filePath, (err, stats) => {
        if (err) {
            // Файл не найден
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"><title>404</title></head>
                <body style="font-family:sans-serif;text-align:center;padding:50px;background:#0b0d15;color:#e4e7f0;">
                    <h1 style="font-size:72px;color:#b388ff;">404</h1>
                    <p>Файл <strong>${req.url}</strong> не найден</p>
                    <a href="/" style="color:#b388ff;text-decoration:none;border:1px solid #b388ff;padding:10px 30px;display:inline-block;margin-top:20px;">Вернуться на главную</a>
                </body>
                </html>
            `);
            return;
        }

        // Если это папка — ищем index.html
        if (stats.isDirectory()) {
            const indexPath = path.join(filePath, 'index.html');
            fs.stat(indexPath, (err2, stats2) => {
                if (err2 || !stats2.isFile()) {
                    res.writeHead(404);
                    res.end('<h1>404 — index.html не найден</h1>');
                    return;
                }
                fs.readFile(indexPath, (err3, data) => {
                    if (err3) {
                        res.writeHead(500);
                        res.end('500');
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(data);
                });
            });
            return;
        }

        // Читаем и отдаём файл
        fs.readFile(filePath, (err2, data) => {
            if (err2) {
                res.writeHead(500);
                res.end('500 — Ошибка сервера');
                return;
            }
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    });
});

server.listen(PORT, HOST, () => {
    const url = `http://${HOST}:${PORT}`;
    console.log(`\n========================================`);
    console.log(`🚀 Сервер Prime Code запущен!`);
    console.log(`📡 Адрес: ${url}`);
    console.log(`📁 Папка: ${__dirname}`);
    console.log(`========================================\n`);
    console.log(`🔹 Главная: ${url}/`);
    console.log(`🔹 LOFT:    ${url}/loft/`);
    console.log(`🔹 Для остановки нажми Ctrl+C\n`);

    // Автоматически открываем браузер
    const openCommand = process.platform === 'win32' 
        ? `start ${url}` 
        : process.platform === 'darwin' 
        ? `open ${url}` 
        : `xdg-open ${url}`;
    
    exec(openCommand, (err) => {
        if (err) {
            console.log('❌ Не удалось автоматически открыть браузер');
            console.log(`📌 Открой вручную: ${url}`);
        } else {
            console.log('✅ Браузер открыт автоматически');
        }
    });
});

process.on('SIGINT', () => {
    console.log('\n🛑 Сервер остановлен');
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Ошибка:', err.message);
});