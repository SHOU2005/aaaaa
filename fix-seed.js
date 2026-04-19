const fs = require('fs');

let content = fs.readFileSync('src/data/seed.ts', 'utf-8');

// Fix Worker savedJobs -> photoUrl: '', savedJobs
// Actually savedJobs is missing from Worker type. Let's just remove savedJobs from WORKERS.
content = content.replace(/savedJobs: \[.*?\],?/g, '');

// Fix Job properties. Add employerId: 'emp_001', city: 'Gurgaon', filled: 0
content = content.replace(/active: true,\s*category: '.*?',?/g, match => {
  return match + " employerId: 'emp_00X', city: 'Gurgaon', filled: 0,";
});

// Community missing tags
content = content.replace(/memberIds: \[.*?\],/g, match => {
  return match + "\n    tags: ['active'],";
});

// Community missing employerId ... wait, community has employer? Employer is optional. But it was complaining about employer vs employerId.
// Let's replace "employer:" with "employer:" wait, the type says "employer?: string". But error said:
// Object literal may only specify known properties, but 'employerId' does not exist in type 'Community'.
content = content.replace(/employerId: 'emp_00X',/g, ''); // Remove employerId from Community where we accidentally added it.
// Actually we only added employerId to community via my bad sed. So let's restore Community categories properly.

// Let's just reset seed.ts to the original content but typed correctly. I will write a script to fix the EXACT errors from the compiler.

fs.writeFileSync('src/data/seed.ts', content);
