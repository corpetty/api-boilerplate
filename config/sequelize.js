import Sequelize from 'sequelize';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import config from './config';
import logger from './winston/get-default-logger';

const db = {};

// connect to postgres testDb
const sequelizeOptions = {
    dialect: 'sqlite',
    storage: config.db_path,
    host: config.sqlite.host,
    pool: {
        max: 5,
        min: 0,
        idle: 10000,
    },
};
const sequelize = new Sequelize(
    config.sqlite.db,
    config.sqlite.user,
    config.sqlite.passwd,
    sequelizeOptions,
);

const modelsDir = path.normalize(`${__dirname}/../server/models`);

// loop through all files in models directory ignoring hidden files and this file
fs.readdirSync(modelsDir)
    .filter((file) => (file.indexOf('.') !== 0) && (file.indexOf('.map') === -1))
    // import model files and save model names
    .forEach((file) => {
        logger.info(`Loading model file ${file}`);
        const model = sequelize.import(path.join(modelsDir, file));
        db[model.name] = model;
    });

// Synchronizing any model changes with database.
sequelize
    .sync()
    .then(() => {
        logger.info('Database synchronized');
    })
    .catch((error) => {
        if (error) {
            logger.error('An error occured: ', error);
        }
    });

// assign the sequelize variables to the db object and returning the db.
module.exports = _.extend({
    sequelize,
    Sequelize,
}, db);
