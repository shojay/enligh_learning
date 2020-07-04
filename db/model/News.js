/*
 * @description News数据模型
 */

const seq = require('../seq');
const { STRING, TEXT, INTEGER } = require('../types');

const News = seq.define('news', {
    id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
        comment: 'new Id'
    },
    imgPath: {
        type: STRING,
        comment: '图片路径'
    },
    title: {
        type: STRING,
        allowNUll: false,
        comment: 'new标题'
    },
    uid: {
        type: STRING,
        allowNull: false,
        comment: '用户id'
    },
    substract: {
        type: STRING,
        comment: ''
    },
    content: {
        type: TEXT,
        comment: '内容'
    },
    tags: {
        type: STRING,
        comment: '标签'
    },
    filePath: {
        type: STRING,
        comment: '文件路径'
    },
    fileName: {
        type: STRING,
        comment: '文件名'
    },
    status: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: ''
    }
});

module.exports = News;
