/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const connection = require('../db/connect');
const Migration = require('../models/migration');

const migrationsDir = path.resolve(__dirname, '../db/migrations');

const getMigrationFiles = () =>
  fs
    .readdirSync(migrationsDir)
    .filter(file => file.endsWith('.js'))
    .sort((a, b) => a.localeCompare(b));

const toMigrationRecord = fileName => {
  const [timestamp, ...descriptionParts] = fileName.replace('.js', '').split('-');

  return {
    title: fileName,
    description: descriptionParts.join('-'),
    timestamp: Number(timestamp)
  };
};

const run = async () => {
  await connection.asPromise();

  const migrationState = (await Migration.findOne({})) || new Migration({ lastRun: null, migrations: [] });
  const executedTitles = new Set((migrationState.migrations || []).map(item => item.title));
  const files = getMigrationFiles();

  for (const fileName of files) {
    if (executedTitles.has(fileName)) continue;

    const migrationPath = path.join(migrationsDir, fileName);
    const migration = require(migrationPath);

    if (typeof migration.up !== 'function') {
      throw new Error(`Migration ${fileName} does not export an up function`);
    }

    console.log(`Running migration: ${fileName}`);
    await migration.up();

    const migrationRecord = toMigrationRecord(fileName);
    migrationState.lastRun = fileName;
    migrationState.migrations.push(migrationRecord);
    await migrationState.save();
  }

  console.log('Migrations up completed');
  await connection.close();
};

run().catch(async error => {
  console.error(error);
  await connection.close().catch(() => {});
  process.exit(1);
});
