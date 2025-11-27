// Music-related JS: audio player (tracks only)

// =========================
// Data loading (tracks only)
// =========================
let tracks = [];

async function loadMusicData() {
    try {
        const resp = await fetch('data/music.json', { cache: 'no-cache' });
        if (resp.ok) {
            const json = await resp.json();
            if (Array.isArray(json.tracks)) {
                tracks = json.tracks.map(t => ({ ...t, duration: null }));
            }
        }
    } catch { }

    if (!tracks.length) {
        // Fallback: default tracks
        tracks = [
            { title: 'Los Mareados', artist: 'Ana Fonell', details: 'mit Quique Sinesi (Gitarre) • 2025', year: 2025, src: 'assets/audio/los_mareados.mp3', cover: 'assets/img/ana_shoes.jpg', duration: null },
            { title: 'Caserón de Tejas', artist: 'Ana Fonell', details: 'mit Quique Sinesi (Gitarre) • 2025', year: 2025, src: 'assets/audio/caseron_de_tejas.mp3', cover: 'assets/img/ana_shoes.jpg', duration: null },
            { title: 'Negra Maria', artist: 'Ana Fonell', details: 'mit Pablo Woizinski (Piano) und César Nigro (Gitarre) • 2006', year: 2006, src: 'assets/audio/negra_maria.mp3', cover: 'assets/img/ana_shoes.jpg', duration: null },
            { title: 'Nostalgias', artist: 'Ana Fonell', details: 'mit Quique Sinesi (Gitarre) • 2004', year: 2004, src: 'assets/audio/nostalgias_live.mp3', cover: 'assets/img/ana_shoes.jpg', duration: null },
            { title: 'Che Bandoneón', artist: 'Ana Fonell', details: 'mit Fernando Maguna (Piano) und Diego Trosman (Gitarre) • 2002', year: 2002, src: 'assets/audio/che_bandoneon_live.mp3', cover: 'assets/img/ana_shoes.jpg', duration: null },
            { title: 'Vamos Nina', artist: 'Ana Fonell', details: 'mit Corinna Söller (Klavier) und Katja Kulesza (Violine) • 2002', year: 2002, src: 'assets/audio/vamos_nina.mp3', cover: 'assets/img/ana_shoes.jpg', duration: null },
            { title: 'Chiquilín de Bachín', artist: 'Ana Fonell', details: 'mit Gustavo Battistessa (Bandoneon) und Marcelo Iglesias (Piano) • 1998', year: 1998, src: 'assets/audio/chiquilín_de_bachin.mp3', cover: 'assets/img/ana_shoes.jpg', duration: null },
            { title: 'El Choclo', artist: 'Ana Fonell', details: 'mit Coco Nelegatti (Gitarre) • 1998', year: 1998, src: 'assets/audio/el_choclo.mp3', cover: 'assets/img/ana_shoes.jpg', duration: null }
        ];
    }

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

// Kick off music data loading (tracks only)
loadMusicData();
