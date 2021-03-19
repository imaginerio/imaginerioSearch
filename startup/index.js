/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-unsafe-finally */
/* eslint-disable no-console */
const fs = require('fs').promises;
const path = require('path');
const { sequelize, Sequelize } = require('../models');

const executeMigrations = async (dir, table) => {
  console.log(`----- RUNNING ${dir} -----`);
  let executed = [];

  const doMigration = file => {
    console.log(`----- EXECUTING ${file} -----`);
    return require(path.join(__dirname, '../', dir, file))
      .up(sequelize.queryInterface, Sequelize)
      .then(() =>
        table
          ? sequelize.query(
              `INSERT INTO "${table}" VALUES ('${file}')`,
              Sequelize.QueryTypes.INSERT
            )
          : Promise.resolve()
      );
  };

  try {
    const results = await sequelize.query(
      `SELECT name FROM "${table}"`,
      Sequelize.QueryTypes.SELECT
    );
    executed = results[0].map(r => r.name);
  } catch {
    console.log('Seeder table not initialized');
  } finally {
    return fs.readdir(path.join(__dirname, '../', dir)).then(files =>
      files
        .filter(f => !executed.includes(f))
        .reduce(async (previousPromise, file) => {
          await previousPromise;
          return doMigration(file);
        }, Promise.resolve)
    );
  }
};

module.exports.default = () =>
  executeMigrations('migrations', 'SequelizeMeta').then(() => executeMigrations('seeders'));
