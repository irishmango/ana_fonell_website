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
    if (coverEl) coverEl.src = t.cover || "assets/img/ana_shoes.jpg";
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

// Simple i18n utility to load/apply translations
const I18N = (() => {
    const cache = Object.create(null);
    let current = null;

    const getLangFromUrl = () => {
        try {
            return new URLSearchParams(window.location.search).get('lang');
        } catch { return null; }
    };

    const getInitialLang = () => {
        const urlLang = getLangFromUrl();
        if (urlLang) return urlLang.toLowerCase();
        const saved = localStorage.getItem('lang');
        if (saved) return saved.toLowerCase();
        const htmlLang = (document.documentElement.getAttribute('lang') || 'en').slice(0, 2);
        return htmlLang.toLowerCase();
    };

    const load = async (lang) => {
        if (cache[lang]) return cache[lang];
        const candidates = [];
        try {
            const script = document.currentScript || document.querySelector('script[src*="script.js"]') || document.scripts[document.scripts.length - 1];
            const base = new URL(script?.src || window.location.href, window.location.href);
            const baseDir = new URL('.', base);
            candidates.push(new URL(`lang/${lang}.json`, baseDir).href);
        } catch { }
        candidates.push(`/lang/${lang}.json`);
        candidates.push(`lang/${lang}.json`);

        let lastErr = null;
        for (const url of candidates) {
            try {
                const resp = await fetch(url, { cache: 'no-cache' });
                if (resp.ok) {
                    const json = await resp.json();
                    cache[lang] = json;
                    return json;
                }
            } catch (e) { lastErr = e; }
        }
        throw lastErr || new Error(`Failed to load translations for ${lang}`);
    };

    const apply = (dict) => {
        // Text nodes
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (!key) return;
            const val = dict[key];
            if (typeof val === 'string') el.textContent = val;
        });
        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (!key) return;
            const val = dict[key];
            if (typeof val === 'string') el.setAttribute('placeholder', val);
        });
    };

    const setLang = async (lang, { updateUrl = true } = {}) => {
        try {
            const dict = await load(lang);
            apply(dict);
            document.documentElement.setAttribute('lang', lang);
            localStorage.setItem('lang', lang);
            current = lang;
            const btn = document.querySelector('.lang-toggle');
            if (btn) btn.textContent = lang.toUpperCase();
            if (updateUrl) {
                const url = new URL(window.location.href);
                url.searchParams.set('lang', lang);
                history.replaceState({}, '', url);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return { setLang, getInitialLang };
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

    // Initialize label from detected language
    try {
        const initial = I18N.getInitialLang();
        if (initial) btn.textContent = initial.toUpperCase();
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

    // Handle selection: prevent navigation, switch language via i18n
    menu.addEventListener('click', (e) => {
        const a = e.target.closest('a[role="menuitem"]');
        if (!a) return;
        e.preventDefault();
        const langAttr = a.getAttribute('lang');
        const hrefLang = (() => { try { return new URL(a.href).searchParams.get('lang'); } catch { return null; } })();
        const lang = (langAttr || hrefLang || (a.textContent || '').trim()).toLowerCase();
        if (lang) {
            I18N.setLang(lang);
            btn.textContent = lang.toUpperCase();
        }
        close();
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

document.addEventListener("DOMContentLoaded", () => {
    // Apply initial language on load
    const initialLang = I18N.getInitialLang();
    I18N.setLang(initialLang, { updateUrl: !new URLSearchParams(window.location.search).has('lang') });

    const form = document.getElementById("contactForm");
    const popup = document.getElementById('popup');
    const popupTitle = document.getElementById('popup-title');
    const popupDesc = document.getElementById('popup-desc');
    const popupOk = document.querySelector('.popup__ok');
    const popupCloseEls = document.querySelectorAll('[data-close]');
    let lastFocused = null;

    function openPopup({ title = 'Message', message = '', variant = 'success' } = {}) {
        if (!popup) return;
        lastFocused = document.activeElement;
        popupTitle.textContent = title;
        popupDesc.textContent = message;
        popup.classList.remove('popup--success', 'popup--error');
        popup.classList.add(variant === 'error' ? 'popup--error' : 'popup--success');
        popup.hidden = false;
        // Optional: trap focus minimal—move focus to OK
        popupOk?.focus();
        document.documentElement.style.overflow = 'hidden';
    }

    function closePopup() {
        if (!popup) return;
        popup.hidden = true;
        document.documentElement.style.overflow = '';
        if (lastFocused && typeof lastFocused.focus === 'function') {
            lastFocused.focus();
        }
    }

    // Close interactions
    popupCloseEls.forEach(el => el.addEventListener('click', closePopup));
    document.addEventListener('keydown', (e) => {
        const isOpen = popup && !popup.hidden;
        if (!isOpen) return;
        if (e.key === 'Escape') closePopup();
    });
    // Click outside panel via backdrop
    popup?.addEventListener('click', (e) => {
        if (e.target.classList.contains('popup__backdrop')) closePopup();
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        clearErrors();
        const nameInput = form.querySelector('#name');
        const emailInput = form.querySelector('#email');
        const messageInput = form.querySelector('#message');

        const errors = [];
        if (!nameInput.value.trim()) {
            errors.push({ el: nameInput, msg: 'Name is required.' });
        }
        if (!validateEmail(emailInput.value)) {
            errors.push({ el: emailInput, msg: 'Please enter a valid email address.' });
        }
        if (!messageInput.value.trim()) {
            errors.push({ el: messageInput, msg: 'Message cannot be empty.' });
        }

        if (errors.length) {
            errors.forEach(({ el, msg }) => showError(el, msg));
            return;
        }

        const formData = new FormData(form);
        let res;
        try {
            res = await fetch(form.action, {
                method: "POST",
                body: formData,
                headers: { "Accept": "application/json" }
            });
        } catch (err) {
            openPopup({ title: 'Network error', message: 'Could not submit. Check connection and try again.', variant: 'error' });
            return;
        }

        if (res.ok) {
            openPopup({ title: 'Thank you', message: 'Message sent successfully!', variant: 'success' });
            form.reset();
        } else {
            openPopup({ title: 'Sorry', message: 'Something went wrong. Please try again.', variant: 'error' });
        }
    });

    // Set footer year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Validation helpers
    function validateEmail(v) {
        const value = v.trim();
        if (!value) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
    }
    function showError(input, message) {
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        let msgEl = input.parentElement.querySelector('.error-msg');
        if (!msgEl) {
            msgEl = document.createElement('p');
            msgEl.className = 'error-msg';
            input.parentElement.appendChild(msgEl);
        }
        msgEl.textContent = message;
    }
    function clearErrors() {
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
            el.removeAttribute('aria-invalid');
        });
        form.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
    }

    // Real-time clearing
    form.querySelectorAll('input, textarea').forEach(el => {
        el.addEventListener('input', () => {
            if (el.classList.contains('is-invalid')) {
                // Re-validate just this field
                let valid = true;
                if (el.id === 'email') valid = validateEmail(el.value);
                else valid = !!el.value.trim();
                if (valid) {
                    el.classList.remove('is-invalid');
                    el.removeAttribute('aria-invalid');
                    const msgEl = el.parentElement.querySelector('.error-msg');
                    if (msgEl) msgEl.textContent = '';
                }
            }
        });
    });
});