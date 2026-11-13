#!/usr/bin/env node
/* 知识冒险岛 · 家长中心服务
 * 零依赖（只用 Node 内置模块），不需要 npm install
 *
 * 作用：
 *   1. 托管 ipad-design/ 整个静态站点（含孩子端所有页面）
 *   2. 提供家长中心需要的接口：课程分类 / 讲次视频 / 灵石商城商品的读写
 *   3. 视频、图片上传落盘到 ipad-design/uploads/
 *   4. 每次保存同时写 catalog.json（家长中心读）和 catalog.js（孩子端同步读）
 *
 * 启动：node parent-server.js       默认 http://127.0.0.1:8780/parent.html
 * 换端口：PARENT_PORT=9000 node parent-server.js
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const SITE = path.join(ROOT, 'ipad-design');
const UPLOADS = path.join(SITE, 'uploads');
const DATA_JSON = path.join(SITE, 'catalog.json');
const DATA_JS = path.join(SITE, 'catalog.js');
const PORT = parseInt(process.env.PARENT_PORT || '8780', 10);
const HOST = process.env.PARENT_HOST || '0.0.0.0';
/* 家长密码：既是家长中心的进门密码，也是写接口的令牌 */
const PIN = String(process.env.PARENT_PIN || '1234');
const MAX_UPLOAD = 512 * 1024 * 1024; // 512MB，够放一节课的视频

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.m4v': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function mimeOf(p) {
  return MIME[path.extname(p).toLowerCase()] || 'application/octet-stream';
}

function ensureDirs() {
  if (!fs.existsSync(UPLOADS)) fs.mkdirSync(UPLOADS, { recursive: true });
}

/* ---------------- 目录数据 ---------------- */

const EMPTY_CATALOG = { v: 1, updated: '', series: [], items: [], books: [], audios: [], videos: [] };

function readCatalog() {
  try {
    const raw = fs.readFileSync(DATA_JSON, 'utf8');
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object') return Object.assign({}, EMPTY_CATALOG);
    if (!Array.isArray(obj.series)) obj.series = [];
    if (!Array.isArray(obj.items)) obj.items = [];
    /* books / audios / videos 不做补全：
     * 前端靠「字段不存在」判断要不要带入内置内容，空数组代表家长主动删空了 */
    return obj;
  } catch (e) {
    return Object.assign({}, EMPTY_CATALOG);
  }
}

/* 孩子端用 catalog.js 同步读取（<script> 或同步 XHR 都行），
 * 所以保存时必须把同一份数据再写成 JS 字面量 */
function writeCatalog(obj) {
  const clean = {
    v: 1,
    updated: new Date().toISOString(),
    series: obj.series || [],
    items: obj.items || [],
    /* 内容馆：有声故事 / 少年阅览室 / 动画馆 */
    books: obj.books || [],
    audios: obj.audios || [],
    videos: obj.videos || []
  };
  fs.writeFileSync(DATA_JSON, JSON.stringify(clean, null, 2), 'utf8');
  const js = '/* 由家长中心自动生成，请勿手工编辑。修改入口：parent.html */\n' +
    'window.CATALOG = ' + JSON.stringify(clean) + ';\n';
  fs.writeFileSync(DATA_JS, js, 'utf8');
  return clean;
}

/* ---------------- 上传 ---------------- */

function safeName(name) {
  let n = String(name || '').replace(/\\/g, '/').split('/').pop();
  n = n.replace(/[\u0000-\u001f<>:"|?*]/g, '').trim();
  n = n.replace(/\s+/g, '_');
  if (!n || n === '.' || n === '..') n = 'file';
  // 保留中文，只砍危险字符
  return n.slice(-120);
}

function uniquePath(dir, filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  let p = path.join(dir, filename);
  let i = 1;
  while (fs.existsSync(p)) {
    p = path.join(dir, base + '-' + i + ext);
    i++;
  }
  return p;
}

/* ---------------- HTTP 工具 ---------------- */

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

function send(res, code, body, type) {
  cors(res);
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(String(body), 'utf8');
  res.writeHead(code, {
    'Content-Type': type || 'application/json; charset=utf-8',
    'Content-Length': buf.length,
    'Cache-Control': 'no-store'
  });
  res.end(buf);
}

function sendJson(res, code, obj) {
  send(res, code, JSON.stringify(obj), 'application/json; charset=utf-8');
}

/* 写操作（改配置、上传素材）必须带家长密码，防止公网上被人直接改 */
function authed(req) {
  return String(req.headers['x-parent-pin'] || '') === PIN;
}
function deny(res) {
  return sendJson(res, 401, { ok: false, error: '家长密码不对，请重新进入家长中心' });
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let killed = false;
    req.on('data', c => {
      if (killed) return;
      size += c.length;
      if (size > limit) {
        killed = true;
        reject(new Error('文件太大（上限 ' + Math.round(limit / 1024 / 1024) + 'MB）'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => { if (!killed) resolve(Buffer.concat(chunks)); });
    req.on('error', e => { if (!killed) reject(e); });
  });
}

function safeJoin(base, target) {
  const p = path.resolve(base, '.' + path.sep + target);
  if (p !== base && !p.startsWith(base + path.sep)) return null;
  return p;
}

/* 视频要能拖动进度条，必须支持 Range */
function serveFile(req, res, filePath) {
  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) return send(res, 404, 'Not Found', 'text/plain; charset=utf-8');

    const type = mimeOf(filePath);
    const range = req.headers.range;
    const m = range && /bytes=(\d*)-(\d*)/.exec(range);

    if (m) {
      let start = m[1] ? parseInt(m[1], 10) : 0;
      let end = m[2] ? parseInt(m[2], 10) : st.size - 1;
      if (isNaN(start) || start >= st.size) {
        cors(res);
        res.writeHead(416, { 'Content-Range': 'bytes */' + st.size });
        return res.end();
      }
      if (isNaN(end) || end >= st.size) end = st.size - 1;
      cors(res);
      res.writeHead(206, {
        'Content-Type': type,
        'Content-Length': end - start + 1,
        'Content-Range': 'bytes ' + start + '-' + end + '/' + st.size,
        'Accept-Ranges': 'bytes'
      });
      return fs.createReadStream(filePath, { start, end }).pipe(res);
    }

    cors(res);
    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': st.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache'
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ---------------- 路由 ---------------- */

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://' + (req.headers.host || '127.0.0.1'));
  const pathname = decodeURIComponent(u.pathname);

  if (req.method === 'OPTIONS') { cors(res); res.writeHead(204); return res.end(); }

  try {
    /* ---- 健康检查 ---- */
    if (pathname === '/api/health') {
      return sendJson(res, 200, { ok: true, port: PORT, site: SITE, uploads: UPLOADS });
    }

    /* ---- 家长密码校验 ---- */
    if (pathname === '/api/login' && req.method === 'POST') {
      const buf = await readBody(req, 4096);
      let pin = '';
      try { pin = String(JSON.parse(buf.toString('utf8')).pin || ''); } catch (e) {}
      if (pin === PIN) return sendJson(res, 200, { ok: true });
      return sendJson(res, 401, { ok: false, error: '家长密码不对' });
    }

    /* ---- 读目录 ---- */
    if (pathname === '/api/catalog' && req.method === 'GET') {
      return sendJson(res, 200, readCatalog());
    }

    /* ---- 存目录 ---- */
    if (pathname === '/api/catalog' && (req.method === 'PUT' || req.method === 'POST')) {
      if (!authed(req)) return deny(res);
      const buf = await readBody(req, 8 * 1024 * 1024);
      let obj;
      try { obj = JSON.parse(buf.toString('utf8')); }
      catch (e) { return sendJson(res, 400, { ok: false, error: '数据不是合法 JSON' }); }
      if (!obj || !Array.isArray(obj.series) || !Array.isArray(obj.items)) {
        return sendJson(res, 400, { ok: false, error: '数据格式不对，需要 series 和 items 两个数组' });
      }
      const saved = writeCatalog(obj);
      console.log('[家长中心] 已保存：' + saved.series.length + ' 个课程体系 / ' + saved.items.length + ' 个商品');
      return sendJson(res, 200, { ok: true, saved: saved, jsonUrl: 'catalog.json', jsUrl: 'catalog.js' });
    }

    /* ---- 上传：前端直接把文件当作 body，文件名走 query ---- */
    if (pathname === '/api/upload' && req.method === 'POST') {
      if (!authed(req)) return deny(res);
      const kind = (u.searchParams.get('kind') || 'video').toLowerCase();
      const name = safeName(u.searchParams.get('name') || (kind === 'image' ? 'image.png' : 'video.mp4'));
      const buf = await readBody(req, MAX_UPLOAD);
      if (!buf.length) return sendJson(res, 400, { ok: false, error: '文件是空的' });

      ensureDirs();
      const target = uniquePath(UPLOADS, name);
      fs.writeFileSync(target, buf);

      const rel = 'uploads/' + path.basename(target);
      console.log('[家长中心] 上传成功 ' + rel + ' · ' + (buf.length / 1024 / 1024).toFixed(1) + 'MB');
      return sendJson(res, 200, {
        ok: true,
        url: rel,
        name: path.basename(target),
        size: buf.length,
        kind: kind
      });
    }

    /* ---- 删除已上传素材 ---- */
    if (pathname === '/api/upload' && req.method === 'DELETE') {
      if (!authed(req)) return deny(res);
      const rel = u.searchParams.get('url') || '';
      if (rel.indexOf('uploads/') !== 0) return sendJson(res, 400, { ok: false, error: '只能删 uploads/ 下的文件' });
      const p = safeJoin(SITE, rel);
      if (!p) return sendJson(res, 400, { ok: false, error: '路径不合法' });
      try { fs.unlinkSync(p); } catch (e) {}
      return sendJson(res, 200, { ok: true });
    }

    /* ---- 静态站点 ---- */
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return send(res, 405, 'Method Not Allowed', 'text/plain; charset=utf-8');
    }

    let rel = pathname === '/' ? '/parent.html' : pathname;
    const filePath = safeJoin(SITE, rel.replace(/^\/+/, ''));
    if (!filePath) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');

    fs.stat(filePath, (err, st) => {
      if (!err && st.isDirectory()) {
        return serveFile(req, res, path.join(filePath, 'index.html'));
      }
      if (!err && st.isFile()) return serveFile(req, res, filePath);
      return send(res, 404, '404 · 找不到 ' + pathname, 'text/plain; charset=utf-8');
    });
  } catch (e) {
    return sendJson(res, 500, { ok: false, error: e.message || String(e) });
  }
});

ensureDirs();
server.listen(PORT, HOST, () => {
  console.log('');
  console.log('  知识冒险岛 · 家长中心');
  console.log('  ------------------------------------------');
  console.log('  监听      ' + HOST + ':' + PORT);
  console.log('  家长中心  http://127.0.0.1:' + PORT + '/parent.html');
  console.log('  孩子端    http://127.0.0.1:' + PORT + '/home.html');
  console.log('  数据文件  ' + DATA_JSON);
  console.log('  上传目录  ' + UPLOADS);
  console.log('  ------------------------------------------');
  console.log('  按 Ctrl+C 停止');
  console.log('');
});
