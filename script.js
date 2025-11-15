/*
 Deprecated: This file is no longer used.
 All site logic has been moved to app.js (site/i18n, nav, forms) and music.js (player + albums).
 This no-op shim remains only to avoid 404s if an older HTML references script.js.
*/

(function () {
    // Intentionally empty. See app.js and music.js for actual functionality.
    if (typeof console !== 'undefined' && console.info) {
        console.info('[script.js] Deprecated file loaded. Functionality lives in app.js and music.js.');
    }
})();

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
            const containers = document.querySelectorAll('.lang-switch');
            if (!containers.length) return;

            containers.forEach(container => {
                const btn = container.querySelector('.lang-toggle');
                const menu = container.querySelector('.lang-menu');
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
                        // All buttons are updated by setLang; no need to set here
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
            });
        })();

        // Drawer language inline links (DE/EN/ES)
        (function () {
            const container = document.querySelector('.drawer__langs');
            if (!container) return;

            const setActive = (lang) => {
                container.querySelectorAll('[data-lang]').forEach(a => a.removeAttribute('aria-current'));
                const el = container.querySelector(`[data-lang="${lang}"]`);
                if (el) el.setAttribute('aria-current', 'page');
            };

            // Initialize current language highlight
            try {
                const initial = I18N.getInitialLang();
                if (initial) setActive(initial);
            } catch { }

            container.addEventListener('click', (e) => {
                const a = e.target.closest('[data-lang]');
                if (!a) return;
                e.preventDefault();
                const lang = (a.dataset.lang || a.getAttribute('lang') || a.textContent || '').toLowerCase();
                if (!lang) return;
                I18N.setLang(lang);
                setActive(lang);
            });
        })();

        document.addEventListener("DOMContentLoaded", () => {
            // Apply initial language on load
            const initialLang = I18N.getInitialLang();
            I18N.setLang(initialLang, { updateUrl: !new URLSearchParams(window.location.search).has('lang') });

            // Set footer year (available across pages)
            const yearEl = document.getElementById('year');
            if (yearEl) yearEl.textContent = String(new Date().getFullYear());

            const form = document.getElementById("contactForm");
            const popup = document.getElementById('popup');
            const popupTitle = document.getElementById('popup-title');
            const popupDesc = document.getElementById('popup-desc');
            const popupOk = document.querySelector('.popup__ok');
            const popupCloseEls = document.querySelectorAll('[data-close]');
            let lastFocused = null;

            function openPopup({ title = I18N.t('popup.generic.title', 'Message'), message = '', variant = 'success' } = {}) {
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

            if (form) form.addEventListener("submit", async (e) => {
                e.preventDefault();
                clearErrors();
                const nameInput = form.querySelector('#name');
                const emailInput = form.querySelector('#email');
                const messageInput = form.querySelector('#message');
                const consentInput = form.querySelector('#consent');

                const errors = [];
                if (!nameInput.value.trim()) {
                    errors.push({ el: nameInput, msg: I18N.t('form.error.nameRequired', 'Name is required.') });
                }
                if (!validateEmail(emailInput.value)) {
                    errors.push({ el: emailInput, msg: I18N.t('form.error.emailInvalid', 'Please enter a valid email address.') });
                }
                if (!messageInput.value.trim()) {
                    errors.push({ el: messageInput, msg: I18N.t('form.error.messageRequired', 'Message cannot be empty.') });
                }

                if (consentInput && !consentInput.checked) {
                    errors.push({ el: consentInput, msg: I18N.t('form.error.consentRequired', 'Please check this box to allow us to use your information to respond.') });
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
                    openPopup({ title: I18N.t('popup.networkError.title', 'Network error'), message: I18N.t('popup.networkError.message', 'Could not submit. Check connection and try again.'), variant: 'error' });
                    return;
                }

                if (res.ok) {
                    openPopup({ title: I18N.t('popup.success.title', 'Thank you'), message: I18N.t('popup.success.message', 'Message sent successfully!'), variant: 'success' });
                    form.reset();
                } else {
                    openPopup({ title: I18N.t('popup.error.title', 'Sorry'), message: I18N.t('popup.error.message', 'Something went wrong. Please try again.'), variant: 'error' });
                }
            });

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
                if (!form) return;
                form.querySelectorAll('.is-invalid').forEach(el => {
                    el.classList.remove('is-invalid');
                    el.removeAttribute('aria-invalid');
                });
                form.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
            }

            // Real-time clearing
            if (form) {
                form.querySelectorAll('input, textarea').forEach(el => {
                    el.addEventListener('input', () => {
                        if (el.classList.contains('is-invalid')) {
                            // Re-validate just this field
                            let valid = true;
                            if (el.type === 'checkbox') valid = el.checked;
                            else if (el.id === 'email') valid = validateEmail(el.value);
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
            }
        });
        // Close the accidentally unclosed closeDrawer and IIFE wrappers
    };
})();