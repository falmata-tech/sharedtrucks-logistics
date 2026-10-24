# SharedTrucks Logistics

A responsive, single-page website for shared truckload freight across Ethiopia. Built with plain HTML, CSS and JavaScript. The refined design preserves the approved navy, slate and white identity, with original vector freight illustrations and a lighter Inter type system.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page content, navigation and quote form |
| `styles.css` | Brand styling and responsive layouts |
| `script.js` | Mobile navigation, validation and direct enquiry submission |
| `site-config.js` | Public Web3Forms access key for the business enquiry form |
| `assets/` | Original freight illustrations, shared-cargo logo and browser/mobile icons, and self-hosted Inter font |
| `404.html` | Missing-page screen |
| `.nojekyll` | Serve the static files directly on GitHub Pages |
| `CNAME` | Configured GitHub Pages custom domain: `sharedtrucks.com` |

No framework, package installation or build step is required. Open `index.html` to view the site, or serve this folder with any static web server. The files use relative paths so the website works at a GitHub Pages project URL or a custom domain.

## Quote form — direct website submissions

Visitors use **Send enquiry** to submit from the page. JavaScript sends the form fields to Web3Forms over HTTPS; the service delivers accepted submissions to the mailbox associated with the form’s access key. The owner-provided public key is configured in `site-config.js` for enquiries intended for **sharedtrucks.cargo@gmail.com**. Visitors remain on the website throughout submission. The contact address is displayed as text; the form does not open an email application.

### Maintain or replace the receiving form

1. Sign in or create a free [Web3Forms account](https://web3forms.com/), verify the business email, and create a form whose recipient is **sharedtrucks.cargo@gmail.com**.
2. Copy that form’s public access key into `site-config.js`:

```js
window.SHAREDTRUCKS_CONFIG = {
  web3formsAccessKey: ''
};
```

3. Publish the updated configuration with the site. A blank key keeps the submit button disabled and displays a short temporary-unavailability message.
4. Send one clearly labelled test enquiry from the published HTTPS site. Check the page confirmation and the receiving inbox, including spam, and confirm that the shipment fields and contact details arrive. Test a valid email contact for Reply-To and a phone-only contact before treating delivery as verified.

Check [Web3Forms pricing](https://web3forms.com/#pricing) for current submission limits when choosing or changing the plan. The access key is a public alias for the receiving form, designed for browser use. Do not place passwords or private credentials in this file.

### Submission behavior

- The endpoint is fixed to `https://api.web3forms.com/submit`. The payload includes `name`, `contact`, `pickup`, `destination`, `details`, `vehicle`, the form access key, the subject **SharedTrucks — new shipment enquiry**, and the sender label **SharedTrucks Logistics**.
- When the contact value is a valid email address, it is also supplied as `email` and `replyto`. A phone-only contact remains in `contact`, with those email-specific fields omitted.
- The hidden `botcheck` checkbox provides the service’s honeypot field. No captcha-disabling or automatic-response options are added.
- While sending, the form controls are disabled to prevent duplicate requests or edits to an enquiry in flight. Network, HTTP, malformed-response, and service failures retain entered details and show an accessible error. The form resets only after an HTTP success response and an explicit JSON `success: true`, with no activation or error indication.
- JavaScript is required for this form. The website does not save enquiries in browser storage or add analytics. Submitted details are processed by Web3Forms under the owner’s service settings.

References: [Web3Forms installation and form options](https://docs.web3forms.com/getting-started/installation) and [HTML and JavaScript submission](https://docs.web3forms.com/how-to-guides/html-and-javascript).

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

GitHub provisions the TLS certificate automatically after DNS validation. HTTPS is enabled for this site. Keep **Enforce HTTPS** selected in the repository’s **Settings → Pages**.

References: [GitHub’s custom-domain documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) and [HTTPS setup](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https).

## Brand and assets

- Primary navy: `#14293D`; slate: `#42647B`; white and pale cool-gray surfaces.
- The SharedTrucks mark represents three distinct loads on one shared truck. The wordmark uses outlined Inter at weight 560 to match the site and display consistently without depending on system fonts. Primary vector files are `assets/logo.svg` and `assets/logo-mark.svg`; a transparent high-resolution export is `assets/logo.png`.
- The page uses original SVG freight illustrations: a shared-load cutaway truck and four consistent vehicle profiles. They illustrate transport options, not an owned SharedTrucks fleet. The earlier WebP assets are retained in the repository but are no longer loaded by the page.
- Browser icons use the white shared-cargo mark on a navy tile for contrast on light and dark tab bars. `assets/favicon-shared-cargo.svg` is the current scalable favicon; `assets/favicon.svg` is also updated for existing references. `favicon.ico` contains 16, 32 and 48px entries, with matching PNG exports in `assets/`.
- `apple-touch-icon.png` is an opaque 180px icon. `site.webmanifest` supplies 192px and 512px icons, plus a separately padded maskable version. The manifest keeps ordinary browser display; it does not add an offline application or service worker. Icon links are present on the homepage and the 404 page.
- The new icon filename and versioned logo/raster links avoid reusing the previous asset URLs. Existing saved bookmarks may use their own refresh schedule.
- Office address: Jigjiga, Somali Region, Ethiopia.
- Inter is self-hosted under the SIL Open Font License; the license is included in `assets/INTER-LICENSE.txt`.
- Office location appears once in the visible page footer.

The `.openai/` and `dist/` folders, if present in the working copy, are local preview files. They are not part of the published source package.
