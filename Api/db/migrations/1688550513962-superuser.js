/* eslint-disable no-console */
const bcrypt = require('bcryptjs');
const User = require('../../models/user');
const connection = require('../connect');

module.exports.up = async () => {
  await connection.asPromise();
  const password = await bcrypt.hash('testtest', 10);

  const result = await User.updateOne(
    { email: 'test@meblabs.com' },
    {
      $set: {
        name: 'Admin',
        fullname: 'Admin',
        lang: 'IT',
        active: true,
        deleted: false,
        roles: ['superuser'],
        password
      }
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  console.log('Superuser migration result:', JSON.stringify(result));
  return result;
};

module.exports.down = async () => {
  await connection.asPromise();
  return User.deleteOne({ email: 'test@meblabs.com' });
};
