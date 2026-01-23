(function () {
    const container = document.querySelector('.press-articles');
    const prevBtn = document.querySelector('.press-arrow--prev');
    const nextBtn = document.querySelector('.press-arrow--next');
    if (!container) return;

    // Determine language (same approach as app.js would) from URL param or <html lang>
    const urlParams = new URLSearchParams(window.location.search);
    const paramLang = urlParams.get('lang');
    const htmlLang = document.documentElement.lang || 'en';
    const lang = (paramLang || htmlLang || 'en').toLowerCase();

    // For now only German dataset exists; attempt lang-specific file fallback to de
    const dataFile = `/data/press-${lang}.json`;
    const fallbackFile = '/data/press-de.json';

    function fetchJson(path) {
        return fetch(path).then(r => {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        });
    }

    function render(reviews) {
        if (!Array.isArray(reviews)) return;
        container.innerHTML = '';
        reviews.forEach((rev, idx) => {
            const id = `press-card-${idx}`;
            const card = document.createElement('article');
            card.className = 'press-card';
            card.setAttribute('role', 'article');
            card.setAttribute('aria-labelledby', id + '-title');
            card.innerHTML = `
                <h3 id="${id}-title">${rev.publication}</h3>
                <div class="press-meta">${rev.year}</div>
                <div class="press-text">${escapeHtml(rev.text_1)}\n\n${escapeHtml(rev.text_2 || '')}</div>
            `;
            container.appendChild(card);
        });
        buildPages();
        updateArrows();
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[s]));
    }

    function loadPressData(language) {
        const file = `/data/press-${language}.json`;
        fetchJson(file)
            .catch(() => fetchJson(fallbackFile))
            .then(data => render(data.reviews))
            .catch(err => {
                console.error('Failed to load press reviews', err);
                container.innerHTML = '<p style="opacity:.8">Press reviews unavailable.</p>';
            });
    }

    // Initial load
    loadPressData(lang);

    // Listen for language changes from I18N
    document.addEventListener('i18n:change', (e) => {
        const newLang = e.detail?.lang;
        if (newLang) loadPressData(newLang);
    });

    // Optional: drag-to-scroll for desktop + touch fallback
    let isDown = false; let startX = 0; let scrollLeft = 0;
    container.addEventListener('pointerdown', e => {
        isDown = true; startX = e.clientX; scrollLeft = container.scrollLeft; container.setPointerCapture(e.pointerId);
    });
    container.addEventListener('pointermove', e => {
        if (!isDown) return; const dx = e.clientX - startX; container.scrollLeft = scrollLeft - dx;
    });
    container.addEventListener('pointerup', e => { isDown = false; container.releasePointerCapture(e.pointerId); });
    container.addEventListener('pointerleave', () => { isDown = false; });

    // Arrow / page logic: group cards into up to 3 pages and compute start offsets
    let pageOffsets = [];
    function buildPages() {
        const cards = [...container.querySelectorAll('.press-card')];
        const total = cards.length;
        let pages = [];
        if (total <= 3) {
            pages = cards.map((c, i) => ({ index: i }));
        } else {
            const groups = 3;
            const perGroup = Math.ceil(total / groups);
            pages = Array.from({ length: groups }, (_, g) => ({ index: g * perGroup }));
        }
        // compute offsets (use left position of start card)
        pageOffsets = pages.map(p => {
            const card = cards[p.index];
            return card ? card.offsetLeft : 0;
        });
        // ensure offsets exist after layout (recompute on next frame)
        requestAnimationFrame(() => {
            pageOffsets = pages.map(p => {
                const card = cards[p.index];
                return card ? card.offsetLeft : 0;
            });
            updateArrows();
        });
    }

    function scrollToPage(pageIndex) {
        const targetOffset = pageOffsets[pageIndex];
        if (targetOffset === undefined) return;
        container.scrollTo({ left: targetOffset, behavior: 'smooth' });
        setTimeout(() => updateArrows(), 350);
    }

    function getActivePage() {
        if (!pageOffsets.length) return 0;
        const scrollLeft = container.scrollLeft;
        let active = 0; let min = Infinity;
        pageOffsets.forEach((off, i) => {
            const d = Math.abs(off - scrollLeft);
            if (d < min) { min = d; active = i; }
        });
        return active;
    }

    function updateArrows() {
        if (!prevBtn && !nextBtn) return;
        const active = getActivePage();
        if (prevBtn) { if (active === 0) prevBtn.setAttribute('disabled', ''); else prevBtn.removeAttribute('disabled'); }
        if (nextBtn) { if (active >= pageOffsets.length - 1) nextBtn.setAttribute('disabled', ''); else nextBtn.removeAttribute('disabled'); }
    }

    function goPrev() { const a = getActivePage(); scrollToPage(Math.max(0, a - 1)); }
    function goNext() { const a = getActivePage(); scrollToPage(Math.min(pageOffsets.length - 1, a + 1)); }

    prevBtn && prevBtn.addEventListener('click', goPrev);
    nextBtn && nextBtn.addEventListener('click', goNext);

    container.addEventListener('scroll', () => {
        if (updateArrows._raf) return;
        updateArrows._raf = requestAnimationFrame(() => { updateArrows(); updateArrows._raf = null; });
    });
    window.addEventListener('resize', () => buildPages());
})();