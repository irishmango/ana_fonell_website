// Simple custom music player implementation
// Update track src and cover paths to your actual assets

const tracks = [
    { title: "Vamos Nina", artist: "Ana Fonell", src: "assets/audio/vamos_nina.mp3", cover: "assets/img/ana_shoes.jpg", duration: null },
    { title: "Nostalgias", artist: "Ana Fonell", src: "assets/audio/nostalgias_live.mp3", cover: "assets/img/ana_shoes.jpg", duration: null },
    { title: "Negra Maria", artist: "Ana Fonell", src: "assets/audio/negra_maria.mp3", cover: "assets/img/ana_shoes.jpg", duration: null },
    { title: "Los Mareados", artist: "Ana Fonell", src: "assets/audio/los_mareados.mp3", cover: "assets/img/ana_shoes.jpg", duration: null },
    { title: "El Choclo", artist: "Ana Fonell", src: "assets/audio/el_choclo.mp3", cover: "assets/img/ana_shoes.jpg", duration: null },
    { title: "Chiquilín de Bachín", artist: "Ana Fonell", src: "assets/audio/chiquilín_de_bachin.mp3", cover: "assets/img/ana_shoes.jpg", duration: null },
    { title: "Che Bandoneón", artist: "Ana Fonell", src: "assets/audio/che_bandoneon_live.mp3", cover: "assets/img/ana_shoes.jpg", duration: null },
    { title: "Caserón de Tejas", artist: "Ana Fonell", src: "assets/audio/caseron_de_tejas.mp3", cover: "assets/img/ana_shoes.jpg", duration: null }
];

const audio = document.getElementById("audio");
const player = document.querySelector(".player");
if (!player || !audio) {
    console.warn("Player markup not found; aborting initialization.");
}

const titleEl = player?.querySelector(".player__title");
const artistEl = player?.querySelector(".player__artist");
const coverEl = player?.querySelector(".player__cover");
const btnPlay = player?.querySelector(".btn--play");
const btnPrev = player?.querySelector(".btn--prev");
const btnNext = player?.querySelector(".btn--next");
const btnMute = player?.querySelector(".btn--mute");
const timeCurrent = player?.querySelector(".time--current");
const timeTotal = player?.querySelector(".time--total");
const seek = player?.querySelector(".seek");
const volume = player?.querySelector(".volume");
const playlistEl = document.querySelector(".playlist");

let index = 0;
let isSeeking = false;

function fmt(sec) {
    if (isNaN(sec) || !isFinite(sec)) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

function load(i) {
    index = (i + tracks.length) % tracks.length;
    const t = tracks[index];
    audio.src = t.src;
    if (titleEl) titleEl.textContent = t.title;
    if (artistEl) artistEl.textContent = t.artist || "";
    if (coverEl) coverEl.src = t.cover || "assets/img/cover-placeholder.jpg";
    [...playlistEl.querySelectorAll("button")].forEach((b, bi) =>
        b.classList.toggle("is-active", bi === index)
    );
}

function play() {
    audio.play();
    if (btnPlay) {
        btnPlay.textContent = "⏸";
        btnPlay.setAttribute("aria-label", "Pause");
    }
}
function pause() {
    audio.pause();
    if (btnPlay) {
        btnPlay.textContent = "▶";
        btnPlay.setAttribute("aria-label", "Play");
    }
}
function togglePlay() { audio.paused ? play() : pause(); }
function next() { load(index + 1); play(); }
function prev() { load(index - 1); play(); }

function buildPlaylist() {
    playlistEl.innerHTML = "";
    tracks.forEach((t, i) => {
        const li = document.createElement("li");
        const btn = document.createElement("button");
        btn.type = "button";
        btn.innerHTML = `<span>${t.title}${t.artist ? " — " + t.artist : ""}</span><span class="dur">${t.duration ? fmt(t.duration) : ""}</span>`;
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
        const durSpan = playlistEl.querySelectorAll(".dur")[index];
        if (durSpan) durSpan.textContent = fmt(audio.duration);
    }
});

seek?.addEventListener("input", () => { isSeeking = true; });
seek?.addEventListener("change", () => { audio.currentTime = Number(seek.value); isSeeking = false; });
volume?.addEventListener("input", () => { audio.volume = Number(volume.value); });
btnMute?.addEventListener("click", () => {
    audio.muted = !audio.muted;
    btnMute.textContent = audio.muted ? "🔇" : "🔈";
});
btnPlay?.addEventListener("click", togglePlay);
btnPrev?.addEventListener("click", prev);
btnNext?.addEventListener("click", next);
audio.addEventListener("ended", next);

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
    buildPlaylist();
    load(0);
}

// Drawer toggle (mobile menu): full-screen slide-down
(function () {
    const toggleBtn = document.getElementById('menuToggle');
    const drawer = document.getElementById('drawer');
    if (!toggleBtn || !drawer) return;

    const openDrawer = () => {
        drawer.hidden = false;
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.setAttribute('aria-label', 'Close menu');
        toggleBtn.textContent = '×';
        document.documentElement.style.overflow = 'hidden';
    };
    const closeDrawer = () => {
        drawer.hidden = true;
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.setAttribute('aria-label', 'Open menu');
        toggleBtn.textContent = '☰';
        document.documentElement.style.overflow = '';
    };

    toggleBtn.addEventListener('click', () => {
        const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
        isOpen ? closeDrawer() : openDrawer();
    });

    // Click on overlay background closes (but not on links)
    drawer.addEventListener('click', (e) => {
        if (e.target === drawer) closeDrawer();
    });
    // Link click closes
    drawer.addEventListener('click', (e) => {
        const link = e.target.closest('.drawer__link');
        if (link) closeDrawer();
    });

    // ESC to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && toggleBtn.getAttribute('aria-expanded') === 'true') closeDrawer();
    });

    // Ensure closed on desktop resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 700) closeDrawer();
    });
})();

// Dynamic nav highlighting based on scroll position
(function () {
    const sections = document.querySelectorAll('section[id]');
    const links = document.querySelectorAll('.nav_link, .drawer__link');
    if (!sections.length || !links.length) return;

    const map = new Map();
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) map.set(href.slice(1), link);
    });

    const clear = () => links.forEach(l => l.removeAttribute('aria-current'));
    const setActive = (id) => {
        const link = map.get(id);
        if (!link) return;
        clear();
        link.setAttribute('aria-current', 'page');
    };

    // IntersectionObserver removed by request; using scroll-based activation only

    // Initial highlight
    setActive(sections[0].id);

    // Scroll-based activation
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + window.innerHeight * 0.25; // quarter down viewport
        let currentId = sections[0].id;
        sections.forEach(sec => {
            if (scrollPos >= sec.offsetTop) currentId = sec.id;
        });
        const activeLink = map.get(currentId);
        if (activeLink && !activeLink.hasAttribute('aria-current')) setActive(currentId);
    }, { passive: true });
})();

// Language dropdown toggle
(function () {
    const container = document.querySelector('.lang-switch');
    if (!container) return;
    const btn = container.querySelector('.lang-toggle');
    const menu = container.querySelector('#langMenu');
    if (!btn || !menu) return;

    // Initialize label from URL param (persist selection across page loads)
    try {
        const params = new URLSearchParams(window.location.search);
        const langParam = params.get('lang');
        if (langParam) btn.textContent = langParam.toUpperCase();
    } catch { }

    const open = () => {
        btn.setAttribute('aria-expanded', 'true');
        menu.hidden = false;
        container.classList.add('is-open');
    };
    const close = () => {
        btn.setAttribute('aria-expanded', 'false');
        menu.hidden = true;
        container.classList.remove('is-open');
    };

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        isOpen ? close() : open();
    });

    // Update label on selection (in case navigation is intercepted or during SPA)
    menu.addEventListener('click', (e) => {
        const a = e.target.closest('a[role="menuitem"]');
        if (!a) return;
        const text = (a.textContent || '').trim().toUpperCase();
        if (text) btn.textContent = text;
        close();
        // allow navigation to proceed normally
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!container.contains(e.target)) close();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
})();

