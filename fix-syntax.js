const fs = require('fs');
let code = fs.readFileSync('src/data/seed.ts', 'utf-8');

// Fix the syntax error from my bad replace snippet
// Ex: photoUrl: '', newJobs: true, community: true },
code = code.replace(/newJobs:\s*(true|false),\s*community:\s*(true|false)\s*\},?/g, '');

fs.writeFileSync('src/data/seed.ts', code);
