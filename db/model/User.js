/*
 * @description User数据模型
 */

const seq = require('../seq');
const { STRING, INTEGER } = require('../types');

// users
const User = seq.define('user', {
    id: {
      type: STRING,
      primaryKey: true,
      allowNull: false,
      comment: 'id'
    },
    name: {
        type: STRING,
        unique: true,
        allowNull: false,
        comment: '名字唯一'
    },
    password: {
        type: STRING,
        allowNull: false,
        comment: '密码'
    },
    account: {
        type: STRING,
        unique: true,
        allowNull: false,
        comment: '账号'
    },
    phone: {
        type: STRING,
        unique: true,
        allowNull: false,
        comment: '手机号码'
    },
    picture: {
        type: STRING,
        comment: '头像 图片地址'
    },
    email: {
        type: STRING,
        unique: true,
        comment: '邮箱'
    },
    status: {
        type: INTEGER,
        allowNull: false,
        comment: 'status'
    },
    type: {
        type: INTEGER,
        allowNull:false,
        defaultValue: 1,
        comment: '用户类型'
    }
});

module.exports = User;
