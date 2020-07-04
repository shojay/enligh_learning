/*
 * @description Download数据模型
 */

const seq = require('../seq');
const { STRING, INTEGER } = require('../types');

const Download = seq.define('download', {
    id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: STRING,
        allowNull: false,
        comment: 'userid'
    },
    teachId: {
        type: STRING,
        allowNull: false,
        comment: 'teachid'
    },
    status: {
        type: INTEGER,
        allowNull: false,
        comment: ''
    },
    path: {
        type: STRING,
        comment: '下载路径'
    }
});

module.exports = Download;
