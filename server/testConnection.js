const mongoose = require('mongoose');

console.log('Attempting to connect...');
mongoose.connect('mongodb://localhost:27017/lld_practice_platform_test')
  .then(() => {
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Connection failed:', err.message);
    process.exit(1);
  });