import fs from 'node:fs';
const edit = (f, pairs) => {
  let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
  for (const [a, b, all] of pairs) { if (!s.includes(a)) throw new Error(f + ' missing: ' + a.slice(0, 50)); s = all ? s.split(a).join(b) : s.replace(a, b); }
  fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
};
edit('src/main.tsx', [
 ["import AboutUs from './features/landing/AboutUs'\n", ''],
 [`} else if (isAboutUsRoute) {
  root.render(
    <ErrorBoundary featureName="AboutUs">
      <AboutUs />
      <SiteWidgets />
    </ErrorBoundary>,
  );
`, `} else if (isAboutUsRoute) {
  // /about-us was retired in favour of the Twin Souls page. Hosting 301s it in
  // production; this covers dev and any cached shell.
  window.location.replace('/twinsouls');
`],
]);
edit('src/components/site/SiteChrome.tsx', [["{ label: 'About us', href: '/about-us' }", "{ label: 'About us', href: '/twinsouls' }"]]);
edit('src/features/landing/SoulfulHome.tsx', [["href: '/about-us'", "href: '/twinsouls'", true]]);
edit('src/features/landing/SimKatyal.tsx', [["href: '/about-us'", "href: '/twinsouls'", true], ['learn about the people behind the studio on the <a href="/twinsouls" style={{ color: accent }}>About Us</a> page', 'meet both founders on the <a href="/twinsouls" style={{ color: accent }}>Twin Souls</a> page']]);
edit('firebase.json', [['    "redirects": [\n', `    "redirects": [
      {
        "source": "/@(about-us|aboutus)",
        "destination": "/twinsouls",
        "type": 301
      },
`]]);
