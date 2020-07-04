/*
 * @description Teach数据模型
 */

const seq = require('../seq');
const { STRING, TEXT, INTEGER } = require('../types');

const Teach = seq.define('teach', {
    id: {
        type: STRING,
        primaryKey: true,
        unique: true,
        allowNull: false,
        comment: 'id'
    },
    name: {
        type: STRING,
        comment: 'title'
    },
    alt: {
        type: TEXT,
        comment: 'alt'
    },
    userId: {
        type: STRING,
        allowNull: false,
        comment: 'userid'
    },
    logo: {
        type: STRING,
        comment: 'logo'
    },
    status: {
        type: INTEGER,
        allowNull: false,
        comment: ''
    }
});

module.exports = Teach;
