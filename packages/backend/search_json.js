const fs = require('fs');

function normalizeVietnamese(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

const searchTerm = process.argv[2] || 'cong than';
const normalized = normalizeVietnamese(searchTerm);

console.log('Searching in all_skills.json');
console.log('Search term: "' + searchTerm + '"');
console.log('Normalized: "' + normalized + '"\n');

const skills = JSON.parse(fs.readFileSync('/Users/ducle/codes/tqc/data/skills/all_skills.json', 'utf8'));

const matches = skills.filter(s => {
  const skillNormalized = normalizeVietnamese(s.name.vi);
  return skillNormalized.includes(normalized) || normalized.includes(skillNormalized);
});

console.log('Matching skills in JSON:');
matches.forEach(s => {
  console.log('  ' + s.name.vi + ' [' + normalizeVietnamese(s.name.vi) + '] - ' + s.name.cn);
});
