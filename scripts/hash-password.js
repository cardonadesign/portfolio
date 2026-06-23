const { createHash } = require('crypto');

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- "your-password"');
  process.exit(1);
}

const hash = createHash('sha256').update(password, 'utf8').digest('hex');
console.log(hash);
console.log('\nUse in config/project-access.js:');
console.log(`{ locked: true, passwordHash: '${hash}' }`);
