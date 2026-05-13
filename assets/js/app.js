(function () {
  const data = window.DLGuideData;
  const C = window.DLComponents;

  function init() {
    applyTheme();
    const page = document.body.dataset.page;
    const root = document.getElementById('app');
    if (page === 'home') {
      root.innerHTML = C.renderHome();
    } else if (page === 'memory') {
      root.innerHTML = C.renderMemory();
    } else {
      const chapter = C.chapterBySlug(document.body.dataset.chapter);
      root.innerHTML = C.renderChapter(chapter || data.chapters[0]);
    }
    bindCommonInteractions(root);
    bindFormulaExplorer(root);
    bindChecklist(root);
    bindMemory(root);
    bindSearch(root);
    window.DLVisualizations.init(root);
    refreshMath();
    refreshIcons();
    updateScrollMeter();
    window.addEventListener('scroll', updateScrollMeter, { passive: true });
  }

  function applyTheme() {
    const saved = localStorage.getItem('dl-theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = saved || (prefersDark ? 'dark' : 'light');
  }

  function bindCommonInteractions(root) {
    const theme = root.querySelector('#theme-toggle');
    if (theme) {
      theme.addEventListener('click', () => {
        const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.dataset.theme = next;
        localStorage.setItem('dl-theme', next);
        window.DLVisualizations.init(document);
      });
    }

    const menu = root.querySelector('#mobile-menu');
    const sidebar = root.querySelector('#sidebar');
    if (menu && sidebar) {
      menu.addEventListener('click', () => sidebar.classList.toggle('open'));
    }

    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-close-modal]')) closeModal();
      const formulaCard = event.target.closest('.formula-card');
      if (formulaCard && !event.target.closest('a')) openFormulaModal(formulaCard.dataset.formulaId);
      const formulaResult = event.target.closest('.formula-result');
      if (formulaResult) openFormulaModal(formulaResult.dataset.formulaId);
      const favorite = event.target.closest('[data-formula-favorite]');
      if (favorite) toggleFormulaFavorite(favorite.dataset.formulaFavorite);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeModal();
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        const search = document.getElementById('global-search');
        if (search) search.focus();
      }
    });
  }

  function bindMemory(root) {
    const noteArea = root.querySelector('[data-note-chapter]');
    if (noteArea) bindChapterMemory(root, noteArea);
    bindMemoryDashboard(root);
  }

  function bindChapterMemory(root, noteArea) {
    const slug = noteArea.dataset.noteChapter;
    const saveNote = root.querySelector(`[data-save-note="${slug}"]`);
    const noteStatus = root.querySelector('[data-note-status]');
    const confidence = root.querySelector(`[data-review-confidence="${slug}"]`);
    const saveReview = root.querySelector(`[data-save-review="${slug}"]`);
    const reviewStatus = root.querySelector('[data-review-status]');

    noteArea.addEventListener('input', () => {
      if (noteStatus) noteStatus.textContent = '有未保存修改';
    });

    if (saveNote) {
      saveNote.addEventListener('click', () => {
        const memory = C.readMemory();
        const text = noteArea.value.trim();
        if (text) {
          memory.notes[slug] = { text, updatedAt: new Date().toISOString() };
        } else {
          delete memory.notes[slug];
        }
        C.writeMemory(memory);
        if (noteStatus) noteStatus.textContent = text ? `已保存：${C.formatDate(memory.notes[slug].updatedAt)}` : '笔记已清空';
      });
    }

    if (saveReview && confidence) {
      saveReview.addEventListener('click', () => {
        const days = { again: 1, shaky: 3, ok: 7, solid: 21 }[confidence.value] || 7;
        const nextReviewAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        const memory = C.readMemory();
        memory.reviews[slug] = {
          confidence: confidence.value,
          nextReviewAt,
          updatedAt: new Date().toISOString()
        };
        C.writeMemory(memory);
        if (reviewStatus) reviewStatus.textContent = C.reviewStatus(memory.reviews[slug]);
      });
    }
  }

  function bindMemoryDashboard(root) {
    const exportButton = root.querySelector('[data-export-memory]');
    const importInput = root.querySelector('[data-import-memory]');

    if (exportButton) {
      exportButton.addEventListener('click', () => {
        const checks = {};
        data.chapters.forEach((chapter) => {
          try {
            checks[chapter.slug] = JSON.parse(localStorage.getItem(`dl-check-${chapter.slug}`) || '{}');
          } catch {
            checks[chapter.slug] = {};
          }
        });
        const payload = {
          exportedAt: new Date().toISOString(),
          app: 'deep-learning-guide',
          memory: C.readMemory(),
          checks
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `deep-learning-guide-memory-${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        URL.revokeObjectURL(link.href);
      });
    }

    if (importInput) {
      importInput.addEventListener('change', async () => {
        const file = importInput.files && importInput.files[0];
        if (!file) return;
        const text = await file.text();
        try {
          const payload = JSON.parse(text);
          if (payload.memory) C.writeMemory(payload.memory);
          if (payload.checks) {
            Object.entries(payload.checks).forEach(([slug, value]) => {
              localStorage.setItem(`dl-check-${slug}`, JSON.stringify(value || {}));
            });
          }
          window.location.reload();
        } catch {
          alert('导入失败：文件不是有效的学习记忆 JSON。');
        }
      });
    }
  }

  function bindFormulaExplorer(root) {
    const grid = root.querySelector('#formula-grid');
    if (!grid) return;
    const filter = root.querySelector('#formula-filter');
    const tabs = root.querySelector('#formula-tabs');
    let active = 'all';

    function update() {
      const q = (filter.value || '').trim().toLowerCase();
      grid.querySelectorAll('.formula-card').forEach((card) => {
        const inCategory = active === 'all' || card.dataset.category === active;
        const inSearch = !q || card.dataset.search.toLowerCase().includes(q);
        card.hidden = !(inCategory && inSearch);
      });
      refreshMath();
    }

    filter.addEventListener('input', update);
    tabs.addEventListener('click', (event) => {
      const button = event.target.closest('[data-category]');
      if (!button) return;
      active = button.dataset.category;
      tabs.querySelectorAll('.chip').forEach((chip) => chip.classList.toggle('active', chip === button));
      update();
    });
  }

  function bindChecklist(root) {
    const checklist = root.querySelector('[data-checklist]');
    if (!checklist) return;
    const slug = checklist.dataset.checklist;
    const key = `dl-check-${slug}`;
    const boxes = Array.from(checklist.querySelectorAll('input[type="checkbox"]'));
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(key) || '{}');
    } catch {
      saved = {};
    }
    boxes.forEach((box) => {
      box.checked = Boolean(saved[box.dataset.checkIndex]);
      box.addEventListener('change', () => {
        const next = {};
        boxes.forEach((input) => {
          next[input.dataset.checkIndex] = input.checked;
        });
        localStorage.setItem(key, JSON.stringify(next));
      });
    });
    const reset = root.querySelector(`[data-reset-checks="${slug}"]`);
    if (reset) {
      reset.addEventListener('click', () => {
        localStorage.removeItem(key);
        boxes.forEach((box) => { box.checked = false; });
      });
    }
  }

  function bindSearch(root) {
    const input = root.querySelector('#global-search');
    const results = root.querySelector('#search-results');
    if (!input || !results) return;
    input.addEventListener('input', () => {
      const html = C.renderSearchResults(input.value);
      results.innerHTML = html;
      results.hidden = !html;
      refreshMath();
    });
    input.addEventListener('focus', () => {
      if (input.value.trim()) results.hidden = false;
    });
    document.addEventListener('click', (event) => {
      if (!event.target.closest('.global-search')) results.hidden = true;
    });
  }

  function openFormulaModal(id) {
    const formula = data.formulas.find((item) => item.id === id);
    if (!formula) return;
    const memory = C.readMemory();
    const isFavorite = Boolean(memory.favorites[id]);
    const chapters = formula.chapterRefs.map((chapterId) => {
      const chapter = C.chapterById(chapterId);
      return `<a class="mini-chip" href="${C.chapterHref(chapter)}">Ch.${chapter.id} ${C.escapeHTML(chapter.title)}</a>`;
    }).join('');
    const root = document.getElementById('modal-root');
    root.innerHTML = `
      <div class="modal-backdrop" data-close-modal>
        <article class="modal-card" role="dialog" aria-modal="true" aria-label="${C.escapeHTML(formula.title)}">
          <button class="icon-button modal-close" data-close-modal aria-label="关闭">${C.icon('x')}</button>
          <span class="source-pill ${formula.source === '现代延伸' ? 'modern' : ''}">${C.escapeHTML(formula.source)}</span>
          <h2>${C.escapeHTML(formula.title)}</h2>
          <div class="formula-latex large">\\[${formula.latex}\\]</div>
          <div class="modal-grid">
            <div><h3>含义</h3><p>${C.escapeHTML(formula.meaning)}</p></div>
            <div><h3>使用场景</h3><p>${C.escapeHTML(formula.use)}</p></div>
            <div><h3>一句话直觉</h3><p>${C.escapeHTML(formula.intuition)}</p></div>
            <div><h3>可视化理解</h3><p>${C.escapeHTML(formula.visual)}</p></div>
          </div>
          <div class="route-chips">${chapters}</div>
          <button class="button ghost" data-formula-favorite="${C.escapeHTML(id)}">${C.icon(isFavorite ? 'star-off' : 'star')}${isFavorite ? '取消收藏' : '收藏公式'}</button>
          ${formula.source === '现代延伸' ? '<p class="modern-disclaimer">这是原书之后的发展补充，不属于对应原书章节的核心内容。</p>' : ''}
        </article>
      </div>
    `;
    refreshMath();
    refreshIcons();
  }

  function toggleFormulaFavorite(id) {
    const memory = C.readMemory();
    if (memory.favorites[id]) {
      delete memory.favorites[id];
    } else {
      memory.favorites[id] = { createdAt: new Date().toISOString() };
    }
    C.writeMemory(memory);
    const button = document.querySelector('[data-formula-favorite]');
    if (button) {
      const isFavorite = Boolean(memory.favorites[id]);
      button.innerHTML = `${C.icon(isFavorite ? 'star-off' : 'star')}${isFavorite ? '取消收藏' : '收藏公式'}`;
      refreshIcons();
    }
  }

  function closeModal() {
    const root = document.getElementById('modal-root');
    if (root) root.innerHTML = '';
  }

  function refreshMath() {
    const run = () => {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.typesetPromise().catch(() => {});
      }
    };
    run();
    setTimeout(run, 400);
  }

  function refreshIcons() {
    const run = () => {
      if (window.lucide) window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
    };
    run();
    setTimeout(run, 300);
    setTimeout(run, 900);
  }

  function updateScrollMeter() {
    const fill = document.getElementById('scroll-meter-fill');
    if (!fill) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    fill.style.width = `${Math.round(progress * 100)}%`;
    const slug = document.body.dataset.chapter;
    if (slug) localStorage.setItem(`dl-scroll-${slug}`, String(progress));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
