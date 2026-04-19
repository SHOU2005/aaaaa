import fs from 'fs';

let content = fs.readFileSync('src/data/seed.ts', 'utf-8');

// Remove notificationPrefs from Worker
content = content.replace(/\s*notificationPrefs:.*?,/g, '');

// Add missing fields to Job
content = content.replace(/category: 'skill',(?:\s*\n)/g, "category: 'skill', employerId: 'emp_00X', city: 'Gurgaon', filled: 0,\n");

// Add missing fields to Communities. Only match the ones inside Communities array, which end with `avatar: '...',`
// Wait, `avatar: '...',` can also be present inside `Captain`. But Captain isn't in seed.ts except for maybe the user variable.
// I'll be more specific: match `memberIds: \[.*?\],` and replace it.
content = content.replace(/\s*memberIds: \[(.*?)\](?:,)\n/g, (match, p1) => {
  return `\n    memberIds: [${p1}],\n    tags: ['active'],\n`;
});

// Fix last jobRef missing id and captainMobile
content = content.replace(/jobRef: \{ role: 'Cook',/g, "jobRef: { id: 'job_xyz', captainMobile: '9999999999', role: 'Cook',");

fs.writeFileSync('src/data/seed.ts', content);
console.log('Done fixing seed.ts');
