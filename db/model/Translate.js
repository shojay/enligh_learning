/*
 * @description Translate数据模型
 */

const seq = require('../seq');
const { STRING } = require('../types');

// Translate
const Word = seq.define('enwords', {
    word: {
        type: STRING,
        unique: true,
        allowNull: false,
        comment: '英语单词'
    },
    translation: {
        type: STRING,
        allowNull: false,
        comment: '单词翻译'
    }
});

module.exports = Word;
