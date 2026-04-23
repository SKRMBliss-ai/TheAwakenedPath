const fs = require('fs');
let c = fs.readFileSync('functions/index.js', 'utf8');
c = c.replace(/"worry-small-2": 14.99\r?\n};/g, '"worry-small-2": 14.99,\n    "the-watcher-identity": 14.99,\n    "tired-of-searching-guru": 14.99\n};');
c = c.replace(/"worry-small-2": 899\r?\n};/g, '"worry-small-2": 899,\n    "the-watcher-identity": 899,\n    "tired-of-searching-guru": 899\n};');
fs.writeFileSync('functions/index.js', c);
console.log('Done');
