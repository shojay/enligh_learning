/**
 * @description Blog数据模型
 */

const seq = require('../seq');
const { STRING, TEXT } = require('../types');

const Blog = seq.define('blog', {
    userId: {
        type: STRING,
        allowNull: false,
        comment: '用户id'
    },
    content: {
        type: TEXT,
        allowNull: false,
        comment: 'blog内容'
    },
    image: {
        type: STRING,
        comment: '发布图片'
    }
});

module.exports = Blog;
