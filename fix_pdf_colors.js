const fs = require('fs');
const file = 'src/lib/insightsPDF.js';
let content = fs.readFileSync(file, 'utf8');

// Colors replacement
content = content.replace(/#00e5a0/g, '#00e5ff');
content = content.replace(/#0d0d0d/g, '#0a0a0a');
content = content.replace(/#161616/g, '#141414');
content = content.replace(/#242424/g, '#1f1f1f');
content = content.replace(/color:#555/g, 'color:#a3a3a3');
content = content.replace(/color: #555;/g, 'color: #a3a3a3;');
content = content.replace(/color: #444;/g, 'color: #a3a3a3;');

fs.writeFileSync(file, content);
console.log('Colors replaced successfully.');
