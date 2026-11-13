#!/usr/bin/env node
/* 把线上旧服务（47.116.6.229:3300）里已上传的音视频与电子书
 * 同步进家长中心的数据文件 catalog.json：
 *   mp3 / m4a → 有声故事馆（按 series 分专辑）
 *   pdf       → 少年阅览室
 *   mp4       → 动画馆（系列 + 剧集结构）
 *
 * 用法：node sync-media.js [媒体域名]
 *   默认 http://47.116.6.229:3300
 */
'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const ORIGIN = (process.argv[2] || 'http://47.116.6.229:3300').replace(/\/$/, '');
const SITE = path.join(__dirname, 'ipad-design');
const DATA_JSON = path.join(SITE, 'catalog.json');
const DATA_JS = path.join(SITE, 'catalog.js');

function get(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { timeout: 30000 }, res => {
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error('HTTP ' + res.statusCode + ' ' + url));
      }
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', c => buf += c);
      res.on('end', () => {
        try { resolve(JSON.parse(buf)); }
        catch (e) { reject(new Error('返回不是 JSON: ' + url)); }
      });
    });
    req.on('timeout', () => { req.destroy(new Error('超时 ' + url)); });
    req.on('error', reject);
  });
}

function abs(u) {
  if (!u) return '';
  if (/^https?:\/\//.test(u)) return u;
  return ORIGIN + (u.charAt(0) === '/' ? '' : '/') + u;
}

/* 旧系统里所有条目共用同一张外链封面，列表看着全一样。
 * 这里换成本地素材轮换，加载也更快更稳 */
const LOCAL_COVER = {
  book: ['assets/hall/book_insects.jpg', 'assets/hall/book_myth.jpg', 'assets/hall/book_sea.jpg'],
  audio: ['assets/hall/audio_wukong.jpg', 'assets/hall/audio_stars.jpg', 'assets/hall/audio_poem.jpg'],
  video: ['assets/hall/series_math.jpg', 'assets/hall/series_bio.jpg']
};
function pickCover(kind, i) {
  const list = LOCAL_COVER[kind];
  return list[i % list.length];
}

/* 旧数据里 subject 是英文，页面上要显示中文 */
const SUBJECT_CN = {
  chinese: '语文', math: '数学', english: '英语',
  biology: '探索', physics: '探索', science: '探索', history: '探索'
};
function subjectCN(s) {
  if (!s) return '探索';
  return SUBJECT_CN[String(s).toLowerCase()] || s;
}

/* 旧数据里有把《西游记》录成英语的，按标题纠一下 */
function smartSubject(raw, title) {
  const cn = subjectCN(raw);
  if (cn === '英语' && /[\u4e00-\u9fa5]{2,}/.test(String(title || ''))) return '语文';
  return cn;
}

/* 封面按学科挑，别让语文系列配一张分数披萨图 */
const VIDEO_COVER_BY_SUBJECT = {
  '数学': ['assets/hall/series_math.jpg'],
  '探索': ['assets/hall/series_bio.jpg', 'assets/hall/series_math.jpg'],
  '语文': ['assets/hall/book_myth.jpg', 'assets/hall/book_sea.jpg', 'assets/hall/audio_poem.jpg'],
  '英语': ['assets/hall/book_sea.jpg', 'assets/hall/audio_stars.jpg']
};
function videoCover(subject, i) {
  const list = VIDEO_COVER_BY_SUBJECT[subject] || LOCAL_COVER.video;
  return list[i % list.length];
}

(async () => {
  console.log('源站：' + ORIGIN);

  const [booksRes, audiosRes, seriesRes] = await Promise.all([
    get(ORIGIN + '/api/books/list'),
    get(ORIGIN + '/api/audios/list'),
    get(ORIGIN + '/api/series/list')
  ]);

  const rawBooks = booksRes.data || [];
  const rawAudios = audiosRes.data || [];
  const rawSeries = seriesRes.data || seriesRes.series || [];

  /* ---------- 绘本：只留有 PDF 或正文的 ---------- */
  const books = rawBooks.map((b, i) => ({
    id: b.id,
    title: b.title || '',
    author: b.author || '',
    category: b.category || '课外阅读',
    cover: pickCover('book', i),
    minutes: b.read_minutes || 0,
    readCount: b.read_count || 0,
    done: !!b.is_completed,
    summary: b.summary || '',
    content: b.content_text || '',
    pdf: abs(b.file_url || ''),
    album: b.series_id || ''
  }));

  /* ---------- 有声：按 series_id 分专辑 ---------- */
  const seriesById = {};
  rawSeries.forEach(s => { seriesById[s.id] = s; });

  const albumMap = {};
  const order = [];
  rawAudios.forEach(a => {
    const sid = a.series_id || 'single';
    if (!albumMap[sid]) {
      const s = seriesById[sid];
      albumMap[sid] = {
        id: sid,
        name: (s && s.title) || '未命名专辑',
        subject: smartSubject(s && s.subject, (s && s.title) || (a.title || '')),
        cover: pickCover('audio', order.length),
        category: a.category || '故事',
        speaker: a.speaker || '',
        episodes: []
      };
      order.push(sid);
    }
    /* 单集标题里普遍带着专辑名前缀，列表里显得很吵，去掉 */
    const albName = albumMap[sid].name || '';
    let t = a.title || '';
    if (albName && t.indexOf(albName) === 0) t = t.slice(albName.length);
    t = t.replace(/^[\s·\-—:：]+/, '').trim();

    albumMap[sid].episodes.push({
      id: a.id,
      title: t || a.title || '',
      speaker: a.speaker || '',
      seconds: a.duration_seconds || 0,
      url: abs(a.audio_url || '')
    });
  });

  const audios = order.map((sid, ai) => {
    const al = albumMap[sid];
    al.count = al.episodes.length;
    /* 专辑里集数多的时候，单集标题里重复的专辑前缀去掉，列表更清爽 */
    al.episodes.sort((x, y) => {
      const nx = (x.title.match(/第(\d+)/) || [])[1];
      const ny = (y.title.match(/第(\d+)/) || [])[1];
      return (parseInt(nx, 10) || 0) - (parseInt(ny, 10) || 0);
    });
    return al;
  });

  /* ---------- 动画：系列 + 剧集（旧接口没给视频地址，播放时回退本地示范片） ---------- */
  const videos = rawSeries
    .filter(s => (s.mediaType || 'video') === 'video')
    .map((s, vi) => ({
      id: s.id,
      name: s.title || '',
      subject: smartSubject(s.subject, s.title),
      cover: videoCover(smartSubject(s.subject, s.title), vi),
      desc: s.description || '',
      episodes: (s.episodes || []).map(e => ({
        n: e.episodeIndex,
        title: e.title || '',
        minutes: e.durationMinutes || 0,
        video: ''
      }))
    }));

  /* ---------- 写入 catalog.json（保留已有的课程体系与商城） ---------- */
  let cat = { v: 1, updated: '', series: [], items: [] };
  try { cat = JSON.parse(fs.readFileSync(DATA_JSON, 'utf8')); } catch (e) {}

  cat.books = books;
  cat.audios = audios;
  cat.videos = videos;
  cat.mediaOrigin = ORIGIN;
  cat.updated = new Date().toISOString();

  fs.writeFileSync(DATA_JSON, JSON.stringify(cat, null, 2), 'utf8');
  fs.writeFileSync(DATA_JS,
    '/* 由家长中心 / sync-media.js 自动生成，请勿手工编辑 */\n' +
    'window.CATALOG = ' + JSON.stringify(cat) + ';\n', 'utf8');

  const epAudio = audios.reduce((n, a) => n + a.episodes.length, 0);
  const epVideo = videos.reduce((n, v) => n + v.episodes.length, 0);
  const withPdf = books.filter(b => b.pdf).length;

  console.log('');
  console.log('同步完成：');
  console.log('  绘本  ' + books.length + ' 本（含 PDF ' + withPdf + ' 个）');
  console.log('  有声  ' + epAudio + ' 首，分 ' + audios.length + ' 张专辑');
  audios.forEach(a => console.log('        · ' + a.name + '  ' + a.episodes.length + ' 首'));
  console.log('  动画  ' + videos.length + ' 个系列，共 ' + epVideo + ' 集');
  console.log('');
  console.log('写入：' + DATA_JSON + '（' + (fs.statSync(DATA_JSON).size / 1024).toFixed(1) + ' KB）');
})().catch(e => {
  console.error('同步失败：' + e.message);
  process.exit(1);
});
