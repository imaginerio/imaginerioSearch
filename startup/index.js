/* eslint-disable import/no-dynamic-require, global-require */
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const { sequelize, Sequelize } = require('../models');
const logger = require('../utils/logger');

const executeMigrations = async (dir, table) => {
  logger.info({ dir }, 'running migrations');

  const doMigration = async file => {
    logger.info({ file }, 'executing migration');
    await require(path.join(__dirname, '../', dir, file)).up(sequelize.queryInterface, Sequelize);
    if (table) {
      await sequelize.query(
        `INSERT INTO "${table}" VALUES ('${file}')`,
        Sequelize.QueryTypes.INSERT
      );
    }
  };

  let executed = [];
  if (table) {
    try {
      const results = await sequelize.query(
        `SELECT name FROM "${table}"`,
        Sequelize.QueryTypes.SELECT
      );
      executed = results[0].map(r => r.name);
    } catch {
      logger.warn({ table }, 'seeder table not initialized');
    }
  }

  const files = (await fs.readdir(path.join(__dirname, '../', dir))).filter(
    f => !executed.includes(f)
  );
  await files.reduce(async (prev, file) => {
    await prev;
    return doMigration(file);
  }, Promise.resolve());
};

module.exports.default = async () => {
  await executeMigrations('migrations', 'SequelizeMeta');
  await executeMigrations('seeders');
};

if (require.main === module) {
  (async () => {
    await executeMigrations('seeders');
    if (process.env.DEPLOY_HOOK) {
      const { data } = await axios.post(process.env.DEPLOY_HOOK);
      logger.info({ data }, 'deploy hook complete');
      process.exit(0);
    }
  })().catch(err => {
    logger.fatal({ err }, 'startup failed');
    process.exit(1);
  });
}
