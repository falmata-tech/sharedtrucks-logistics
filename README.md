# SharedTrucks Logistics

A responsive, single-page website for shared truckload freight across Ethiopia. Built from the approved navy, slate and white mockup using plain HTML, CSS and JavaScript.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page content, navigation and quote form |
| `styles.css` | Brand styling and responsive layouts |
| `script.js` | Mobile navigation, form validation and enquiry delivery/draft logic |
| `site-config.js` | Verified business destination for quote enquiries |
| `assets/` | Vector logo, favicon, WebP imagery and self-hosted Inter font |
| `404.html` | Missing-page screen |
| `.nojekyll` | Serve the static files directly on GitHub Pages |

No framework, package installation or build step is required. Open `index.html` to view the site, or serve this folder with any static web server. The files use relative paths so the website works at a GitHub Pages project URL and, later, a custom domain.

## Quote form — email enquiries

The quote form is configured for **sharedtrucks.cargo@gmail.com**. After the visitor completes the required fields, **Continue by email** opens a completed enquiry in their email app. The visitor reviews the message and presses **Send** there; the website does not send an email automatically. A copyable/downloadable draft remains available if an email app is unavailable. The quote section also includes a direct email link.

To change the business address or add another delivery option, edit `site-config.js`. The current settings are:

```js
window.SHAREDTRUCKS_CONFIG = {
  businessEmail: 'sharedtrucks.cargo@gmail.com',
  whatsappNumber: '',
  formEndpoint: ''
};
```

- **Business email:** opens the visitor’s email app with a completed enquiry. The visitor reviews it and sends it from their own email app.
- **WhatsApp:** use the business number with its international country code. Opens a message draft for the visitor to review and send.
- **Form endpoint:** an HTTPS service that accepts JSON fields `pickup`, `destination`, `details`, `vehicle`, `name`, and `contact`. The service must accept requests from the website origin. A success message appears only after an HTTP success response; errors preserve the visitor’s draft.

Priority when several are provided: form endpoint, email, then WhatsApp. Keep unused values empty. If every destination is blank or invalid, the form offers **Prepare enquiry** and makes clear that the details have not been sent. Do not put credentials or private API keys in this public configuration file. The website keeps entered details only in the current page; it does not store them in browser storage or send analytics.

GitHub Pages serves static content. The current email-app option does not require a server. To receive submissions directly from the website, configure a compatible HTTPS form endpoint; that service should perform its own validation and spam protection.

## GitHub Pages

1. Push the contents of this folder to the repository’s `main` branch.
2. Open **Settings → Pages**.
3. Choose **Deploy from a branch**, select **main** and **/(root)**, then save.
4. Wait for the Pages deployment to complete. GitHub shows the published address in the Pages settings.

Reference: [GitHub’s publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## Custom domain

The domain is intentionally not configured yet because the owner will provide it later. After confirming the exact domain, configure it in the repository’s Pages settings and add the matching DNS records in GoDaddy. Preserve existing mail records. Follow GitHub’s current guidance, verify DNS, and enable HTTPS when the certificate is ready.

Reference: [GitHub’s custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Brand and assets

- Primary navy: `#14293D`; slate: `#42647B`; white and pale cool-gray surfaces.
- Editable vector logo files are in `assets/`.
- Freight imagery was generated for this design and represents the service; it is not a photograph of an owned SharedTrucks fleet.
- Inter is self-hosted under the SIL Open Font License; the license is included in `assets/INTER-LICENSE.txt`.
- Office location appears once in the visible page footer.

The `.openai/` and `dist/` folders, if present in the working copy, are local preview files. They are not part of the published source package.
