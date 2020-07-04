/**
 * @description blog的at关系模型
 */

const seq = require('../seq');
const { INTEGER, BOOLEAN, STRING } = require('../types');

const AtRelation = seq.define('atRelation', {
    userId: {
        type: STRING,
        allowNull: false,
        comment: '用户id'
    },
    blogId: {
        type: INTEGER,
        allowNull: false,
        comment: 'blog id'
    },
    isRead: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '是否已读'
    }
});

module.exports = AtRelation;
