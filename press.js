(function () {
    const container = document.querySelector('.press-articles');
    const dotsWrap = document.querySelector('.press-pagination');
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
                <h3 id="${id}-title">${rev.title}</h3>
                <div class="press-meta">${rev.publication} · ${rev.year}</div>
                <div class="press-text">${escapeHtml(rev.text_1)}\n\n${escapeHtml(rev.text_2 || '')}</div>
            `;
            container.appendChild(card);
        });
        buildDots();
        updateActiveDot();
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>]/g, s => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[s]));
    }

    // Try language file first, fallback to German
    fetchJson(dataFile)
        .catch(() => fetchJson(fallbackFile))
        .then(data => render(data.reviews))
        .catch(err => {
            console.error('Failed to load press reviews', err);
            container.innerHTML = '<p style="opacity:.8">Press reviews unavailable.</p>';
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

    // Pagination dots logic
    // Build pagination dots: limit to 3 groups if more than 3 cards
    let pageOffsets = [];
    function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        const cards = [...container.querySelectorAll('.press-card')];
        const total = cards.length;
        const labelMap = { en: 'Review', de: 'Rezension', es: 'Reseña' };
        const base = labelMap[lang] || labelMap.en;

        let pages;
        if (total <= 3) {
            // One dot per card
            pages = cards.map((c, i) => ({ index: i, label: base + ' ' + (i + 1) }));
        } else {
            // Group into 3 roughly equal pages
            const groups = 3;
            const perGroup = Math.ceil(total / groups);
            pages = Array.from({ length: groups }, (_, g) => {
                const startIndex = g * perGroup;
                return { index: startIndex, label: base + ' ' + (g + 1) };
            });
        }
        pageOffsets = pages.map(p => cards[p.index]?.offsetLeft || 0);

        pages.forEach((p, i) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'press-dot';
            btn.setAttribute('aria-label', p.label);
            btn.addEventListener('click', () => scrollToPage(i));
            dotsWrap.appendChild(btn);
        });
    }

    function scrollToPage(pageIndex) {
        const targetOffset = pageOffsets[pageIndex];
        if (targetOffset === undefined) return;
        container.scrollTo({ left: targetOffset, behavior: 'smooth' });
        setTimeout(updateActiveDot, 350);
    }

    function updateActiveDot() {
        if (!dotsWrap) return;
        const dots = [...dotsWrap.querySelectorAll('.press-dot')];
        if (!dots.length) return;
        const scrollLeft = container.scrollLeft;
        let activePage = 0;
        let minDist = Infinity;
        pageOffsets.forEach((off, i) => {
            const dist = Math.abs(off - scrollLeft);
            if (dist < minDist) { minDist = dist; activePage = i; }
        });
        dots.forEach((d, i) => {
            if (i === activePage) { d.classList.add('is-active'); d.setAttribute('aria-current', 'true'); }
            else { d.classList.remove('is-active'); d.removeAttribute('aria-current'); }
        });
    }

    container.addEventListener('scroll', () => {
        // Throttle using requestAnimationFrame
        if (updateActiveDot._raf) return;
        updateActiveDot._raf = requestAnimationFrame(() => { updateActiveDot(); updateActiveDot._raf = null; });
    });
    window.addEventListener('resize', () => updateActiveDot());
})();