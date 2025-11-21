(function () {
    const grid = document.querySelector('.gallery-grid');
    if (!grid) return;

    // Create lightbox
    let lb = document.getElementById('lightbox');
    if (!lb) {
        lb = document.createElement('div');
        lb.className = 'lightbox';
        lb.id = 'lightbox';
        lb.setAttribute('hidden', '');
        lb.innerHTML = '<div class="lightbox__img-wrapper" role="dialog" aria-modal="true" aria-label="Expanded image"><button type="button" class="lightbox__close" aria-label="Close">×</button><img alt="Expanded image"></div>';
        document.body.appendChild(lb);
    }
    const imgEl = lb.querySelector('img');
    const closeBtn = lb.querySelector('.lightbox__close');

    function open(src, alt) {
        imgEl.src = src;
        imgEl.alt = alt || 'Expanded image';
        lb.removeAttribute('hidden');
        lb.classList.add('is-open');
        closeBtn.focus();
        document.addEventListener('keydown', onEsc);
    }
    function close() {
        lb.setAttribute('hidden', '');
        lb.classList.remove('is-open');
        document.removeEventListener('keydown', onEsc);
    }
    function onEsc(e) { if (e.key === 'Escape') close(); }

    grid.addEventListener('click', (e) => {
        const btn = e.target.closest('.gallery-item');
        if (!btn) return;
        const img = btn.querySelector('img');
        if (img) open(img.src, img.alt);
    });

    grid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const btn = e.target.closest('.gallery-item');
            if (!btn) return;
            e.preventDefault();
            const img = btn.querySelector('img');
            if (img) open(img.src, img.alt);
        }
    });

    closeBtn.addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
})();