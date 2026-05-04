/* eslint-disable no-console */
const path = require('path');

const connection = require('../db/connect');
const Migration = require('../models/migration');

const migrationsDir = path.resolve(__dirname, '../db/migrations');

const run = async () => {
  await connection.asPromise();

  const migrationState = await Migration.findOne({});
  const lastMigration = migrationState?.migrations?.at(-1);

  if (!lastMigration) {
    console.log('No migrations to rollback');
    await connection.close();
    return;
  }

  const migrationPath = path.join(migrationsDir, lastMigration.title);
  const migration = require(migrationPath);

  if (typeof migration.down !== 'function') {
    throw new Error(`Migration ${lastMigration.title} does not export a down function`);
  }

  console.log(`Rolling back migration: ${lastMigration.title}`);
  await migration.down();

  migrationState.migrations.pop();
  migrationState.lastRun = migrationState.migrations.at(-1)?.title || null;
  await migrationState.save();

  console.log('Migration down completed');
  await connection.close();
};

run().catch(async error => {
  console.error(error);
  await connection.close().catch(() => {});
  process.exit(1);
});
