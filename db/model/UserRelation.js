/*
 * @description 用户关系模型
 */

const seq = require('../seq');
const { STRING } = require('../types');

const UserRelation = seq.define('userRelation', {
    userId: {
        type: STRING,
        allowNull: false,
        comment: '用户id'
    },
    followerId: {
        type: STRING,
        comment: '被关注用户id'
    }
});

module.exports = UserRelation;
