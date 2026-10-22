(function () {
  'use strict';

  function ready() {
    initNavigation();
    initQuoteForm();
  }

  function initNavigation() {
    const toggle = document.getElementById('nav-toggle');
    const navigation = document.getElementById('primary-nav');
    if (!toggle || !navigation) return;

    function setOpen(open, returnFocus) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      navigation.classList.toggle('is-open', open);
      document.body.classList.toggle('nav-open', open);
      if (returnFocus) toggle.focus();
    }

    function isOpen() {
      return toggle.getAttribute('aria-expanded') === 'true';
    }

    toggle.setAttribute('aria-controls', navigation.id);
    setOpen(false);

    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    navigation.addEventListener('click', function (event) {
      if (event.target instanceof Element && event.target.closest('a[href]')) {
        setOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false, true);
      }
    });

    document.addEventListener('pointerdown', function (event) {
      if (isOpen() && !navigation.contains(event.target) && !toggle.contains(event.target)) {
        setOpen(false);
      }
    });

    window.addEventListener('resize', function () {
      if (isOpen() && window.getComputedStyle(toggle).display === 'none') {
        setOpen(false);
      }
    });

    // Anchor links retain native browser behavior; no scripted scrolling or motion.
  }

  function initQuoteForm() {
    const form = document.getElementById('quote-form');
    if (!form) return;

    const status = document.getElementById('form-status');
    const draft = document.getElementById('quote-draft');
    const summary = document.getElementById('quote-summary');
    const copyButton = document.getElementById('copy-quote');
    const downloadButton = document.getElementById('download-quote');
    const setupNote = document.getElementById('quote-setup-note');
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    const fieldNames = ['pickup', 'destination', 'details', 'vehicle', 'name', 'contact'];
    const config = window.SHAREDTRUCKS_CONFIG || {};
    const route = getRoute(config);
    let currentDraft = '';
    let submitting = false;

    const submitLabels = {
      endpoint: 'Request a quote',
      email: 'Continue by email',
      whatsapp: 'Continue in WhatsApp',
      draft: 'Prepare enquiry'
    };

    function setButtonLabel(text) {
      if (!submitButton) return;
      if (submitButton instanceof HTMLInputElement) {
        submitButton.value = text;
      } else {
        const label = submitButton.querySelector('#quote-submit-label, [data-submit-label]');
        (label || submitButton).textContent = text;
      }
    }

    function setStatus(message, state) {
      if (!status) return;
      status.textContent = message;
      status.dataset.state = state || 'info';
    }

    function showDraft(text) {
      currentDraft = text;
      if (summary) {
        if ('value' in summary) summary.value = text;
        else summary.textContent = text;
      }
      if (draft) draft.hidden = false;
    }

    function clearDraft() {
      currentDraft = '';
      if (summary) {
        if ('value' in summary) summary.value = '';
        else summary.textContent = '';
      }
      if (draft) draft.hidden = true;
    }

    if (status) {
      status.setAttribute('role', 'status');
      status.setAttribute('aria-live', 'polite');
      status.setAttribute('aria-atomic', 'true');
    }
    if (summary && 'readOnly' in summary) summary.readOnly = true;
    if (setupNote) {
      setupNote.hidden = route.type !== 'draft';
      if (route.type === 'draft') {
        setupNote.textContent = 'This form prepares an enquiry for you to copy or download. It does not send your details.';
      }
    }
    clearDraft();
    setButtonLabel(submitLabels[route.type]);

    function detailsChanged(event) {
      const field = event.target;
      if (field && typeof field.setCustomValidity === 'function') {
        field.setCustomValidity('');
      }
      if (submitting) return;
      if (currentDraft) {
        clearDraft();
        setStatus('Details changed. Prepare your enquiry again to update the draft.');
      } else if (status && status.dataset.state === 'success') {
        setStatus('');
      }
    }

    form.addEventListener('input', detailsChanged);
    form.addEventListener('change', detailsChanged);

    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (submitting) return;

      const data = {};
      fieldNames.forEach(function (name) {
        const field = form.elements.namedItem(name);
        const value = field && 'value' in field ? String(field.value).trim() : '';
        data[name] = value;
        if (field && 'value' in field) field.value = value;
        if (field && typeof field.setCustomValidity === 'function') field.setCustomValidity('');
      });

      const contactField = form.elements.namedItem('contact');
      if (data.contact && !isEmail(data.contact) && !isPhone(data.contact)) {
        if (contactField && typeof contactField.setCustomValidity === 'function') {
          contactField.setCustomValidity('Enter a phone number or email address so we can contact you.');
        }
      }

      if (!form.checkValidity()) {
        form.reportValidity();
        setStatus('Please check the highlighted fields.', 'error');
        return;
      }

      const vehicleField = form.elements.namedItem('vehicle');
      if (vehicleField instanceof HTMLSelectElement) {
        const selected = vehicleField.selectedOptions[0];
        data.vehicle = selected ? selected.textContent.trim() : data.vehicle;
      }
      if (!data.vehicle) data.vehicle = 'Please recommend a suitable vehicle';

      const enquiry = makeEnquiry(data);

      if (route.type === 'draft') {
        showDraft(enquiry);
        setStatus('Your enquiry is ready below. It has not been sent. Copy or download it to keep or share.');
        return;
      }

      if (route.type === 'email') {
        showDraft(enquiry);
        setStatus('Complete sending in your email app. You can also copy or download the enquiry below.');
        const subject = 'Shipment enquiry: ' + data.pickup + ' to ' + data.destination;
        window.location.href = 'mailto:' + route.destination
          + '?subject=' + encodeURIComponent(subject)
          + '&body=' + encodeURIComponent(enquiry);
        return;
      }

      if (route.type === 'whatsapp') {
        showDraft(enquiry);
        setStatus('Continue in WhatsApp to review and send your enquiry. You can also copy the draft below.');
        window.open('https://wa.me/' + route.destination + '?text=' + encodeURIComponent(enquiry), '_blank', 'noopener,noreferrer');
        return;
      }

      submitting = true;
      if (submitButton) submitButton.disabled = true;
      form.setAttribute('aria-busy', 'true');
      setButtonLabel('Sending…');
      setStatus('Sending your enquiry…', 'pending');
      const controller = new AbortController();
      const timeout = window.setTimeout(function () { controller.abort(); }, 20000);

      try {
        const response = await fetch(route.destination, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          credentials: 'omit',
          body: JSON.stringify(data),
          signal: controller.signal
        });
        if (!response.ok) throw new Error('Enquiry not confirmed');
        clearDraft();
        setStatus('Your enquiry has been sent. Thank you.', 'success');
      } catch (error) {
        showDraft(enquiry);
        setStatus('We couldn’t confirm that your enquiry was received. You can try again, or copy or download the draft below.', 'error');
      } finally {
        window.clearTimeout(timeout);
        submitting = false;
        if (submitButton) submitButton.disabled = false;
        form.setAttribute('aria-busy', 'false');
        setButtonLabel(submitLabels[route.type]);
      }
    });

    if (copyButton) {
      copyButton.addEventListener('click', async function (event) {
        event.preventDefault();
        if (!currentDraft) {
          setStatus('Prepare your enquiry first.');
          return;
        }
        let copied = false;
        try {
          if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(currentDraft);
            copied = true;
          }
        } catch (error) {
          // A selectable draft remains available when clipboard access is blocked.
        }
        if (!copied && summary && typeof summary.select === 'function') {
          summary.focus();
          summary.select();
          try { copied = document.execCommand('copy'); } catch (error) { copied = false; }
        }
        setStatus(copied
          ? 'Enquiry copied. You can paste it into a message.'
          : 'Select and copy the enquiry text below, or download it as a file.');
      });
    }

    if (downloadButton) {
      downloadButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (!currentDraft) {
          setStatus('Prepare your enquiry first.');
          return;
        }
        const file = new Blob(['\uFEFF', currentDraft, '\n'], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'sharedtrucks-enquiry.txt';
        link.hidden = true;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        setStatus('Your enquiry file is ready to save.');
      });
    }

    // HTML keeps this disabled until the handler is ready, including when scripts fail.
    if (submitButton) submitButton.disabled = false;
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isPhone(value) {
    return /^\+?[\d\s().-]+$/.test(value)
      && value.replace(/\D/g, '').length >= 7
      && value.replace(/\D/g, '').length <= 15;
  }

  function getRoute(config) {
    const endpoint = typeof config.formEndpoint === 'string' ? config.formEndpoint.trim() : '';
    if (endpoint) {
      try {
        const url = new URL(endpoint, window.location.href);
        if (url.protocol === 'https:' || url.protocol === 'http:') {
          return { type: 'endpoint', destination: url.href };
        }
      } catch (error) {
        // An invalid destination is never used to submit personal details.
      }
    }
    const email = typeof config.businessEmail === 'string' ? config.businessEmail.trim() : '';
    if (isEmail(email) && !/[?&#,;]/.test(email)) {
      return { type: 'email', destination: email };
    }
    const rawPhone = typeof config.whatsappNumber === 'string' ? config.whatsappNumber.trim() : '';
    if (isPhone(rawPhone)) {
      return { type: 'whatsapp', destination: rawPhone.replace(/\D/g, '') };
    }
    return { type: 'draft', destination: '' };
  }

  function makeEnquiry(data) {
    return [
      'SharedTrucks Logistics — shipment enquiry',
      '',
      'Name: ' + data.name,
      'Contact: ' + data.contact,
      'Pickup: ' + data.pickup,
      'Destination: ' + data.destination,
      'Vehicle: ' + data.vehicle,
      '',
      'Shipment details:',
      data.details
    ].join('\n');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ready, { once: true });
  } else {
    ready();
  }
}());
