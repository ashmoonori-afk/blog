const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const POSTS_FILE = path.join(__dirname, 'posts', 'posts.json');
const SETTINGS_FILE = path.join(__dirname, 'posts', 'settings.json');

fs.mkdirSync(UPLOADS_DIR, { recursive: true });

app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '1y',
  immutable: true
}));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|svg/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    cb(null, ext && mime);
  }
});

const DEFAULT_SETTINGS = {
  hero: {
    label: 'Freshoh Works',
    title: '파트너의 성장을 설계합니다',
    subtitle: '고객경험, 브랜드, 운영 - 프레시오가 현장에서 만든 변화의 기록',
    cta: '프로젝트 보기',
    ctaLink: '#stories',
    bgColor: ''
  },
  site: {
    name: 'Freshoh',
    sectionTitle: '프로젝트',
    sectionSubtitle: '프레시오의 에디토리얼과 프로젝트 기록'
  }
};

function readSettings() {
  if (!fs.existsSync(SETTINGS_FILE)) return DEFAULT_SETTINGS;

  try {
    return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

function writeSettings(settings) {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

function readPosts() {
  if (!fs.existsSync(POSTS_FILE)) return [];
  return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf-8'));
}

function writePosts(posts) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf-8');
}

function makeUploadName(ext) {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
}

function buildAsset(url, meta = {}) {
  return {
    url,
    width: meta.width || null,
    height: meta.height || null,
    format: meta.format || '',
    variants: meta.variants || {}
  };
}

function saveOriginalUpload(file) {
  const ext = path.extname(file.originalname).toLowerCase() || '.bin';
  const filename = makeUploadName(ext);
  const url = `/uploads/${filename}`;

  fs.writeFileSync(path.join(UPLOADS_DIR, filename), file.buffer);

  return buildAsset(url, {
    format: ext.replace('.', ''),
    variants: {
      thumb: { url },
      body: { url },
      hero: { url }
    }
  });
}

async function saveOptimizedUpload(file) {
  const variantsConfig = [
    { key: 'thumb', width: 640, quality: 72 },
    { key: 'body', width: 1280, quality: 80 },
    { key: 'hero', width: 1600, quality: 82 }
  ];
  const metadata = await sharp(file.buffer).metadata();
  const basename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const variants = {};

  for (const config of variantsConfig) {
    const filename = `${basename}-${config.key}.webp`;
    const outputPath = path.join(UPLOADS_DIR, filename);
    const info = await sharp(file.buffer)
      .rotate()
      .resize({
        width: config.width,
        height: config.width,
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({
        quality: config.quality,
        effort: 4
      })
      .toFile(outputPath);

    variants[config.key] = {
      url: `/uploads/${filename}`,
      width: info.width,
      height: info.height,
      format: 'webp'
    };
  }

  return buildAsset(variants.hero.url, {
    width: metadata.width || variants.hero.width,
    height: metadata.height || variants.hero.height,
    format: 'webp',
    variants
  });
}

async function storeUpload(file) {
  const mime = (file.mimetype || '').toLowerCase();

  if (mime.includes('svg') || mime.includes('gif')) {
    return saveOriginalUpload(file);
  }

  return saveOptimizedUpload(file);
}

app.get('/api/posts', (req, res) => {
  const posts = readPosts()
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(posts);
});

app.get('/api/admin/posts', (req, res) => {
  const posts = readPosts().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(posts);
});

app.get('/api/posts/:id', (req, res) => {
  const posts = readPosts();
  const post = posts.find((item) => item.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: '글을 찾을 수 없습니다' });
  }

  res.json(post);
});

app.post('/api/posts', (req, res) => {
  const posts = readPosts();
  const post = {
    id: uuidv4(),
    title: req.body.title || '제목 없음',
    category: req.body.category || '일반',
    excerpt: req.body.excerpt || '',
    content: req.body.content || '',
    thumbnail: req.body.thumbnail || '',
    thumbnailColor: req.body.thumbnailColor || '#c8b8a8',
    thumbnailRatio: req.body.thumbnailRatio || '',
    published: req.body.published !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  posts.push(post);
  writePosts(posts);
  res.status(201).json(post);
});

app.put('/api/posts/:id', (req, res) => {
  const posts = readPosts();
  const index = posts.findIndex((post) => post.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: '글을 찾을 수 없습니다' });
  }

  posts[index] = { ...posts[index], ...req.body, updatedAt: new Date().toISOString() };
  writePosts(posts);
  res.json(posts[index]);
});

app.delete('/api/posts/:id', (req, res) => {
  let posts = readPosts();
  const post = posts.find((item) => item.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: '글을 찾을 수 없습니다' });
  }

  posts = posts.filter((item) => item.id !== req.params.id);
  writePosts(posts);
  res.json({ success: true });
});

app.get('/api/settings', (req, res) => {
  res.json(readSettings());
});

app.put('/api/settings', (req, res) => {
  const current = readSettings();
  const updated = { ...current, ...req.body };

  if (req.body.hero) {
    updated.hero = { ...current.hero, ...req.body.hero };
  }

  if (req.body.site) {
    updated.site = { ...current.site, ...req.body.site };
  }

  writeSettings(updated);
  res.json(updated);
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '파일이 없습니다' });
  }

  try {
    const image = await storeUpload(req.file);
    res.json({ url: image.url, image });
  } catch (error) {
    res.status(500).json({ error: '이미지 처리에 실패했습니다' });
  }
});

app.get('/article/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'article.html'));
});

if (require.main === module) {
  app.listen(PORT, HOST, () => {
    console.log(`서버 실행중 http://${HOST}:${PORT}`);
    console.log(`관리자 페이지: http://${HOST}:${PORT}/admin/`);
  });
}

module.exports = app;
