/*
 * Portfolio settings. No build step: edit and commit.
 *
 * email: where the contact form sends people. The form opens the visitor's own
 *   email app with the message filled in (mailto). This works on GitHub Pages
 *   with no backend.
 *
 * formEndpoint: optional. Paste a Formspree endpoint (https://formspree.io/f/xxxx)
 *   or any service that accepts a POST with "Accept: application/json" and
 *   returns 2xx on success. When set, the form submits directly and shows a
 *   success message only after the service confirms receipt. When empty, the
 *   mailto method above is used. A fake "sent" message is never shown.
 */
window.PORTFOLIO_CONFIG = {
  email: "bernardlusale20@gmail.com",
  formEndpoint: ""
};
