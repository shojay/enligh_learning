/*
 * @description Question数据模型
 */

const seq = require('../seq');
const { STRING } = require('../types');

const Question = seq.define('questions', {
    id: {
        type: STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
    },
    tid: {
        type: STRING,
        allowNull: false,
        comment: 'tid'
    },
    userId: {
        type: STRING,
        allowNull: false,
        comment: 'userid'
    },
    title: {
        type: STRING,
        allowNull: false,
        comment: 'title'
    },
    option1: {
        type: STRING,
        comment: '1'
    },
    option2: {
        type: STRING,
        comment: '2'
    },
    option3: {
        type: STRING,
        comment: '3'
    },
    option4: {
        type: STRING,
        comment: '4'
    },
    option5: {
        type: STRING,
        comment: '5'
    },
    answer: {
        type: STRING,
        comment: 'answer'
    }
});

module.exports = Question;
