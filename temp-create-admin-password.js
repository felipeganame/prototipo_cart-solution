const bcryptjs = require('bcryptjs');

const password = 'admin123';
const saltRounds = 10;

bcryptjs.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing password:', err);
    return;
  }
  console.log('Password hash for "admin123":', hash);
  process.exit(0);
});
