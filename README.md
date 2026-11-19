# Bernard Lusale — portfolio

The live site is at https://dev-lusale.github.io/bernardlusale/. It's a static site in plain HTML, CSS and JavaScript, with no build step and no runtime dependencies. GitHub Pages serves it straight from the repository root.

## Files

```
index.html             The portfolio (single page)
404.html               Not-found page (uses absolute /bernardlusale/ paths)
robots.txt, sitemap.xml, .nojekyll
favicon.ico, favicon-32.png, apple-touch-icon.png
assets/css/main.css    Design system and layout
assets/js/config.js    Contact settings — edit this
assets/js/main.js      Intro, navigation, scroll effects, project filter and dialog, form
assets/fonts/          Inter, Playfair Display (italic), JetBrains Mono (self-hosted, OFL)
assets/img/            WebP photos, logo sizes, Open Graph image
images/                Original photos and logos (bernard-lusale-logo-original.png is the untouched brand mark)
```

`bernard-portfolio/` is an unused Vite starter, and `node_modules/` with `package.json` is from earlier experiments. The live site uses neither.

## Contact form

By default, the form opens the visitor's own email app with the message filled in, addressed to the email set in `assets/js/config.js`. It never claims a message was sent.

To receive messages directly instead, create a Formspree form and paste its endpoint into `formEndpoint` in `assets/js/config.js`. The site then shows "Message sent" only after Formspree confirms it has received the message.

## Editing projects

Each project card is in `index.html`. The text in its case-study dialog comes from the JSON block `<script id="project-data">` just below the cards, keyed by the card's `data-project` value.

## Deploying

Push to `main`. GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root) publishes the site within a minute or two. If the repository name or domain ever changes, update the canonical URL, the Open Graph URLs, `sitemap.xml`, `robots.txt` and the `/bernardlusale/` paths in `404.html`.
