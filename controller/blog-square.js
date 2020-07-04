/**
 * @description 微博广场逻辑
 */

const { getSquareCacheList } = require('../config/cache');

async function getSquareBlogList(pageIndex = 0) {
    const result = await getSquareCacheList(pageIndex);
    const blogList = result.blogList;
    return {
        isEmpty: blogList.length === 0,
        blogList,
        pageSize: 5,
        pageIndex,
        count: result.count
    }
}


module.exports = {
    getSquareBlogList
};
