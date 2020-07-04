/**
 * @description 数据格式化
 */

const { format } = require('date-fns');
const REG_FOR_AT_WHO = /@(.+?)\s-\s(\w+?)\b/g;

/**
 * 格式化时间，如 09.05 23:02
 * @param {string} str 时间字符串
 */
function timeFormat(str) {
    return format(new Date(str), 'MM.dd HH:mm')
}


/**
 * 格式化数据的时间
 * @param {Object} obj 数据
 */
function _formatDBTime(obj) {
    obj.createdAtFormat = timeFormat(obj.createdAt);
    obj.updatedAtFormat = timeFormat(obj.updatedAt);
    return obj
}

/**
 * 格式化微博内容
 * @param {Object} obj 微博数据对象
 */
function _formatContent(obj) {
    obj.contentFormat = obj.content;

    // 格式化 @
    // from '哈喽 @张三 - zhangsan 你好'
    // to '哈喽 <a href="/profile/zhangsan">张三</a> 你好'
    obj.contentFormat = obj.contentFormat.replace(
        REG_FOR_AT_WHO, // /@(.+?)\s-\s(\w+?)\b/g
        (matchStr, nickName, userName) => { // nickName -> (.+?)匹配到的子串 userName -> (\w+?)匹配到的子串
            return `<a href="/blog/profile/${userName}">@${nickName}</a>`
        }
    );

    return obj
}

function formatBlog(list) {
    if (list == null) {
        return list
    }

    if (list instanceof Array) {
        // 数组
        return list.map(_formatDBTime).map(_formatContent)
    }
    // 对象
    let result = list;
    result = _formatDBTime(result);
    result = _formatContent(result);
    return result;
}

module.exports = {
    formatBlog
};
