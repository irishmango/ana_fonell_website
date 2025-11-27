// Music-related JS: audio player + albums carousel

// =========================
// Data loading (albums + tracks)
// =========================
let albums = [];
let tracks = [];
let currentAlbumIndex = 0;

async function loadMusicData() {
    try {
        const resp = await fetch('data/music.json', { cache: 'no-cache' });
        if (resp.ok) {
            const json = await resp.json();
            if (Array.isArray(json.albums)) albums = json.albums;
        }
    } catch { }

    if (!albums.length) {
        // Fallback: default Tango album using current hardcoded tracks
        albums = [
            {
                id: 'tango',
                title: 'Tango',
                cover: 'assets/img/ana_shoes.jpg',
                year: 2025,
                tracks: [
                    { title: 'Los Mareados', artist: 'Ana Fonell', details: 'mit Quique Sinesi (Gitarre) • 2025', year: 2025, src: 'assets/audio/los_mareados.mp3', cover: 'assets/img/ana_shoes.jpg' },
                    { title: 'Caserón de Tejas', artist: 'Ana Fonell', details: 'mit Quique Sinesi (Gitarre) • 2025', year: 2025, src: 'assets/audio/caseron_de_tejas.mp3', cover: 'assets/img/ana_shoes.jpg' },
                    { title: 'Negra Maria', artist: 'Ana Fonell', details: 'mit Pablo Woizinski (Piano) und César Nigro (Gitarre) • 2006', year: 2006, src: 'assets/audio/negra_maria.mp3', cover: 'assets/img/ana_shoes.jpg' },
                    { title: 'Nostalgias', artist: 'Ana Fonell', details: 'mit Quique Sinesi (Gitarre) • 2004', year: 2004, src: 'assets/audio/nostalgias_live.mp3', cover: 'assets/img/ana_shoes.jpg' },
                    { title: 'Che Bandoneón', artist: 'Ana Fonell', details: 'mit Fernando Maguna (Piano) und Diego Trosman (Gitarre) • 2002', year: 2002, src: 'assets/audio/che_bandoneon_live.mp3', cover: 'assets/img/ana_shoes.jpg' },
                    { title: 'Vamos Nina', artist: 'Ana Fonell', details: 'mit Corinna Söller (Klavier) und Katja Kulesza (Violine) • 2002', year: 2002, src: 'assets/audio/vamos_nina.mp3', cover: 'assets/img/ana_shoes.jpg' },
                    { title: 'Chiquilín de Bachín', artist: 'Ana Fonell', details: 'mit Gustavo Battistessa (Bandoneon) und Marcelo Iglesias (Piano) • 1998', year: 1998, src: 'assets/audio/chiquilín_de_bachin.mp3', cover: 'assets/img/ana_shoes.jpg' },
                    { title: 'El Choclo', artist: 'Ana Fonell', details: 'mit Coco Nelegatti (Gitarre) • 1998', year: 1998, src: 'assets/audio/el_choclo.mp3', cover: 'assets/img/ana_shoes.jpg' }
                ]
            }
        ];
    }

    currentAlbumIndex = 0;
    tracks = (albums[0] && Array.isArray(albums[0].tracks)) ? albums[0].tracks.map(t => ({ ...t, duration: null })) : [];
    try { document.dispatchEvent(new CustomEvent('music:update-tracks')); } catch { }
    try { document.dispatchEvent(new CustomEvent('music:data-ready')); } catch { }
}

(function initPlayer() {
    const audio = document.getElementById("audio");
    const player = document.querySelector(".player");
    if (!player || !audio) return;

    const titleEl = player.querySelector(".player__title");
    const artistEl = player.querySelector(".player__artist");
    const coverEl = player.querySelector(".player__cover");
    const btnPlay = player.querySelector(".btn--play");
    const btnPrev = player.querySelector(".btn--prev");
    const btnNext = player.querySelector(".btn--next");
    const btnMute = player.querySelector(".btn--mute");
    const timeCurrent = player.querySelector(".time--current");
    const timeTotal = player.querySelector(".time--total");
    const seek = player.querySelector(".seek");
    const volume = player.querySelector(".volume");
    const playlistEl = document.querySelector(".playlist");

    let index = 0;
    let isSeeking = false;

    function fmt(sec) {
        if (isNaN(sec) || !isFinite(sec)) return "0:00";
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    }

    function ensureCreditsEl() {
        if (!artistEl) return null;
        let creditsEl = player.querySelector('.player__credits');
        if (!creditsEl) {
            creditsEl = document.createElement('div');
            creditsEl.className = 'player__credits';
            artistEl.insertAdjacentElement('afterend', creditsEl);
        }
        return creditsEl;
    }

    function load(i) {
        index = (i + tracks.length) % tracks.length;
        const t = tracks[index];
        audio.src = t.src;
        if (titleEl) titleEl.textContent = t.title;
        const creditsStr = formatCredits(t);
        if (artistEl) artistEl.textContent = t.details || t.artist || "";
        const creditsEl = ensureCreditsEl();
        if (creditsEl) creditsEl.textContent = creditsStr;
        if (coverEl) coverEl.src = t.cover || "assets/img/ana_shoes.jpg";
        [...playlistEl.querySelectorAll("button")].forEach((b, bi) =>
            b.classList.toggle("is-active", bi === index)
        );
    }

    function play() {
        audio.play();
        if (btnPlay) {
            btnPlay.classList.add('is-playing');
            btnPlay.setAttribute("aria-label", "Pause");
        }
    }
    function pause() {
        audio.pause();
        if (btnPlay) {
            btnPlay.classList.remove('is-playing');
            btnPlay.setAttribute("aria-label", "Play");
        }
    }
    function togglePlay() { audio.paused ? play() : pause(); }
    function next() { load(index + 1); play(); }
    function prev() { load(index - 1); play(); }

    function formatCredits(t) {
        if (!t.credits || typeof t.credits !== 'object') return '';
        const order = ['M', 'L', 'T'];
        const labelMap = { M: 'Music', L: 'Lyrics', T: 'Text' };
        const parts = order
            .filter(k => t.credits[k])
            .map(k => `${labelMap[k]}: ${t.credits[k]}`);
        return parts.join(' / ');
    }

    function buildPlaylist() {
        playlistEl.innerHTML = "";
        tracks.forEach((t, i) => {
            const li = document.createElement("li");
            const btn = document.createElement("button");
            btn.type = "button";
            const creditsStr = formatCredits(t);
            const subLine = t.details || '';
            btn.innerHTML = `
                <span class="main">${t.title}</span>
                <span class="dur">${t.duration ? fmt(t.duration) : ""}</span>
                <small class="sub">${subLine}</small>
                ${creditsStr ? `<small class="credits">${creditsStr}</small>` : ''}
            `;
            btn.addEventListener("click", () => { load(i); play(); });
            li.appendChild(btn);
            playlistEl.appendChild(li);
        });
    }

    // Events
    audio.addEventListener("loadedmetadata", () => {
        if (timeTotal) timeTotal.textContent = fmt(audio.duration);
        if (seek) seek.max = audio.duration || 100;
    });
    audio.addEventListener("timeupdate", () => {
        if (!isSeeking && seek) seek.value = audio.currentTime || 0;
        if (timeCurrent) timeCurrent.textContent = fmt(audio.currentTime);
        if (!tracks[index].duration && isFinite(audio.duration)) {
            tracks[index].duration = audio.duration;
            const durSpan = playlistEl?.querySelectorAll(".dur")[index];
            if (durSpan) durSpan.textContent = fmt(audio.duration);
        }
    });

    seek?.addEventListener("input", () => { isSeeking = true; });
    seek?.addEventListener("change", () => { audio.currentTime = Number(seek.value); isSeeking = false; });
    volume?.addEventListener("input", () => { audio.volume = Number(volume.value); });
    btnMute?.addEventListener("click", () => {
        audio.muted = !audio.muted;
        btnMute.classList.toggle('is-muted', audio.muted);
        btnMute.setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute');
    });
    btnPlay?.addEventListener("click", togglePlay);
    btnPrev?.addEventListener("click", prev);
    btnNext?.addEventListener("click", next);
    audio?.addEventListener("ended", next);

    player?.addEventListener("keydown", (e) => {
        if (e.target.matches("input")) return; // don't hijack slider interactions
        if (e.code === "Space") { e.preventDefault(); togglePlay(); }
        if (e.code === "ArrowRight") audio.currentTime = Math.min(audio.currentTime + 5, audio.duration || audio.currentTime + 5);
        if (e.code === "ArrowLeft") audio.currentTime = Math.max(audio.currentTime - 5, 0);
        if (e.code === "ArrowUp") { audio.volume = Math.min(audio.volume + 0.05, 1); if (volume) volume.value = audio.volume; }
        if (e.code === "ArrowDown") { audio.volume = Math.max(audio.volume - 0.05, 0); if (volume) volume.value = audio.volume; }
    });

    // Init
    if (player && audio && playlistEl) {
        if (tracks && tracks.length) {
            buildPlaylist();
            load(0);
        }
        // Rebuild when tracks change (after data load or album switch)
        document.addEventListener('music:update-tracks', () => {
            index = 0;
            buildPlaylist();
            load(0);
        });
    }
})();

// =========================
// Albums carousel (with placeholder)
// =========================
(function initAlbumsCarousel() {
    const viewport = document.querySelector('.albums__viewport');
    const track = document.querySelector('.albums__track');
    const prevBtn = document.querySelector('.albums__arrow--prev');
    const nextBtn = document.querySelector('.albums__arrow--next');
    if (!viewport || !track || !prevBtn || !nextBtn) return;

    // Uses global albums loaded from data; if empty, a placeholder will be shown

    let perPage = calcPerPage();
    let pages = [];
    let pageIndex = 0;

    function calcPerPage() {
        const w = window.innerWidth;
        if (w <= 700) return 1;
        if (w <= 1024) return 2;
        return 4;
    }

    function chunk(arr, size) {
        const out = [];
        for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
        return out;
    }

    function render() {
        track.innerHTML = '';
        const data = pages;
        data.forEach(group => {
            const page = document.createElement('div');
            page.className = 'albums__page';
            group.forEach(a => {
                const card = document.createElement('article');
                if (a.placeholder) {
                    card.className = 'album-card album-card--empty';
                    const msg = (typeof I18N?.t === 'function') ? I18N.t('albums.placeholder', 'More music coming soon') : 'More music coming soon';
                    card.innerHTML = `<p class="album-card__emptyMsg">${msg}</p>`;
                } else {
                    card.className = 'album-card';
                    const meta = (a.meta != null ? String(a.meta) : (a.year != null ? String(a.year) : ''));
                    card.innerHTML = `
                        <img class="album-card__cover" src="${a.cover}" alt="${a.title}">
                        <div class="album-card__body">
                            <h3 class="album-card__title">${a.title}</h3>
                            ${meta ? `<p class="album-card__meta">${meta}</p>` : ''}
                        </div>
                    `;
                    // Album selection: update global tracks and notify player
                    card.addEventListener('click', () => {
                        const idx = albums.findIndex(x => x.id === a.id);
                        if (idx >= 0) currentAlbumIndex = idx;
                        tracks = Array.isArray(a.tracks) ? a.tracks.map(t => ({ ...t, duration: null })) : [];
                        try { document.dispatchEvent(new CustomEvent('music:update-tracks')); } catch { }
                        const player = document.querySelector('.player');
                        if (player) player.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    });
                }
                page.appendChild(card);
            });
            track.appendChild(page);
        });
        update();
    }

    function rebuildIfNeeded() {
        const nextPer = calcPerPage();
        if (nextPer !== perPage) {
            perPage = nextPer;
            pages = chunk(albums, perPage);
            pageIndex = Math.min(pageIndex, pages.length - 1);
            render();
        } else {
            update();
        }
    }

    function update() {
        const offset = -pageIndex * 100;
        track.style.transform = `translateX(${offset}%)`;
        prevBtn.disabled = pageIndex <= 0;
        nextBtn.disabled = pageIndex >= pages.length - 1;
        // Hide arrows entirely if there's only one page
        const single = pages.length <= 1;
        prevBtn.style.display = single ? 'none' : '';
        nextBtn.style.display = single ? 'none' : '';
    }

    function next() { if (pageIndex < pages.length - 1) { pageIndex++; update(); } }
    function prev() { if (pageIndex > 0) { pageIndex--; update(); } }

    // Pointer/touch swipe
    let startX = 0;
    let dragging = false;
    let lastDelta = 0;

    function onDown(e) {
        dragging = true;
        startX = (e.touches ? e.touches[0].clientX : e.clientX);
        lastDelta = 0;
        track.style.transition = 'none';
    }
    function onMove(e) {
        if (!dragging) return;
        const x = (e.touches ? e.touches[0].clientX : e.clientX);
        const dx = x - startX;
        lastDelta = dx;
        const width = viewport.clientWidth || 1;
        const pct = (dx / width) * 100;
        const offset = (-pageIndex * 100) + pct;
        track.style.transform = `translateX(${offset}%)`;
    }
    function onUp() {
        if (!dragging) return;
        dragging = false;
        track.style.transition = '';
        const width = viewport.clientWidth || 1;
        const threshold = Math.max(40, width * 0.08); // px threshold
        if (lastDelta > threshold) prev();
        else if (lastDelta < -threshold) next();
        else update();
    }

    viewport.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    viewport.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
    window.addEventListener('resize', rebuildIfNeeded);

    function buildPages() {
        // Use only real albums; no placeholder card
        const source = Array.isArray(albums) ? albums.slice() : [];
        pages = chunk(source, perPage);
        pageIndex = Math.min(pageIndex, pages.length - 1);
    }

    // Initial build (renders real albums only; no placeholder)
    buildPages();
    render();

    // i18n: set aria-labels for arrows and keep them updated on language change
    function setArrowLabels() {
        try {
            const prevLabel = (typeof I18N?.t === 'function') ? I18N.t('albums.prev', 'Previous albums') : 'Previous albums';
            const nextLabel = (typeof I18N?.t === 'function') ? I18N.t('albums.next', 'Next albums') : 'Next albums';
            prevBtn.setAttribute('aria-label', prevLabel);
            nextBtn.setAttribute('aria-label', nextLabel);
        } catch { }
    }
    setArrowLabels();
    document.addEventListener('i18n:change', setArrowLabels);

    // Rebuild when data is ready
    document.addEventListener('music:data-ready', () => {
        pageIndex = 0;
        buildPages();
        render();
    });

    // Kick off data loading
    loadMusicData();
})();
