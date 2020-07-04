/*
 * @description Sequelize和mySql的配置
 */
const Sequelize = require('sequelize');
const { MYSQL_CONF } = require('../config/db');
const { host, root, password, port, database } = MYSQL_CONF;
const sequelize = new Sequelize(database, root, password, {
    host,
    dialect: 'mysql',
    logging: false
});
module.exports = sequelize;
