/*
 * @description Collect数据模型
 */

const seq = require('../seq');
const { STRING, INTEGER } = require('../types');

const Collect = seq.define('collect', {
    userId: {
        type: STRING,
        allowNull: false,
        comment: 'userId'
    },
    newsId: {
        type: STRING,
        allowNull: false,
        comment: 'newsId'
    },
    status: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: ''
    }
});

module.exports = Collect;
