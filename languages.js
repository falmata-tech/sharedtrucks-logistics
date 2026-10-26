(function () {
  'use strict';
  const data = document.getElementById('site-copy');
  const messages = data ? JSON.parse(data.textContent) : {};
  const language = document.documentElement.lang || 'en';
  function text(key) { return messages[key] || ''; }

  function bindValidation(form) {
    form.addEventListener('invalid', function (event) {
      const field = event.target;
      if (!field || typeof field.setCustomValidity !== 'function') return;
      // Preserve more specific validation set by the shipment form.
      if (!field.validity.customError) {
        const validity = field.validity;
        const key = validity.valueMissing ? 'validation.required'
          : validity.typeMismatch && field.type === 'email' ? 'validation.email'
          : validity.tooLong ? 'validation.tooLong' : 'validation.invalid';
        field.setCustomValidity(text(key));
      }
      field.setAttribute('aria-invalid', 'true');
    }, true);
    function clearValidation(event) {
      const field = event.target;
      if (field && typeof field.setCustomValidity === 'function') {
        field.setCustomValidity('');
        field.removeAttribute('aria-invalid');
      }
    }
    form.addEventListener('input', clearValidation);
    form.addEventListener('change', clearValidation);
    form.addEventListener('reset', function () {
      Array.from(form.elements).forEach(function (field) {
        if (typeof field.setCustomValidity === 'function') field.setCustomValidity('');
        field.removeAttribute('aria-invalid');
      });
    });
  }
  window.SiteLanguage = Object.freeze({ text: text, bindValidation: bindValidation, language: language });

  const chooser = document.querySelector('[data-language-switcher]');
  if (!chooser) return;
  const summary = chooser.querySelector('summary');
  const links = Array.from(chooser.querySelectorAll('[data-language-link]'));
  function updateLinks() {
    links.forEach(function (link) {
      const target = new URL(link.getAttribute('href'), window.location.href);
      target.hash = window.location.hash;
      link.href = target.href;
    });
  }
  updateLinks();
  window.addEventListener('hashchange', updateLinks);
  chooser.addEventListener('toggle', function () {
    if (!chooser.open) return;
    const menu = document.querySelector('#nav-toggle, #menu-toggle');
    if (menu && menu.getAttribute('aria-expanded') === 'true') menu.click();
  });
  document.addEventListener('pointerdown', function (event) {
    if (chooser.open && !chooser.contains(event.target)) chooser.open = false;
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && chooser.open) {
      chooser.open = false;
      summary.focus();
    }
  });

  // Carry an unfinished enquiry across a language switch, only within this origin.
  // This one-time draft is removed as soon as the destination page reads it.
  const draftKey = 'site-language-form-draft';
  try {
    const saved = sessionStorage.getItem(draftKey);
    sessionStorage.removeItem(draftKey);
    if (saved) {
      const draft = JSON.parse(saved);
      const form = document.getElementById(draft.form);
      if (form && Date.now() - draft.savedAt < 120000) {
        Object.keys(draft.values).forEach(function (name) {
          const field = form.elements.namedItem(name);
          if (field && field.type !== 'hidden' && field.type !== 'checkbox') field.value = draft.values[name];
        });
      }
    }
  } catch (_) { /* Language navigation also works when browser storage is disabled. */ }
  links.forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (link.dataset.languageLink === language) {
        event.preventDefault();
        chooser.open = false;
        summary.focus();
        return;
      }
      const form = document.querySelector('#quote-form, #contact-form');
      if (!form) return;
      const values = {};
      Array.from(form.elements).forEach(function (field) {
        if (field.name && ['text','email','tel','textarea','select-one'].includes(field.type)) values[field.name] = field.value;
      });
      try { sessionStorage.setItem(draftKey, JSON.stringify({ form: form.id, savedAt: Date.now(), values: values })); }
      catch (_) { /* Do not put personal form data in the URL. */ }
    });
  });
}());
