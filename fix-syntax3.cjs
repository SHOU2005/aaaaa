const fs = require('fs');
let code = fs.readFileSync('src/data/seed.ts', 'utf-8');

// Worker 'city'
code = code.replace(/\s*sector:/g, "\n    city: 'Gurgaon',\n    sector:");

// Job 'employerId', 'city', 'filled'
code = code.replace(/category: 'skill',/g, "category: 'skill',\n    employerId: 'emp_00X',\n    city: 'Gurgaon',\n    filled: 0,");

fs.writeFileSync('src/data/seed.ts', code);
