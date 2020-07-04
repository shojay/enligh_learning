/**
 * @description 广场缓存
 */

const { get, set } = require('./_redis');
const { getBlogListByUser } = require('../controller/blog-profile');
// redis key前缀
const KEY_PREFIX = 'blog:square:';

async function getSquareCacheList(pageIndex = 0, pageSize = 100) {
    const key = `${KEY_PREFIX}${pageIndex}_${pageSize}`;

    // 尝试获取缓存
    const cacheResult = await get(key);
    if (cacheResult) {
        // 获取得到就直接返回
        return cacheResult
    }
    // 如果不存在，直接从数据库读取
    const result = await getBlogListByUser( { pageIndex, pageSize });

    // 将数据库读取到的数据存入缓存
    set(key, result, 60);

    return result
}

module.exports = {
    getSquareCacheList
};
