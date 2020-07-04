/*
 * @description 存储配置
 */

const REDIS_CONF = {
    port: 6379,
    host: '127.0.0.1'
};
const MYSQL_CONF = {
    host: 'localhost',
    root: 'root',
    password: 'root',
    port: '3306',
    database: 'englishKoa'
};

module.exports = {
    REDIS_CONF,
    MYSQL_CONF
};
