const fs = require('fs');
let code = fs.readFileSync('src/data/seed.ts', 'utf-8');

code = code.replace(/\s*joinedAt: '.*?',/g, '');
code = code.replace(/employerId: 'emp_00X',\s*city: 'Gurgaon',\s*filled: 0,/g, '');

fs.writeFileSync('src/data/seed.ts', code);
