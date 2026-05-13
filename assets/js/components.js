(function () {
  const data = window.DLGuideData;

  function basePath() {
    return document.body.dataset.base || '.';
  }

  function chapterHref(chapter) {
    return `${basePath()}/chapters/${chapter.slug}.html`;
  }

  function chapterById(id) {
    return data.chapters.find((chapter) => chapter.id === Number(id));
  }

  function chapterBySlug(slug) {
    return data.chapters.find((chapter) => chapter.slug === slug);
  }

  function escapeHTML(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function icon(name, label) {
    const aria = label ? ` aria-label="${escapeHTML(label)}"` : '';
    return `<i data-lucide="${name}"${aria}></i>`;
  }

  function badge(text, tone) {
    return `<span class="badge ${tone || ''}">${escapeHTML(text)}</span>`;
  }

  function tags(items, tone) {
    return `<div class="tag-row">${(items || []).map((item) => badge(item, tone)).join('')}</div>`;
  }

  function getProgress(slug) {
    try {
      const saved = JSON.parse(localStorage.getItem(`dl-check-${slug}`) || '{}');
      const values = Object.values(saved);
      if (!values.length) return 0;
      return Math.round((values.filter(Boolean).length / values.length) * 100);
    } catch {
      return 0;
    }
  }

  function memoryHref() {
    return `${basePath()}/memory.html`;
  }

  function emptyMemory() {
    return { version: 1, notes: {}, reviews: {}, favorites: {} };
  }

  function readMemory() {
    try {
      const saved = JSON.parse(localStorage.getItem('dl-memory-v1') || '{}');
      return Object.assign(emptyMemory(), saved, {
        notes: saved.notes || {},
        reviews: saved.reviews || {},
        favorites: saved.favorites || {}
      });
    } catch {
      return emptyMemory();
    }
  }

  function writeMemory(memory) {
    localStorage.setItem('dl-memory-v1', JSON.stringify(Object.assign(emptyMemory(), memory)));
  }

  function formatDate(value) {
    if (!value) return '未安排';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '未安排';
    return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function reviewStatus(review) {
    if (!review) return '尚未加入复习队列';
    const due = new Date(review.nextReviewAt).getTime() <= Date.now() ? '今天应复习' : `下次复习：${formatDate(review.nextReviewAt)}`;
    return `${due} / 熟悉度：${review.confidence || '未标记'}`;
  }

  function sidebar(activeSlug) {
    const partGroups = data.parts.map((part) => {
      const links = part.chapters.map((id) => {
        const chapter = chapterById(id);
        const active = chapter.slug === activeSlug ? 'active' : '';
        const progress = getProgress(chapter.slug);
        return `
          <a class="side-link ${active}" href="${chapterHref(chapter)}">
            <span class="side-index">${String(chapter.id).padStart(2, '0')}</span>
            <span class="side-title">${escapeHTML(chapter.title)}</span>
            <span class="side-progress" title="阅读检查清单进度">${progress ? `${progress}%` : ''}</span>
          </a>
        `;
      }).join('');
      return `
        <div class="side-group">
          <div class="side-group-title">${escapeHTML(part.title)}</div>
          ${links}
        </div>
      `;
    }).join('');

    return `
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <a href="${basePath()}/index.html" class="brand-mark">DL</a>
          <div>
            <div class="brand-title">Deep Learning</div>
            <div class="brand-subtitle">原书知识导览</div>
          </div>
        </div>
        <div class="side-tools">
          <a class="side-tool ${activeSlug === 'memory' ? 'active' : ''}" href="${memoryHref()}">${icon('brain')}学习记忆</a>
        </div>
        <nav class="side-nav" aria-label="章节导航">
          ${partGroups}
        </nav>
      </aside>
    `;
  }

  function topbar() {
    return `
      <header class="topbar">
        <button class="icon-button mobile-menu-button" id="mobile-menu" title="打开章节导航" aria-label="打开章节导航">${icon('panel-left')}</button>
        <div class="global-search">
          ${icon('search')}
          <input id="global-search" type="search" placeholder="搜索章节、公式、术语..." autocomplete="off">
          <div id="search-results" class="search-results" hidden></div>
        </div>
        <a class="memory-button" href="${memoryHref()}">${icon('brain')}<span>学习记忆</span></a>
        <button class="icon-button" id="theme-toggle" title="切换深色模式" aria-label="切换深色模式">${icon('moon')}</button>
      </header>
    `;
  }

  function layout(mainHTML, activeSlug) {
    return `
      <div class="scroll-meter"><span id="scroll-meter-fill"></span></div>
      ${sidebar(activeSlug)}
      <div class="page-shell">
        ${topbar()}
        <main class="main-content fade-in">
          ${mainHTML}
        </main>
      </div>
      <div id="modal-root"></div>
    `;
  }

  function heroContinueHref() {
    const saved = localStorage.getItem('dl-last-chapter');
    const chapter = saved ? chapterBySlug(saved) : chapterById(1);
    return chapterHref(chapter || chapterById(1));
  }

  function renderHome() {
    return layout(`
      <section class="hero-section">
        <div class="hero-copy">
          <p class="eyebrow">Ian Goodfellow 等《Deep Learning》导读站</p>
          <h1>从数学基础到深度生成模型，一站式理解 Deep Learning。</h1>
          <p class="hero-subtitle">不是普通笔记，而是严格沿原书章节推进的学习地图：读书对照、公式速查、概念关系、交互可视化和长期复习入口放在同一个界面里。</p>
          <div class="hero-actions">
            <a class="button primary" href="${chapterHref(chapterById(1))}">${icon('play')}开始学习</a>
            <a class="button ghost" href="${heroContinueHref()}">${icon('bookmark')}继续上次</a>
            <a class="button ghost" href="${memoryHref()}">${icon('brain')}学习记忆</a>
          </div>
        </div>
        <div class="study-panel">
          <div class="panel-title">学习驾驶舱</div>
          <div class="progress-stack">
            ${data.parts.map((part) => {
              const chapters = part.chapters.map(chapterById);
              const average = Math.round(chapters.reduce((sum, chapter) => sum + getProgress(chapter.slug), 0) / chapters.length);
              return `
                <div class="progress-item">
                  <div>
                    <strong>${escapeHTML(part.label)}</strong>
                    <span>${escapeHTML(part.description)}</span>
                  </div>
                  <div class="mini-meter"><span style="width:${average}%"></span></div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </section>

      <section class="section-block" id="book-map">
        <div class="section-heading">
          <p class="eyebrow">Original Book Map</p>
          <h2>原书学习地图</h2>
          <p>章节顺序来自你提供的 PDF 书签目录。现代内容只放在“现代延伸”里，不混入原书主线。</p>
        </div>
        <div class="part-stack">
          ${data.parts.map(renderPartBlock).join('')}
        </div>
      </section>

      <section class="section-block" id="formulas">
        <div class="section-heading split">
          <div>
            <p class="eyebrow">Formula Atlas</p>
            <h2>公式速查</h2>
            <p>按原书核心公式优先整理；Transformer 注意力等内容明确标记为现代延伸。</p>
          </div>
          <div class="inline-search">
            ${icon('search')}
            <input id="formula-filter" type="search" placeholder="搜索公式、场景、标签">
          </div>
        </div>
        <div class="category-tabs" id="formula-tabs">
          <button class="chip active" data-category="all">全部</button>
          ${Array.from(new Set(data.formulas.map((formula) => formula.category))).map((category) => `<button class="chip" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join('')}
        </div>
        <div class="formula-grid" id="formula-grid">
          ${data.formulas.map(renderFormulaCard).join('')}
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <p class="eyebrow">Learning Routes</p>
          <h2>学习路线推荐</h2>
        </div>
        <div class="route-grid">
          ${data.learningPaths.map(renderLearningPath).join('')}
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <p class="eyebrow">Knowledge Graph</p>
          <h2>知识关系图谱</h2>
          <p>用章节之间的依赖关系帮助你决定哪里需要回看。</p>
        </div>
        ${renderGraph()}
      </section>
    `, '');
  }

  function renderPartBlock(part) {
    return `
      <article class="part-block">
        <div class="part-header">
          <div>
            <span class="part-label">${escapeHTML(part.label)}</span>
            <h3>${escapeHTML(part.title)}</h3>
            <p>${escapeHTML(part.description)}</p>
          </div>
        </div>
        <div class="chapter-grid">
          ${part.chapters.map((id) => renderChapterCard(chapterById(id))).join('')}
        </div>
      </article>
    `;
  }

  function renderChapterCard(chapter) {
    const progress = getProgress(chapter.slug);
    return `
      <a class="chapter-card" href="${chapterHref(chapter)}">
        <div class="chapter-card-top">
          <span class="chapter-number">Chapter ${chapter.id}</span>
          <span class="difficulty">${escapeHTML(chapter.difficulty)}</span>
        </div>
        <h4>${escapeHTML(chapter.title)}</h4>
        <p>${escapeHTML(chapter.summary)}</p>
        ${tags(chapter.keywords.slice(0, 4))}
        <div class="chapter-card-footer">
          <span>${icon('clock')} ${escapeHTML(chapter.time)}</span>
          <span>${progress ? `${progress}% 已掌握` : '未开始'}</span>
        </div>
      </a>
    `;
  }

  function renderFormulaCard(formula) {
    const chapterLinks = formula.chapterRefs.map((id) => {
      const chapter = chapterById(id);
      return `<a href="${chapterHref(chapter)}">Ch.${chapter.id}</a>`;
    }).join('');
    return `
      <article class="formula-card" data-formula-id="${escapeHTML(formula.id)}" data-category="${escapeHTML(formula.category)}" data-search="${escapeHTML(`${formula.title} ${formula.meaning} ${formula.use} ${formula.tags.join(' ')}`)}">
        <div class="formula-card-head">
          <span class="formula-category">${escapeHTML(formula.category)}</span>
          <span class="source-pill ${formula.source === '现代延伸' ? 'modern' : ''}">${escapeHTML(formula.source)}</span>
        </div>
        <h3>${escapeHTML(formula.title)}</h3>
        <div class="formula-latex">\\[${formula.latex}\\]</div>
        <p>${escapeHTML(formula.intuition)}</p>
        <div class="formula-extra">
          <dl>
            <dt>含义</dt><dd>${escapeHTML(formula.meaning)}</dd>
            <dt>使用场景</dt><dd>${escapeHTML(formula.use)}</dd>
            <dt>章节</dt><dd class="chapter-ref-row">${chapterLinks}</dd>
          </dl>
        </div>
      </article>
    `;
  }

  function renderLearningPath(route) {
    return `
      <article class="route-card">
        <div class="route-head">
          ${icon('route')}
          <div>
            <h3>${escapeHTML(route.title)}</h3>
            <p>${escapeHTML(route.audience)}</p>
          </div>
        </div>
        <div class="route-chips">
          ${route.chapters.map((id) => {
            const chapter = chapterById(id);
            return `<a class="mini-chip" href="${chapterHref(chapter)}">Ch.${id}</a>`;
          }).join('')}
        </div>
        <p>${escapeHTML(route.note)}</p>
      </article>
    `;
  }

  function renderGraph() {
    const nodes = data.chapters.map((chapter, index) => {
      const angle = (Math.PI * 2 * index) / data.chapters.length - Math.PI / 2;
      const radius = index < 5 ? 130 : index < 12 ? 195 : 260;
      const x = 340 + Math.cos(angle) * radius;
      const y = 320 + Math.sin(angle) * radius;
      return { chapter, x, y };
    });
    const nodeById = new Map(nodes.map((node) => [node.chapter.id, node]));
    const edges = data.graphEdges.map(([from, to, label]) => {
      const a = nodeById.get(from);
      const b = nodeById.get(to);
      return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"><title>${escapeHTML(label)}</title></line>`;
    }).join('');
    return `
      <div class="graph-wrap">
        <svg class="knowledge-graph" viewBox="0 0 680 640" role="img" aria-label="章节知识关系图谱">
          <g class="graph-edges">${edges}</g>
          <g class="graph-nodes">
            ${nodes.map(({ chapter, x, y }) => `
              <a href="${chapterHref(chapter)}">
                <circle cx="${x}" cy="${y}" r="24"></circle>
                <text x="${x}" y="${y + 4}" text-anchor="middle">C${chapter.id}</text>
                <title>Ch.${chapter.id} ${escapeHTML(chapter.title)}</title>
              </a>
            `).join('')}
          </g>
        </svg>
        <div class="graph-notes">
          ${data.graphEdges.slice(0, 8).map(([from, to, label]) => `
            <a href="${chapterHref(chapterById(to))}">
              <strong>Ch.${from} -> Ch.${to}</strong>
              <span>${escapeHTML(label)}</span>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderChapter(chapter) {
    localStorage.setItem('dl-last-chapter', chapter.slug);
    const memory = readMemory();
    const note = memory.notes[chapter.slug];
    const review = memory.reviews[chapter.slug];
    return layout(`
      <article class="chapter-page">
        <section class="chapter-hero">
          <div>
            <p class="eyebrow">Chapter ${chapter.id} / ${escapeHTML(chapter.english)}</p>
            <h1>${escapeHTML(chapter.title)}</h1>
            <p class="hero-subtitle">${escapeHTML(chapter.summary)}</p>
            ${tags(chapter.keywords)}
          </div>
          <aside class="chapter-meta-panel">
            <div><span>难度</span><strong>${escapeHTML(chapter.difficulty)}</strong></div>
            <div><span>预计学习</span><strong>${escapeHTML(chapter.time)}</strong></div>
            <div><span>原书页码</span><strong>p. ${chapter.page}</strong></div>
          </aside>
        </section>

        <section class="section-block compact">
          <div class="info-grid">
            ${infoBlock('本章位置', chapter.position, 'map')}
            ${infoList('学习目标', chapter.goals, 'target')}
            ${infoList('前置知识', chapter.prerequisites, 'layers')}
          </div>
        </section>

        <section class="section-block" id="source-map">
          <div class="section-heading">
            <p class="eyebrow">Reading Alignment</p>
            <h2>原书对照</h2>
            <p>${escapeHTML(chapter.reading.order)}</p>
          </div>
          ${renderSourceTable(chapter)}
        </section>

        <section class="section-block" id="concepts">
          <div class="section-heading">
            <p class="eyebrow">Core Concepts</p>
            <h2>核心知识点总结</h2>
            <p>解释服务于读书：每个概念都标出原书位置、问题、直觉、数学表达和后续连接。</p>
          </div>
          <div class="concept-stack">
            ${chapter.concepts.map(renderConcept).join('')}
          </div>
        </section>

        ${chapter.formulas.length ? `
          <section class="section-block" id="chapter-formulas">
            <div class="section-heading">
              <p class="eyebrow">Formula Focus</p>
              <h2>本章公式</h2>
            </div>
            <div class="formula-grid compact-grid">
              ${chapter.formulas.map((id) => renderFormulaCard(data.formulas.find((formula) => formula.id === id))).join('')}
            </div>
          </section>
        ` : ''}

        ${chapter.visualization ? `
          <section class="section-block" id="interactive">
            <div class="section-heading">
              <p class="eyebrow">Interactive Lab</p>
              <h2>交互式学习模块</h2>
              <p>用轻量原生 Canvas 和控件帮助建立直觉，不替代原书推导。</p>
            </div>
            <div class="viz-panel" data-viz="${escapeHTML(chapter.visualization)}" data-chapter="${chapter.id}"></div>
          </section>
        ` : ''}

        <section class="section-block">
          <div class="two-column">
            <div>
              <div class="section-heading small">
                <p class="eyebrow">Misconceptions</p>
                <h2>初学者最容易卡住的点</h2>
              </div>
              ${renderPlainList(chapter.misconceptions, 'warning-list')}
            </div>
            <div>
              <div class="section-heading small">
                <p class="eyebrow">Applications</p>
                <h2>实际应用</h2>
              </div>
              ${renderPlainList(chapter.applications, 'check-list')}
            </div>
          </div>
        </section>

        ${chapter.code ? `
          <section class="section-block">
            <div class="section-heading">
              <p class="eyebrow">Code Note</p>
              <h2>代码速记</h2>
            </div>
            <pre class="code-block"><code class="language-js">${escapeHTML(chapter.code)}</code></pre>
          </section>
        ` : ''}

        <section class="section-block">
          <div class="section-heading">
            <p class="eyebrow">Remember This</p>
            <h2>你真正需要记住的内容</h2>
          </div>
          <div class="takeaway-grid">
            ${chapter.takeaways.map((item, index) => `
              <article class="takeaway-card">
                <span>${String(index + 1).padStart(2, '0')}</span>
                <p>${escapeHTML(item)}</p>
              </article>
            `).join('')}
          </div>
        </section>

        <section class="section-block" id="memory">
          <div class="section-heading">
            <p class="eyebrow">Learning Memory</p>
            <h2>本章记忆</h2>
            <p>这里保存你的读书痕迹：本章笔记、复习安排和之后的学习回看入口。</p>
          </div>
          <div class="memory-workbench">
            <article class="memory-card">
              <div class="memory-card-head">
                <div>
                  <h3>本章学习笔记</h3>
                  <p>写下卡住的点、自己的解释、需要二刷的小节。</p>
                </div>
                ${icon('notebook-pen')}
              </div>
              <textarea class="memory-textarea" data-note-chapter="${escapeHTML(chapter.slug)}" placeholder="例如：2.7 特征分解要回看；PCA 的目标函数可以和自编码器对照理解。">${escapeHTML(note ? note.text : '')}</textarea>
              <div class="memory-actions">
                <button class="button primary small" data-save-note="${escapeHTML(chapter.slug)}">${icon('save')}保存笔记</button>
                <span class="memory-status" data-note-status>${note ? `上次保存：${formatDate(note.updatedAt)}` : '尚未保存'}</span>
              </div>
            </article>
            <article class="memory-card">
              <div class="memory-card-head">
                <div>
                  <h3>加入复习队列</h3>
                  <p>用熟悉度决定下次回看的时间。</p>
                </div>
                ${icon('calendar-clock')}
              </div>
              <label class="memory-label">
                熟悉度
                <select class="memory-select" data-review-confidence="${escapeHTML(chapter.slug)}">
                  <option value="again" ${review && review.confidence === 'again' ? 'selected' : ''}>还不懂，明天再看</option>
                  <option value="shaky" ${review && review.confidence === 'shaky' ? 'selected' : ''}>有点虚，3 天后复习</option>
                  <option value="ok" ${!review || review.confidence === 'ok' ? 'selected' : ''}>基本懂，7 天后复习</option>
                  <option value="solid" ${review && review.confidence === 'solid' ? 'selected' : ''}>很稳，21 天后复习</option>
                </select>
              </label>
              <div class="memory-actions">
                <button class="button primary small" data-save-review="${escapeHTML(chapter.slug)}">${icon('alarm-clock-check')}安排复习</button>
                <span class="memory-status" data-review-status>${escapeHTML(reviewStatus(review))}</span>
              </div>
            </article>
          </div>
        </section>

        <section class="section-block" id="checklist">
          <div class="section-heading split">
            <div>
              <p class="eyebrow">Reading Checklist</p>
              <h2>读书检查清单</h2>
              <p>勾选状态会记录在本地浏览器，回到首页可看到章节进度。</p>
            </div>
            <button class="button ghost" data-reset-checks="${escapeHTML(chapter.slug)}">${icon('rotate-ccw')}重置本章</button>
          </div>
          <div class="checklist" data-checklist="${escapeHTML(chapter.slug)}">
            ${chapter.checklist.map((item, index) => `
              <label class="check-item">
                <input type="checkbox" data-check-index="${index}">
                <span>${escapeHTML(item)}</span>
              </label>
            `).join('')}
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <p class="eyebrow">Connections</p>
            <h2>这一章和哪些章节相关</h2>
          </div>
          <div class="related-row">
            ${(chapter.related || []).map((id) => {
              const related = chapterById(id);
              return `<a class="related-card" href="${chapterHref(related)}"><span>Ch.${related.id}</span><strong>${escapeHTML(related.title)}</strong><p>${escapeHTML(related.summary)}</p></a>`;
            }).join('')}
          </div>
        </section>

        ${chapter.modern.length ? `
          <section class="section-block modern-note">
            <div class="section-heading">
              <p class="eyebrow">Modern Extensions</p>
              <h2>现代延伸</h2>
              <p>以下不是原书核心内容，只是帮助你把原书知识接到后续发展。</p>
            </div>
            ${renderPlainList(chapter.modern, 'modern-list')}
          </section>
        ` : ''}

        <nav class="chapter-pager">
          ${renderPager(chapter)}
        </nav>
      </article>
    `, chapter.slug);
  }

  function renderMemory() {
    const memory = readMemory();
    const notes = Object.entries(memory.notes || {})
      .filter(([, note]) => note && String(note.text || '').trim())
      .sort((a, b) => new Date(b[1].updatedAt || 0) - new Date(a[1].updatedAt || 0));
    const reviews = Object.entries(memory.reviews || {})
      .filter(([, review]) => review && review.nextReviewAt)
      .sort((a, b) => new Date(a[1].nextReviewAt) - new Date(b[1].nextReviewAt));
    const favorites = Object.keys(memory.favorites || {}).filter((id) => memory.favorites[id]);
    const completed = data.chapters.filter((chapter) => getProgress(chapter.slug) === 100);
    const average = Math.round(data.chapters.reduce((sum, chapter) => sum + getProgress(chapter.slug), 0) / data.chapters.length);

    return layout(`
      <section class="chapter-hero memory-hero">
        <div>
          <p class="eyebrow">Learning Memory</p>
          <h1>学习记忆库</h1>
          <p class="hero-subtitle">这里不是新的教材页面，而是你的长期学习状态：章节掌握度、个人笔记、公式收藏和复习计划都保存在本地浏览器。</p>
          <div class="hero-actions">
            <button class="button primary" data-export-memory>${icon('download')}导出记忆</button>
            <label class="button ghost file-button">${icon('upload')}导入记忆<input type="file" accept="application/json" data-import-memory></label>
          </div>
        </div>
        <aside class="chapter-meta-panel">
          <div><span>总进度</span><strong>${average}%</strong></div>
          <div><span>笔记</span><strong>${notes.length} 条</strong></div>
          <div><span>复习队列</span><strong>${reviews.length} 章</strong></div>
        </aside>
      </section>

      <section class="section-block compact">
        <div class="memory-stats">
          ${memoryStat('完成章节', `${completed.length}/20`, 'check-circle-2')}
          ${memoryStat('公式收藏', `${favorites.length}`, 'star')}
          ${memoryStat('已有笔记', `${notes.length}`, 'notebook-tabs')}
          ${memoryStat('待复习', `${reviews.filter(([, review]) => new Date(review.nextReviewAt).getTime() <= Date.now()).length}`, 'alarm-clock')}
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <p class="eyebrow">Review Queue</p>
          <h2>复习队列</h2>
          <p>按下次复习日期排序，到期的章节会排在前面。</p>
        </div>
        <div class="memory-list">
          ${reviews.length ? reviews.map(([slug, review]) => renderReviewItem(slug, review)).join('') : renderEmptyMemory('还没有安排复习。进入任意章节，在“本章记忆”里安排一次复习。')}
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <p class="eyebrow">Notes</p>
          <h2>章节笔记</h2>
        </div>
        <div class="memory-list">
          ${notes.length ? notes.map(([slug, note]) => renderNoteItem(slug, note)).join('') : renderEmptyMemory('还没有写章节笔记。先从第一章或第二章写下一个卡点。')}
        </div>
      </section>

      <section class="section-block">
        <div class="section-heading">
          <p class="eyebrow">Formula Favorites</p>
          <h2>收藏公式</h2>
        </div>
        <div class="formula-grid compact-grid">
          ${favorites.length ? favorites.map((id) => renderFormulaCard(data.formulas.find((formula) => formula.id === id))).join('') : renderEmptyMemory('还没有收藏公式。打开首页或章节公式卡片，点击公式后在弹窗中收藏。')}
        </div>
      </section>
    `, 'memory');
  }

  function memoryStat(label, value, iconName) {
    return `
      <article class="stat-card">
        ${icon(iconName)}
        <strong>${escapeHTML(value)}</strong>
        <span>${escapeHTML(label)}</span>
      </article>
    `;
  }

  function renderEmptyMemory(text) {
    return `<article class="empty-memory">${icon('sparkles')}<p>${escapeHTML(text)}</p></article>`;
  }

  function renderReviewItem(slug, review) {
    const chapter = chapterBySlug(slug);
    if (!chapter) return '';
    const isDue = new Date(review.nextReviewAt).getTime() <= Date.now();
    return `
      <a class="memory-list-item ${isDue ? 'due' : ''}" href="${chapterHref(chapter)}#memory">
        <span>${isDue ? '今天复习' : formatDate(review.nextReviewAt)}</span>
        <strong>Ch.${chapter.id} ${escapeHTML(chapter.title)}</strong>
        <p>${escapeHTML(reviewStatus(review))}</p>
      </a>
    `;
  }

  function renderNoteItem(slug, note) {
    const chapter = chapterBySlug(slug);
    if (!chapter) return '';
    const preview = String(note.text || '').trim().slice(0, 180);
    return `
      <a class="memory-list-item" href="${chapterHref(chapter)}#memory">
        <span>${formatDate(note.updatedAt)}</span>
        <strong>Ch.${chapter.id} ${escapeHTML(chapter.title)}</strong>
        <p>${escapeHTML(preview)}${note.text.length > 180 ? '...' : ''}</p>
      </a>
    `;
  }

  function infoBlock(title, text, iconName) {
    return `
      <article class="info-block">
        ${icon(iconName)}
        <h3>${escapeHTML(title)}</h3>
        <p>${escapeHTML(text)}</p>
      </article>
    `;
  }

  function infoList(title, items, iconName) {
    return `
      <article class="info-block">
        ${icon(iconName)}
        <h3>${escapeHTML(title)}</h3>
        <ul>${(items || []).map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>
      </article>
    `;
  }

  function sectionNumber(line) {
    const match = String(line).match(/^(\d+\.\d+)/);
    return match ? match[1] : '';
  }

  function sectionTitle(line) {
    return String(line).replace(/^\d+\.\d+\s*/, '');
  }

  function locationMatches(location, sectionNo) {
    const sectionKey = (value) => {
      const parts = String(value).split('.').map(Number);
      return (parts[0] || 0) * 100 + (parts[1] || 0);
    };
    return String(location)
      .split(',')
      .map((item) => item.trim())
      .some((item) => {
        if (item === sectionNo) return true;
        if (item.startsWith(`${sectionNo}-`)) return true;
        if (item.endsWith(`-${sectionNo}`)) return true;
        const range = item.match(/^(\d+\.\d+)-(\d+\.\d+)$/);
        if (range) {
          const current = sectionKey(sectionNo);
          return current >= sectionKey(range[1]) && current <= sectionKey(range[2]);
        }
        return item.includes(`-${sectionNo}`) || item.includes(`${sectionNo}-`);
      });
  }

  function renderSourceTable(chapter) {
    return `
      <div class="table-wrap">
        <table class="source-table">
          <thead>
            <tr>
              <th>原书小节</th>
              <th>本页对应知识点</th>
              <th>建议阅读</th>
            </tr>
          </thead>
          <tbody>
            ${chapter.sections.map((line) => {
              const no = sectionNumber(line);
              const concepts = chapter.concepts
                .filter((concept) => locationMatches(concept.location, no))
                .map((concept) => concept.title);
              const mode = chapter.reading.intensive.includes(no) ? '精读' : chapter.reading.skim.includes(no) ? '略读' : '通读';
              const modeClass = mode === '精读' ? 'hot' : mode === '略读' ? 'soft' : '';
              return `
                <tr>
                  <td><strong>${escapeHTML(no)}</strong><span>${escapeHTML(sectionTitle(line))}</span></td>
                  <td>${concepts.length ? escapeHTML(concepts.join('、')) : '建立章节背景或补充细节'}</td>
                  <td>${badge(mode, modeClass)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderConcept(concept) {
    return `
      <article class="concept-card">
        <div class="concept-card-head">
          <span class="source-pill">原书 ${escapeHTML(concept.location)}</span>
          <h3>${escapeHTML(concept.title)}</h3>
        </div>
        <div class="concept-grid">
          <div>
            <h4>原书想解决的问题</h4>
            <p>${escapeHTML(concept.problem)}</p>
          </div>
          <div>
            <h4>直觉解释</h4>
            <p>${escapeHTML(concept.intuition)}</p>
          </div>
          <div>
            <h4>数学表达</h4>
            <p class="math-inline">\\[${concept.math}\\]</p>
          </div>
          <div>
            <h4>概念关系</h4>
            <p>${escapeHTML(concept.relation)}</p>
          </div>
          <div class="wide">
            <h4>与后续章节的关系</h4>
            <p>${escapeHTML(concept.future)}</p>
          </div>
        </div>
      </article>
    `;
  }

  function renderPlainList(items, className) {
    return `<ul class="${className || 'plain-list'}">${(items || []).map((item) => `<li>${escapeHTML(item)}</li>`).join('')}</ul>`;
  }

  function renderPager(chapter) {
    const prev = chapterById(chapter.id - 1);
    const next = chapterById(chapter.id + 1);
    return `
      ${prev ? `<a class="pager-link" href="${chapterHref(prev)}"><span>上一章</span><strong>Ch.${prev.id} ${escapeHTML(prev.title)}</strong></a>` : '<span></span>'}
      ${next ? `<a class="pager-link next" href="${chapterHref(next)}"><span>下一章</span><strong>Ch.${next.id} ${escapeHTML(next.title)}</strong></a>` : '<span></span>'}
    `;
  }

  function renderSearchResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) return '';
    const chapterResults = data.chapters.filter((chapter) => {
      const hay = `${chapter.id} ${chapter.title} ${chapter.english} ${chapter.summary} ${chapter.keywords.join(' ')} ${chapter.sections.join(' ')}`.toLowerCase();
      return hay.includes(q);
    }).slice(0, 6);
    const formulaResults = data.formulas.filter((formula) => {
      const hay = `${formula.title} ${formula.category} ${formula.meaning} ${formula.use} ${formula.tags.join(' ')}`.toLowerCase();
      return hay.includes(q);
    }).slice(0, 5);

    if (!chapterResults.length && !formulaResults.length) {
      return '<div class="empty-result">没有找到匹配内容</div>';
    }
    return `
      ${chapterResults.length ? '<div class="result-label">章节</div>' : ''}
      ${chapterResults.map((chapter) => `<a class="search-result-item" href="${chapterHref(chapter)}"><strong>Ch.${chapter.id} ${escapeHTML(chapter.title)}</strong><span>${escapeHTML(chapter.summary)}</span></a>`).join('')}
      ${formulaResults.length ? '<div class="result-label">公式</div>' : ''}
      ${formulaResults.map((formula) => `<button class="search-result-item formula-result" data-formula-id="${escapeHTML(formula.id)}"><strong>${escapeHTML(formula.title)}</strong><span>${escapeHTML(formula.category)} / ${escapeHTML(formula.source)}</span></button>`).join('')}
    `;
  }

  window.DLComponents = {
    basePath,
    chapterHref,
    chapterById,
    chapterBySlug,
    escapeHTML,
    icon,
    layout,
    renderHome,
    renderChapter,
    renderMemory,
    renderFormulaCard,
    renderSearchResults,
    getProgress,
    readMemory,
    writeMemory,
    formatDate,
    reviewStatus
  };
})();
