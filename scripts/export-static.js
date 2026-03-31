const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outputDir = path.join(rootDir, 'site');
const postsFile = path.join(rootDir, 'posts', 'posts.json');
const settingsFile = path.join(rootDir, 'posts', 'settings.json');
const v2StylesFile = path.join(rootDir, 'v2', 'styles.css');

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

function serializeJsonForScript(value) {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
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

  return ['thumb', 'body', 'hero']
    .map((key) => asset.variants?.[key])
    .filter(Boolean)
    .filter((variant, index, variants) => variants.findIndex((item) => item.url === variant.url) === index)
    .map((variant) => {
      const url = rootRelativePath(depth, variant.url);
      return variant.width ? `${url} ${variant.width}w` : url;
    })
    .join(', ');
}

function renderResponsiveImage(value, depth, options = {}) {
  const src = rootRelativePath(depth, pickImageUrl(value, options.preferred || ['body', 'hero', 'thumb']));
  if (!src) return '';

  const attrs = [
    `src="${src}"`,
    `alt="${escapeHtml(options.alt || '')}"`
  ];
  const srcSet = buildSrcSet(value, depth);

  if (srcSet) attrs.push(`srcset="${srcSet}"`);
  if (options.sizes) attrs.push(`sizes="${options.sizes}"`);
  if (options.loading) attrs.push(`loading="${options.loading}"`);
  if (options.decoding) attrs.push(`decoding="${options.decoding}"`);
  if (options.fetchpriority) attrs.push(`fetchpriority="${options.fetchpriority}"`);

  return `<img ${attrs.join(' ')}>`;
}

function mapScope(category) {
  if (category === 'R&D') return 'Menu R&D';
  if (category === '브랜드') return 'Brand Design';
  if (category === '고객경험') return 'Customer Experience';
  return 'Operations System';
}

function renderBlock(block, depth) {
  switch (block.type) {
    case 'paragraph':
      return `<p>${block.data.text || ''}</p>`;
    case 'header':
      return `<h${block.data.level}>${block.data.text || ''}</h${block.data.level}>`;
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
    case 'delimiter':
      return '<div class="article-delimiter">* * *</div>';
    case 'quote':
      return `<blockquote class="article-quote"><p>${block.data.text || ''}</p>${block.data.caption ? `<cite>${block.data.caption}</cite>` : ''}</blockquote>`;
    case 'table': {
      const rows = block.data.content || [];
      if (!rows.length) return '';
      let html = '<div class="article-table"><table>';
      rows.forEach((row, index) => {
        const tag = block.data.withHeadings && index === 0 ? 'th' : 'td';
        html += `<tr>${row.map((cell) => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
      });
      return `${html}</table></div>`;
    }
    case 'image': {
      const image = renderResponsiveImage(block.data.file, depth, {
        alt: block.data.caption || '',
        preferred: ['body', 'hero', 'thumb'],
        sizes: '(min-width: 980px) 820px, 92vw',
        loading: 'lazy',
        decoding: 'async'
      });
      const caption = block.data.caption ? `<figcaption>${block.data.caption}</figcaption>` : '';
      return `<figure class="article-img">${image}${caption}</figure>`;
    }
    case 'gallery': {
      const layout = block.data.layout || '2-equal';
      const width = block.data.width || 'wide';
      const arMap = { '16:9': 'gallery-ratio--16-9', '1:1': 'gallery-ratio--1-1', '4:3': 'gallery-ratio--4-3' };
      const arClass = arMap[block.data.aspectRatio] || '';
      const images = [block.data.image1, block.data.image2, block.data.image3]
        .filter(Boolean)
        .map((image) => renderResponsiveImage(image, depth, {
          preferred: ['body', 'hero', 'thumb'],
          sizes: width === 'full' ? '100vw' : '(min-width: 1200px) 1100px, 96vw',
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
      const attribution = block.data.attribution ? `<div class="attribution">${escapeHtml(block.data.attribution)}</div>` : '';
      return `<div class="article-pullquote"><blockquote>${block.data.text || ''}</blockquote>${attribution}</div>`;
    }
    case 'spacer':
      return `<div class="article-spacer--${escapeHtml(block.data.size || 'md')}"></div>`;
    default:
      return '';
  }
}

function renderBlocks(post, depth) {
  try {
    const content = JSON.parse(post.content || '{}');
    return (content.blocks || []).map((block) => renderBlock(block, depth)).join('\n');
  } catch (error) {
    return `<p>${escapeHtml(post.content || '')}</p>`;
  }
}

function serializeAssetForClient(value, depth) {
  const asset = normalizeImageAsset(value);
  if (!asset) return null;

  return {
    ...asset,
    url: rootRelativePath(depth, asset.url),
    variants: Object.fromEntries(
      Object.entries(asset.variants || {}).map(([key, variant]) => [
        key,
        { ...variant, url: rootRelativePath(depth, variant.url) }
      ])
    )
  };
}

function serializePostsForIndex(posts) {
  return posts.map((post) => ({
    id: post.id,
    title: post.title || '',
    category: post.category || '',
    excerpt: post.excerpt || '',
    thumbnail: serializeAssetForClient(post.thumbnail, 0),
    thumbnailColor: post.thumbnailColor || '#c8b8a8'
  }));
}

function renderIndexPage(posts, settings) {
  const serializedPosts = serializeJsonForScript(serializePostsForIndex(posts));
  const settingsJson = serializeJsonForScript({
    siteName: settings?.site?.name || 'Freshoh',
    heroLabel: settings?.hero?.label || 'FRESHOH WORKS'
  });

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
  <header class="site-header" id="site-header">
    <div class="header-inner">
      <a href="./" class="site-logo">${escapeHtml(settings?.site?.name || 'Freshoh')}</a>
      <nav class="site-nav">
        <a href="./" class="active">Work</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </nav>
    </div>
  </header>

  <main class="portfolio">
    <div class="filter-bar" id="filter-bar"></div>
    <div class="portfolio-rows" id="portfolio-rows"></div>
  </main>

  <footer class="site-footer">
    <span class="footer-brand">${escapeHtml(settings?.site?.name || 'Freshoh')}</span>
    <span class="footer-note">&copy; 2026 ${escapeHtml(settings?.site?.name || 'Freshoh')}. All rights reserved.</span>
  </footer>

  <script id="settings-data" type="application/json">${settingsJson}</script>
  <script id="posts-data" type="application/json">${serializedPosts}</script>
  <script>
    const settings = JSON.parse(document.getElementById('settings-data').textContent);
    const posts = JSON.parse(document.getElementById('posts-data').textContent);

    function escapeHTML(str) {
      const d = document.createElement('div');
      d.textContent = str == null ? '' : String(str);
      return d.innerHTML;
    }

    function normalizeImageAsset(value) {
      if (!value) return null;
      if (typeof value === 'string') return { url: value, variants: {} };
      if (typeof value === 'object' && typeof value.url === 'string') {
        return { ...value, variants: value.variants || {} };
      }
      return null;
    }

    function getImageUrl(value, preferred) {
      const asset = normalizeImageAsset(value);
      const prefs = Array.isArray(preferred) ? preferred : [preferred || 'thumb'];
      if (!asset) return '';
      for (const key of prefs) {
        const variantUrl = asset.variants?.[key]?.url;
        if (variantUrl) return variantUrl;
      }
      return asset.url || '';
    }

    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const cur = window.scrollY;
      document.getElementById('site-header').classList.toggle('site-header--hidden', cur > lastScroll && cur > 200);
      lastScroll = cur;
    }, { passive: true });

    function createCard(post, isHero) {
      const card = document.createElement('article');
      card.className = 'project-card';
      card.dataset.category = post.category || '';

      const thumbUrl = getImageUrl(post.thumbnail, isHero ? ['hero', 'body', 'thumb'] : ['body', 'thumb']);
      const thumbColor = escapeHTML(post.thumbnailColor || '#c8b8a8');
      const safeTitle = escapeHTML(post.title || '');
      const safeCategory = escapeHTML(post.category || '');
      const safeExcerpt = escapeHTML(post.excerpt || '');
      const safeId = encodeURIComponent(post.id);

      const imageContent = thumbUrl
        ? '<img src="' + thumbUrl + '" alt="' + safeTitle + '" loading="' + (isHero ? 'eager' : 'lazy') + '">'
        : '<div class="project-card-image-bg" style="background-color:' + thumbColor + ';"></div>';

      card.innerHTML = \`
        <a href="./project/\${safeId}/">
          <div class="project-card-image">\${imageContent}</div>
          <div class="project-card-info">
            <div class="project-card-sector">\${safeCategory}</div>
            <h2 class="project-card-title">\${safeTitle}</h2>
            \${safeExcerpt ? '<p class="project-card-excerpt">' + safeExcerpt + '</p>' : ''}
          </div>
        </a>\`;

      return card;
    }

    const ROW_PATTERN = [1, 2, 3, 1, 2, 1, 3];

    function createRow(type, rowPosts) {
      const row = document.createElement('div');
      if (type === 1) {
        row.className = 'row-hero';
        row.appendChild(createCard(rowPosts[0], true));
      } else if (type === 2) {
        row.className = 'row-pair';
        rowPosts.forEach((post) => row.appendChild(createCard(post, false)));
      } else {
        row.className = 'row-carousel';
        const cards = rowPosts.map((post) => createCard(post, false));
        const clones = rowPosts.map((post) => createCard(post, false));
        cards.forEach((card) => row.appendChild(card));
        clones.forEach((card) => row.appendChild(card));

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let userInteracting = false;
        let resumeTimer = null;

        row.addEventListener('mousedown', (event) => {
          isDown = true;
          userInteracting = true;
          startX = event.pageX - row.offsetLeft;
          scrollLeft = row.scrollLeft;
          clearTimeout(resumeTimer);
        });
        row.addEventListener('mouseleave', () => { isDown = false; resumeAfterDelay(); });
        row.addEventListener('mouseup', () => { isDown = false; resumeAfterDelay(); });
        row.addEventListener('mousemove', (event) => {
          if (!isDown) return;
          event.preventDefault();
          row.scrollLeft = scrollLeft - (event.pageX - row.offsetLeft - startX) * 1.5;
        });
        row.addEventListener('touchstart', () => { userInteracting = true; clearTimeout(resumeTimer); }, { passive: true });
        row.addEventListener('touchend', () => { resumeAfterDelay(); });

        function resumeAfterDelay() {
          resumeTimer = setTimeout(() => { userInteracting = false; }, 3000);
        }

        function autoScroll() {
          if (!userInteracting && row.isConnected) {
            row.scrollLeft += 0.5;
            const halfScroll = row.scrollWidth / 2;
            if (halfScroll > 0 && row.scrollLeft >= halfScroll) {
              row.scrollLeft -= halfScroll;
            }
          }
          requestAnimationFrame(autoScroll);
        }

        setTimeout(() => requestAnimationFrame(autoScroll), 100);
      }
      return row;
    }

    function buildFilters(allPosts) {
      const categories = [...new Set(allPosts.map((post) => post.category).filter(Boolean))];
      const bar = document.getElementById('filter-bar');

      const allBtn = document.createElement('button');
      allBtn.className = 'filter-btn active';
      allBtn.textContent = 'All';
      allBtn.dataset.category = '';
      bar.appendChild(allBtn);

      categories.forEach((category) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.textContent = category;
        btn.dataset.category = category;
        bar.appendChild(btn);
      });

      bar.addEventListener('click', (event) => {
        const btn = event.target.closest('.filter-btn');
        if (!btn) return;
        bar.querySelectorAll('.filter-btn').forEach((button) => button.classList.remove('active'));
        btn.classList.add('active');
        renderRows(allPosts, btn.dataset.category);
      });
    }

    function renderRows(allPosts, filterCategory) {
      const container = document.getElementById('portfolio-rows');
      const filtered = filterCategory
        ? allPosts.filter((post) => post.category === filterCategory)
        : allPosts;

      container.innerHTML = '';
      if (!filtered.length) {
        container.innerHTML = '<p style="padding:80px 40px;text-align:center;color:#999;">No projects found.</p>';
        return;
      }

      let cursor = 0;
      let patternIndex = 0;

      while (cursor < filtered.length) {
        const count = ROW_PATTERN[patternIndex % ROW_PATTERN.length];
        const slice = filtered.slice(cursor, cursor + count);
        if (!slice.length) break;
        const rowType = slice.length < count ? Math.min(slice.length, count) : count;
        container.appendChild(createRow(rowType, slice));
        cursor += slice.length;
        patternIndex += 1;
      }
    }

    buildFilters(posts);
    renderRows(posts, '');
  </script>
</body>
</html>`;
}

function renderProjectPage(post, allPosts, settings) {
  const thumbUrl = pickImageUrl(post.thumbnail, ['hero', 'body', 'thumb']);
  const heroContent = thumbUrl
    ? renderResponsiveImage(post.thumbnail, 2, {
        preferred: ['hero', 'body', 'thumb'],
        alt: post.title || '',
        sizes: '100vw',
        loading: 'eager',
        decoding: 'async',
        fetchpriority: 'high'
      })
    : `<div class="project-hero-bg" style="background-color:${escapeHtml(post.thumbnailColor || '#c8b8a8')};"></div>`;
  const renderedContent = renderBlocks(post, 2);
  const currentIndex = allPosts.findIndex((item) => item.id === post.id);
  const nextPost = allPosts.length > 1 ? allPosts[(currentIndex + 1) % allPosts.length] : null;
  const nextThumb = nextPost ? pickImageUrl(nextPost.thumbnail, ['body', 'thumb']) : '';
  const nextImage = nextPost
    ? nextThumb
      ? renderResponsiveImage(nextPost.thumbnail, 2, {
          preferred: ['body', 'thumb', 'hero'],
          alt: nextPost.title || '',
          sizes: '(min-width: 1200px) 50vw, 100vw',
          loading: 'lazy',
          decoding: 'async'
        })
      : `<div class="next-project-image-bg" style="background-color:${escapeHtml(nextPost.thumbnailColor || '#c8b8a8')};height:100%;"></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.title || 'Project')} - ${escapeHtml(settings?.site?.name || 'Freshoh Works')}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
  <link rel="stylesheet" href="../../styles.css">
  <style>
    html, body { overflow-x: hidden; }
    .project-body .article-rendered::after { content:''; display:table; clear:both; }
  </style>
</head>
<body>
  <header class="site-header" id="site-header">
    <div class="header-inner">
      <a href="../../" class="site-logo">${escapeHtml(settings?.site?.name || 'Freshoh')}</a>
      <nav class="site-nav">
        <a href="../../">Work</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </nav>
    </div>
  </header>

  <div class="project-hero" id="project-hero">${heroContent}</div>

  <div class="project-header" id="project-header">
    <div class="project-header-main">
      <h1 class="project-title" id="project-title">${escapeHtml(post.title || '')}</h1>
      <p class="project-intro" id="project-intro">${escapeHtml(post.excerpt || '')}</p>
    </div>
    <aside class="project-meta" id="project-meta">
      <div class="project-meta-item">
        <div class="project-meta-label">Sector</div>
        <div class="project-meta-value">${escapeHtml(post.category || '')}</div>
      </div>
      <div class="project-meta-item">
        <div class="project-meta-label">Client</div>
        <div class="project-meta-value">Freshoh</div>
      </div>
      <div class="project-meta-item">
        <div class="project-meta-label">Scope</div>
        <div class="project-meta-value">${escapeHtml(mapScope(post.category || ''))}</div>
      </div>
      <div class="project-meta-item">
        <div class="project-meta-label">Partner</div>
        <div class="project-meta-value">${escapeHtml(settings?.site?.name || 'Freshoh')}</div>
      </div>
    </aside>
  </div>

  <div class="project-body">
    <div class="article-rendered" id="project-content">${renderedContent}</div>
  </div>

  ${nextPost ? `<div class="next-project" id="next-project">
    <a href="../../project/${encodeURIComponent(nextPost.id)}/">
      <div class="next-project-text">
        <div class="next-project-label">Next Project</div>
        <h3 class="next-project-title">${escapeHtml(nextPost.title || '')}</h3>
        <p class="next-project-sector">${escapeHtml(nextPost.category || '')}</p>
      </div>
      <div class="next-project-image">${nextImage}</div>
    </a>
  </div>` : ''}

  <footer class="site-footer">
    <span class="footer-brand">${escapeHtml(settings?.site?.name || 'Freshoh')}</span>
    <span class="footer-note">&copy; 2026 ${escapeHtml(settings?.site?.name || 'Freshoh')}. All rights reserved.</span>
  </footer>

  <script>
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const cur = window.scrollY;
      document.getElementById('site-header').classList.toggle('site-header--hidden', cur > lastScroll && cur > 200);
      lastScroll = cur;
    }, { passive: true });
  </script>
</body>
</html>`;
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

    try {
      const content = JSON.parse(post.content || '{}');
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
  fs.copyFileSync(v2StylesFile, path.join(outputDir, 'styles.css'));

  const usedAssets = extractAssets(posts, settings);
  copyUsedAssets(usedAssets);

  writeFile(path.join(outputDir, 'index.html'), renderIndexPage(posts, settings));

  posts.forEach((post) => {
    writeFile(
      path.join(outputDir, 'project', post.id, 'index.html'),
      renderProjectPage(post, posts, settings)
    );
  });

  console.log(`Static export complete: ${posts.length} posts, ${usedAssets.size} assets`);
}

main();
