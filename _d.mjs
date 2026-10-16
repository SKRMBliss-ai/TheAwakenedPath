import fs from 'node:fs';
const edit = (f, pairs) => {
  let s = fs.readFileSync(f, 'utf8'); const crlf = s.includes('\r\n'); s = s.replace(/\r\n/g, '\n');
  for (const [a, b] of pairs) { if (!s.includes(a)) throw new Error(f + ' missing: ' + a.slice(0, 60)); s = s.replace(a, b); }
  fs.writeFileSync(f, crlf ? s.replace(/\n/g, '\r\n') : s);
};
edit('vite.config.ts', [[
`      if (/^\/twinsouls(\/|$|\?)/.test(url)) {
        res.statusCode = 302;
        res.setHeader('Location', 'http://localhost:5174/');`,
`      // /twinsouls itself is a page of this app now; only its sub-paths
      // (/twinsouls/shrutikhungar, /twinsouls/simkatyal) are the portfolio.
      const sub = url.match(/^\/twinsouls\/([^?#]+)/);
      if (sub) {
        res.statusCode = 302;
        res.setHeader('Location', 'http://localhost:5174/' + sub[1]);`]]);
edit('C:/Github/Bliss/ShrutiPortfolio/src/main.tsx', [[
`    const base = isTwinsouls ? '/twinsouls' : '';
`,
`    const base = isTwinsouls ? '/twinsouls' : '';
    // The coin / landing view is no longer part of this app: /twinsouls is the
    // studio's founders page, so going "back" is a real page load.
    if (target === 'coin' && isTwinsouls) {
      window.location.assign(base);
      return;
    }
`]]);
