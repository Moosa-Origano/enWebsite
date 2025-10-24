const fs = require('fs');
const path = 'src/App.jsx';
const s = fs.readFileSync(path, 'utf8');
let stack = [];
const pairs = { '{': '}', '(': ')', '[': ']' };
for (let i = 0; i < s.length; i++) {
  const c = s[i];
  if (c === '/' && s[i+1] === '/') { // skip single-line comments
    while (i < s.length && s[i] !== '\n') i++;
    continue;
  }
  if (c === '/' && s[i+1] === '*') { // skip block comments
    i += 2;
    while (i < s.length && !(s[i] === '*' && s[i+1] === '/')) i++;
    i += 1;
    continue;
  }
  if (c in pairs) {
    stack.push({ ch: c, pos: i });
  } else if (c === '}' || c === ')' || c === ']') {
    if (stack.length === 0) {
      console.log('Unmatched closing', c, 'at index', i);
      console.log(s.slice(Math.max(0,i-50), i+50));
      process.exit(0);
    }
    const top = stack.pop();
    if (pairs[top.ch] !== c) {
      console.log('Mismatch at index', i, 'expected', pairs[top.ch], 'got', c);
      console.log('Top was', top, 'context:', s.slice(Math.max(0,i-50), i+50));
      process.exit(0);
    }
  }
}
if (stack.length === 0) {
  console.log('All balanced');
} else {
  const last = stack[stack.length-1];
  console.log('Unclosed', last.ch, 'at index', last.pos);
}
