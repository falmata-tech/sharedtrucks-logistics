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
| `CNAME` | Configured GitHub Pages custom domain: `sharedtrucks.com` |

No framework, package installation or build step is required. Open `index.html` to view the site, or serve this folder with any static web server. The files use relative paths so the website works at a GitHub Pages project URL or a custom domain.

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

`sharedtrucks.com` is configured in the repository’s GitHub Pages settings, and the root `CNAME` file contains this domain. The website DNS records in GoDaddy are:

| Host | Type | Value |
| --- | --- | --- |
| `@` | `A` | `185.199.108.153` |
| `@` | `A` | `185.199.109.153` |
| `@` | `A` | `185.199.110.153` |
| `@` | `A` | `185.199.111.153` |
| `@` | `AAAA` | `2606:50c0:8000::153` |
| `@` | `AAAA` | `2606:50c0:8001::153` |
| `@` | `AAAA` | `2606:50c0:8002::153` |
| `@` | `AAAA` | `2606:50c0:8003::153` |
| `www` | `CNAME` | `falmata-tech.github.io` |

The original nameservers and existing email records remain unchanged. Preserve them when updating website DNS, and keep the root `CNAME` file in future deployments.

GitHub provisions the TLS certificate automatically after DNS validation. Once the certificate is ready, open the repository’s **Settings → Pages** and select **Enforce HTTPS** if it is not already enabled.

References: [GitHub’s custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) and [HTTPS setup](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

## Brand and assets

- Primary navy: `#14293D`; slate: `#42647B`; white and pale cool-gray surfaces.
- Editable vector logo files are in `assets/`.
- Freight imagery was generated for this design and represents the service; it is not a photograph of an owned SharedTrucks fleet.
- Inter is self-hosted under the SIL Open Font License; the license is included in `assets/INTER-LICENSE.txt`.
- Office location appears once in the visible page footer.

The `.openai/` and `dist/` folders, if present in the working copy, are local preview files. They are not part of the published source package.
