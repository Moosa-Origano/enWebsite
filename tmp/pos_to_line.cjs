const fs = require('fs');
const s = fs.readFileSync('src/App.jsx','utf8');
function posToLineCol(pos){
  const lines = s.slice(0,pos).split('\n');
  const line = lines.length;
  const col = lines[lines.length-1].length + 1;
  return {line, col};
}
console.log('Index 8894 =>', posToLineCol(8894));
console.log('Index 4676 =>', posToLineCol(4676));
