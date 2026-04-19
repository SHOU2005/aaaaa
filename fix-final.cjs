const fs = require('fs');
let code = fs.readFileSync('src/data/seed.ts', 'utf-8');

// Fix Workers manually: 
// we will add avatar: '', documents: { aadhar: true, policeVerification: false, experience: false, photo: true }, isVerified: false, language: 'hi' as any,
code = code.replace(/city: 'Gurgaon',/g, "city: 'Gurgaon', avatar: '', documents: { aadhar: true, policeVerification: false, experience: false, photo: true }, isVerified: false, language: 'hi' as any,");

// Remove employerId: 'emp_00X' ONLY from Communities
// We know Communities start at `export const COMMUNITIES: Community[] = [`
const splitPoints = code.split('export const COMMUNITIES: Community[] = [');
if(splitPoints.length === 2) {
  let [before, after] = splitPoints;
  after = after.replace(/employerId: 'emp_00X',\n.*?/g, ''); 
  // Wait, `employerId: 'emp_00X',` is followed by `city: 'Gurgaon',\n    filled: 0,`! My last script added all 3 to Communities!
  after = after.replace(/employerId: 'emp_00X',\n\s*city: 'Gurgaon',\n\s*filled: 0,/g, '');
  code = before + 'export const COMMUNITIES: Community[] = [' + after;
}

fs.writeFileSync('src/data/seed.ts', code);
