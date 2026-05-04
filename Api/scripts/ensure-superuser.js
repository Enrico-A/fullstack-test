/* eslint-disable no-console */
const bcrypt = require('bcryptjs');

const connection = require('../db/connect');

const run = async () => {
  await connection.asPromise();

  const password = await bcrypt.hash('testtest', 10);
  const now = new Date();

  await connection.db.collection('users').updateOne(
    { email: 'test@meblabs.com' },
    {
      $set: {
        email: 'test@meblabs.com',
        name: 'Admin',
        fullname: 'Admin',
        lang: 'IT',
        active: true,
        deleted: false,
        roles: ['superuser'],
        password,
        updatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  );

  console.log('Superuser ensured');
  await connection.close();
};

run().catch(async error => {
  console.error(error);
  await connection.close().catch(() => {});
  process.exit(1);
});
