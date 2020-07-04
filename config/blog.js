/**
 * @description 相关工具方法
 */

const fs = require('fs');
const path = require('path');
const ejs = require('ejs');

// 获取blog-list.html的文件内容
const BLOG_LIST_TPL = fs.readFileSync(
    path.join(__dirname, '..', 'views', 'common', 'blog-list.html')
).toString();

function getBlogListStr(blogList = [], canReply = false) {
    return ejs.render(BLOG_LIST_TPL, {
        blogList,
        canReply
    })
}

module.exports = {
    getBlogListStr
};
