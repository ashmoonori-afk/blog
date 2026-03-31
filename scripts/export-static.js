const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'site');
const uploadsDir = path.join(rootDir, 'uploads');
const postsFile = path.join(rootDir, 'posts', 'posts.json');
const settingsFile = path.join(rootDir, 'posts', 'settings.json');

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    return fallback;
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function normalizeImageAsset(value) {
  if (!value) return null;
  if (typeof value === 'string') return { url: value, variants: {} };
  if (typeof value === 'object' && typeof value.url === 'string') {
    return { ...value, variants: value.variants || {} };
  }
  return null;
}

function pickImageUrl(value, preferred = ['body', 'hero', 'thumb']) {
  const asset = normalizeImageAsset(value);
  const preferredList = Array.isArray(preferred) ? preferred : [preferred];

  if (!asset) return '';

  for (const key of preferredList) {
    const variantUrl = asset.variants?.[key]?.url;
    if (variantUrl) return variantUrl;
  }

  return asset.url || '';
}

function rootRelativePath(depth, assetUrl) {
  if (!assetUrl) return '';
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  return `${prefix}${assetUrl.replace(/^\/+/, '')}`;
}

function buildSrcSet(value, depth) {
  const asset = normalizeImageAsset(value);
  if (!asset) return '';

  const variants = ['thumb', 'body', 'hero']
    .map((key) => asset.variants?.[key])
    .filter(Boolean)
    .filter((variant, index, list) => list.findIndex((item) => item.url === variant.url) === index)
    .map((variant) => {
      const url = rootRelativePath(depth, variant.url);
      return variant.width ? `${url} ${variant.width}w` : url;
    });

  return variants.join(', ');
}

function renderResponsiveImage(value, depth, options = {}) {
  const src = rootRelativePath(depth, pickImageUrl(value, options.preferred || ['body', 'hero', 'thumb']));
  if (!src) return '';

  const attrs = [
    `src="${src}"`,
    `alt="${escapeHtml(options.alt || '')}"`
  ];
  const srcSet = buildSrcSet(value, depth);

  if (options.className) attrs.push(`class="${options.className}"`);
  if (srcSet) attrs.push(`srcset="${srcSet}"`);
  if (options.sizes) attrs.push(`sizes="${options.sizes}"`);
  if (options.loading) attrs.push(`loading="${options.loading}"`);
  if (options.decoding) attrs.push(`decoding="${options.decoding}"`);
  if (options.fetchpriority) attrs.push(`fetchpriority="${options.fetchpriority}"`);

  return `<img ${attrs.join(' ')}>`;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function estimateReadTime(post) {
  const text = `${post.title || ''}${post.excerpt || ''}`;
  return `${Math.max(3, Math.ceil(text.length / 80))} min read`;
}

function getCardVariant(index) {
  if (index === 0) return 'featured';
  return ((index - 1) % 3) === 2 ? 'landscape' : 'standard';
}

function buildThumbStyle(post, depth, preferredVariant) {
  const thumbUrl = rootRelativePath(depth, pickImageUrl(post.thumbnail, [preferredVariant, 'body', 'hero', 'thumb']));
  if (!thumbUrl) {
    return `background-color:${escapeHtml(post.thumbnailColor || '#c8b8a8')};`;
  }

  return `background-image:url('${thumbUrl}');background-size:cover;background-position:center;`;
}

function renderIndexCard(post, index) {
  const variant = getCardVariant(index);
  const ratioMap = { '16:9': 'ratio-16-9', '1:1': 'ratio-1-1', '4:3': 'ratio-4-3' };
  const ratioClass = ratioMap[post.thumbnailRatio] || '';
  const thumbStyle = buildThumbStyle(post, 0, variant === 'featured' ? 'body' : 'thumb');
  const href = `./article/${encodeURIComponent(post.id)}/`;
  const metaHtml = `
        <div class="story-meta">
          <span class="story-category">${escapeHtml(post.category || '')}</span>
          <span class="story-divider">|</span>
          <span class="story-date">${escapeHtml(formatDate(post.createdAt))}</span>
          <span class="story-divider">|</span>
          <span class="story-read-time">${escapeHtml(estimateReadTime(post))}</span>
        </div>`;

  if (variant === 'featured') {
    return `
      <article class="story-card featured">
        <a href="${href}" class="story-card-link">
          <div class="story-image${ratioClass ? ` ${ratioClass}` : ''}">
            <div class="story-image-placeholder" style="${thumbStyle}"></div>
          </div>
          <div class="story-overlay">
            ${metaHtml}
            <h3 class="story-title">${escapeHtml(post.title || '')}</h3>
            <p class="story-excerpt">${escapeHtml(post.excerpt || '')}</p>
          </div>
          <div class="story-content">
            ${metaHtml}
            <h3 class="story-title">${escapeHtml(post.title || '')}</h3>
            <p class="story-excerpt">${escapeHtml(post.excerpt || '')}</p>
          </div>
        </a>
      </article>`;
  }

  return `
      <article class="story-card${variant === 'landscape' ? ' landscape' : ''}">
        <a href="${href}" class="story-card-link">
          <div class="story-image${ratioClass ? ` ${ratioClass}` : ''}">
            <div class="story-image-placeholder" style="${thumbStyle}"></div>
          </div>
          <div class="story-content">
            ${metaHtml}
            <h3 class="story-title">${escapeHtml(post.title || '')}</h3>
            <p class="story-excerpt">${escapeHtml(post.excerpt || '')}</p>
          </div>
        </a>
      </article>`;
}

function renderBlock(block, depth) {
  switch (block.type) {
    case 'paragraph':
      return `<p>${block.data.text || ''}</p>`;
    case 'header':
      return `<h${block.data.level}>${block.data.text || ''}</h${block.data.level}>`;
    case 'image': {
      const classes = [];
      if (block.data.stretched) classes.push('article-img--stretched');
      if (block.data.withBorder) classes.push('article-img--bordered');
      const align = block.tunes?.alignmentTune?.alignment;
      if (align === 'left') classes.push('article-img--left');
      if (align === 'right') classes.push('article-img--right');
      const image = renderResponsiveImage(block.data.file, depth, {
        alt: block.data.caption || '',
        preferred: ['body', 'hero', 'thumb'],
        sizes: block.data.stretched ? '100vw' : '(min-width: 980px) 820px, 92vw',
        loading: 'lazy',
        decoding: 'async'
      });
      const caption = block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : '';
      return `<figure class="article-img ${classes.join(' ')}">${image}${caption}</figure>`;
    }
    case 'list': {
      const tag = block.data.style === 'ordered' ? 'ol' : 'ul';
      const items = (block.data.items || [])
        .map((item) => {
          const text = typeof item === 'string' ? item : item.content || item.text || '';
          return `<li>${text}</li>`;
        })
        .join('');
      return `<${tag}>${items}</${tag}>`;
    }
    case 'checklist': {
      const items = (block.data.items || [])
        .map((item) => `<li class="${item.checked ? 'checked' : ''}">${item.text || ''}</li>`)
        .join('');
      return `<ul class="article-check">${items}</ul>`;
    }
    case 'quote': {
      const cite = block.data.caption ? `<cite>${block.data.caption}</cite>` : '';
      return `<blockquote class="article-quote"><p>${block.data.text || ''}</p>${cite}</blockquote>`;
    }
    case 'delimiter':
      return '<div class="article-delimiter">...</div>';
    case 'code':
      return `<pre class="article-code"><code>${escapeHtml(block.data.code || '')}</code></pre>`;
    case 'table': {
      const rows = (block.data.content || [])
        .map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`)
        .join('');
      return `<div class="article-table"><table>${rows}</table></div>`;
    }
    case 'warning':
      return `<div class="article-warning"><strong>${block.data.title || ''}</strong><p>${block.data.message || ''}</p></div>`;
    case 'alert':
      return `<div class="article-alert article-alert--${escapeHtml(block.data.type || 'info')}">${block.data.message || ''}</div>`;
    case 'embed':
      return `<div class="article-embed"><iframe src="${escapeHtml(block.data.embed || '')}" height="${escapeHtml(block.data.height || 320)}" allowfullscreen></iframe></div>`;
    case 'gallery': {
      const layout = block.data.layout || '2-equal';
      const width = block.data.width || 'wide';
      const arMap = { '16:9': 'gallery-ratio--16-9', '1:1': 'gallery-ratio--1-1', '4:3': 'gallery-ratio--4-3' };
      const arClass = arMap[block.data.aspectRatio] || '';
      const imageSizes = width === 'full'
        ? '100vw'
        : width === 'wide'
          ? '(min-width: 1200px) 1100px, 96vw'
          : '(min-width: 980px) 820px, 92vw';
      const images = [block.data.image1, block.data.image2, block.data.image3]
        .filter(Boolean)
        .map((image) => renderResponsiveImage(image, depth, {
          preferred: ['body', 'hero', 'thumb'],
          sizes: imageSizes,
          loading: 'lazy',
          decoding: 'async'
        }))
        .join('');
      const caption = block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : '';
      return `<figure class="article-gallery article-gallery--${layout} block-width--${width}${arClass ? ` ${arClass}` : ''}">${images}${caption}</figure>`;
    }
    case 'columns': {
      const reverseClass = block.data.layout === 'image-right' ? ' reverse' : '';
      const ratio = (block.data.ratio || '1:1').replace(':', '-');
      const width = block.data.width || 'wide';
      const image = block.data.image
        ? renderResponsiveImage(block.data.image, depth, {
            preferred: ['body', 'hero', 'thumb'],
            sizes: width === 'full' ? '100vw' : '(min-width: 1200px) 1100px, 96vw',
            loading: 'lazy',
            decoding: 'async'
          })
        : '';
      const heading = block.data.heading ? `<h3>${block.data.heading}</h3>` : '';
      return `<div class="article-columns article-columns--${ratio} block-width--${width}${reverseClass}"><div class="article-columns__image">${image}</div><div class="article-columns__text">${heading}<div class="col-body">${block.data.text || ''}</div></div></div>`;
    }
    case 'chapterHeading': {
      const label = block.data.label ? `<span class="article-chapter__label">${block.data.label}</span>` : '';
      return `<div class="article-chapter">${label}<div class="article-chapter__title">${block.data.title || ''}</div></div>`;
    }
    case 'pullQuote': {
      const attribution = block.data.attribution ? `<div class="attribution">${block.data.attribution}</div>` : '';
      return `<div class="article-pullquote"><blockquote>${block.data.text || ''}</blockquote>${attribution}</div>`;
    }
    case 'spacer':
      return `<div class="article-spacer--${escapeHtml(block.data.size || 'md')}"></div>`;
    default:
      return '';
  }
}

function renderBlocks(content, depth) {
  if (!content?.blocks) return '';
  return content.blocks.map((block) => renderBlock(block, depth)).join('\n');
}

function collectAssetUrls(set, value) {
  const asset = normalizeImageAsset(value);
  if (!asset) return;

  if (asset.url?.startsWith('/uploads/')) set.add(asset.url);
  Object.values(asset.variants || {}).forEach((variant) => {
    if (variant?.url?.startsWith('/uploads/')) set.add(variant.url);
  });
}

function extractAssets(posts, settings) {
  const urls = new Set();

  posts.forEach((post) => {
    collectAssetUrls(urls, post.thumbnail);

    if (!post.content) return;
    try {
      const content = JSON.parse(post.content);
      (content.blocks || []).forEach((block) => {
        if (block.type === 'image') collectAssetUrls(urls, block.data?.file);
        if (block.type === 'gallery') {
          collectAssetUrls(urls, block.data?.image1);
          collectAssetUrls(urls, block.data?.image2);
          collectAssetUrls(urls, block.data?.image3);
        }
        if (block.type === 'columns') collectAssetUrls(urls, block.data?.image);
      });
    } catch (error) {
    }
  });

  collectAssetUrls(urls, settings?.hero?.bgImage);
  return urls;
}

function renderIndexPage(posts, settings) {
  const heroBackground = rootRelativePath(0, pickImageUrl(settings?.hero?.bgImage, ['hero', 'body', 'thumb']));
  const heroStyle = heroBackground
    ? ` style="background-image:linear-gradient(rgba(0,0,0,0.24), rgba(0,0,0,0.24)), url('${heroBackground}');background-size:cover;background-position:center;"`
    : '';
  const cards = posts.map((post, index) => renderIndexCard(post, index)).join('\n');

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(settings?.site?.name || 'Freshoh Works')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="./styles.css">
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="./" class="logo">${escapeHtml(settings?.site?.name || 'Freshoh')}</a>
      <nav class="header-nav">
        <a href="./#stories" class="nav-link active">Projects</a>
      </nav>
    </div>
  </header>

  <section class="hero"${heroStyle}>
    <div class="hero-overlay"></div>
    <div class="hero-content">
      <p class="hero-label">${escapeHtml(settings?.hero?.label || 'FRESHOH WORKS')}</p>
      <h1 class="hero-title">${escapeHtml(settings?.hero?.title || 'Freshoh Works')}</h1>
      <p class="hero-subtitle">${escapeHtml(settings?.hero?.subtitle || '')}</p>
      <a href="${escapeHtml(settings?.hero?.ctaLink || '#stories')}" class="hero-cta">${escapeHtml(settings?.hero?.cta || 'View stories')}</a>
    </div>
  </section>

  <section class="stories-section" id="stories">
    <div class="stories-container">
      <h2 class="section-title">${escapeHtml(settings?.site?.sectionTitle || 'Projects')}</h2>
      <p class="section-subtitle">${escapeHtml(settings?.site?.sectionSubtitle || '')}</p>
      <div class="stories-grid" id="stories-grid">
${cards}
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-bottom">
        <p>&copy; 2026 ${escapeHtml(settings?.site?.name || 'Freshoh')}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function renderArticlePage(post, settings) {
  let renderedContent = '';
  try {
    renderedContent = renderBlocks(JSON.parse(post.content || '{}'), 2);
  } catch (error) {
    renderedContent = post.content || '';
  }

  const heroImage = renderResponsiveImage(post.thumbnail, 2, {
    preferred: ['hero', 'body', 'thumb'],
    alt: post.title || '',
    sizes: '100vw',
    loading: 'eager',
    decoding: 'async',
    fetchpriority: 'high'
  });

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.title || 'Article')} - ${escapeHtml(settings?.site?.name || 'Freshoh')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="../../styles.css">
</head>
<body>
  <header class="header">
    <div class="header-inner">
      <a href="../../" class="logo">${escapeHtml(settings?.site?.name || 'Freshoh')}</a>
      <nav class="header-nav">
        <a href="../../" class="nav-link">Stories</a>
      </nav>
    </div>
  </header>

  <section class="article-hero">
    <div class="article-hero-bg" id="hero-bg">${heroImage}</div>
    <div class="article-hero-overlay"></div>
    <div class="article-hero-content">
      <div class="article-hero-meta">
        <span class="article-hero-category">${escapeHtml(post.category || '')}</span>
        <span class="story-divider" style="color:rgba(255,255,255,0.5);">|</span>
        <span class="article-hero-date">${escapeHtml(formatDate(post.createdAt))}</span>
      </div>
      <h1 class="article-hero-title">${escapeHtml(post.title || '')}</h1>
    </div>
  </section>

  <article class="article-body">
    <a href="../../" class="article-back">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      All stories
    </a>
    <div class="article-rendered" id="article-content">${renderedContent}</div>
  </article>

  <footer class="footer">
    <div class="footer-inner">
      <div class="footer-bottom">
        <p>&copy; 2026 ${escapeHtml(settings?.site?.name || 'Freshoh')}. All rights reserved.</p>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function copyUsedAssets(assetUrls) {
  assetUrls.forEach((assetUrl) => {
    const relativeAssetPath = assetUrl.replace(/^\/+/, '');
    const sourcePath = path.join(rootDir, relativeAssetPath);
    const destinationPath = path.join(outputDir, relativeAssetPath);

    if (!fs.existsSync(sourcePath)) return;
    ensureDir(path.dirname(destinationPath));
    fs.copyFileSync(sourcePath, destinationPath);
  });
}

function main() {
  const posts = readJson(postsFile, [])
    .filter((post) => post.published)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const settings = readJson(settingsFile, {});

  fs.rmSync(outputDir, { recursive: true, force: true });
  ensureDir(outputDir);

  writeFile(path.join(outputDir, '.nojekyll'), '');
  fs.copyFileSync(path.join(rootDir, 'styles.css'), path.join(outputDir, 'styles.css'));

  const usedAssets = extractAssets(posts, settings);
  copyUsedAssets(usedAssets);

  writeFile(path.join(outputDir, 'index.html'), renderIndexPage(posts, settings));

  posts.forEach((post) => {
    writeFile(
      path.join(outputDir, 'article', post.id, 'index.html'),
      renderArticlePage(post, settings)
    );
  });

  console.log(`Static export complete: ${posts.length} posts, ${usedAssets.size} assets`);
}

main();
