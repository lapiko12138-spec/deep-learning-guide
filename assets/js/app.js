(function () {
  const data = window.DLGuideData;
  const C = window.DLComponents;

  function init() {
    applyTheme();
    const page = document.body.dataset.page;
    const root = document.getElementById('app');
    if (page === 'home') {
      root.innerHTML = C.renderHome();
    } else {
      const chapter = C.chapterBySlug(document.body.dataset.chapter);
      root.innerHTML = C.renderChapter(chapter || data.chapters[0]);
    }
    bindCommonInteractions(root);
    bindFormulaExplorer(root);
    bindChecklist(root);
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
          ${formula.source === '现代延伸' ? '<p class="modern-disclaimer">这是原书之后的发展补充，不属于对应原书章节的核心内容。</p>' : ''}
        </article>
      </div>
    `;
    refreshMath();
    refreshIcons();
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
