(function(){
  const qs = new URLSearchParams(window.location.search);
  const lang = (qs.get('lang') || document.documentElement.lang || 'en').toLowerCase();
  const supported = ['en','de','es'];
  const chosen = supported.includes(lang) ? lang : 'en';

  const map = {
    title: document.querySelector('[data-i18n="privacy.title"]'),
    intro: document.querySelector('[data-i18n="privacy.intro"]'),
    contactTitle: document.querySelector('[data-i18n="privacy.contact.title"]'),
    contactText: document.querySelector('[data-i18n="privacy.contact.text"]'),
    rightsTitle: document.querySelector('[data-i18n="privacy.rights.title"]'),
    rightsText: document.querySelector('[data-i18n="privacy.rights.text"]'),
    updated: document.querySelector('[data-i18n="privacy.updated"]')
  };

  function setText(el, text){ if(el) el.textContent = text; }

  function apply(data){
    setText(map.title, data.title);
    setText(map.intro, data.intro);
    setText(map.contactTitle, data.contact && data.contact.title);
    setText(map.contactText, data.contact && data.contact.text);
    setText(map.rightsTitle, data.rights && data.rights.title);
    setText(map.rightsText, data.rights && data.rights.text);
    setText(map.updated, data.updated);
    // Also set document title for the tab
    const titleTag = document.querySelector('head title');
    if(titleTag) titleTag.textContent = data.title + ' • Ana Fonell';
  }

  function fetchJson(loc){
    return fetch(loc, { cache: 'no-cache' }).then(r=>{
      if(!r.ok) throw new Error('HTTP '+r.status);
      return r.json();
    });
  }

  const base = 'data/privacy.' + chosen + '.json';
  fetchJson(base)
    .then(apply)
    .catch(()=>{
      if(chosen !== 'en'){
        fetchJson('data/privacy.en.json').then(apply).catch(()=>{
          apply({
            title: 'Privacy Policy',
            intro: 'We value your privacy. This page explains what personal data we collect when you contact us and how we use and protect it.',
            contact: { title: 'Contact', text: 'If you contact us via the form or by email, we process your details to respond to your inquiry. Your data will not be shared with third parties without your consent.' },
            rights: { title: 'Your rights', text: 'You have the right to access, rectify, erase, and restrict the processing of your personal data, as well as the right to data portability, where applicable. You can withdraw consent at any time for the future.' },
            updated: 'Last updated: 2025-11-18'
          });
        });
      } else {
        apply({
          title: 'Privacy Policy',
          intro: 'We value your privacy. This page explains what personal data we collect when you contact us and how we use and protect it.',
          contact: { title: 'Contact', text: 'If you contact us via the form or by email, we process your details to respond to your inquiry. Your data will not be shared with third parties without your consent.' },
          rights: { title: 'Your rights', text: 'You have the right to access, rectify, erase, and restrict the processing of your personal data, as well as the right to data portability, where applicable. You can withdraw consent at any time for the future.' },
          updated: 'Last updated: 2025-11-18'
        });
      }
    });
})();