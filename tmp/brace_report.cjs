const fs = require('fs');
const s = fs.readFileSync('src/App.jsx','utf8');
const startLine = 117, endLine = 213;
const lines = s.split('\n');
let count = 0;
for (let i = startLine-1; i < endLine; i++) {
  const line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') count++;
    if (line[j] === '}') count--;
  }
  console.log((i+1).toString().padStart(4), 'count=', count, ' | ', line);
}
console.log('Final count between lines', startLine, 'and', endLine, '=', count);
