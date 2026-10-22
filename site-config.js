/*
 * The business email opens the visitor's email app for review and sending.
 * Optional destinations can be configured below; leave all three blank for draft-only mode.
 * When several are set, the order is: form endpoint, email, then WhatsApp.
 * Do not put passwords, API keys, or other secrets in this public file.
 */
window.SHAREDTRUCKS_CONFIG = {
  businessEmail: 'sharedtrucks.cargo@gmail.com',
  // Use the international number with country code, e.g. digits only.
  whatsappNumber: '',
  // An HTTPS address that accepts a JSON POST containing the form fields.
  formEndpoint: ''
};
