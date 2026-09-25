const bcrypt = require('bcryptjs');

const password = 'admin123'; // this will be your login password
bcrypt.hash(password, 10).then(hash => {
  console.log('Hashed password:', hash);
});