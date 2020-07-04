/**
 * @description 微博 @ 关系 controller
 */

const { AtRelation, Blog, User } = require('../db/model/index');
const { formatBlog } = require('../config/_format');


/**
 * 创建微博 @ 用户的关系
 * @param {number} blogId 微博 id
 * @param {string} userId 用户 id
 */
async function createAtRelation(blogId, userId) {
    const result = await AtRelation.create({
        blogId: blogId,
        userId: userId
    });
    return result.dataValues;
}

/**
 * 获取 @ 我的微博数量
 * @param {string} userId userId
 */
async function getAtRelationCount(userId) {
    const result = await AtRelation.findAndCountAll({
        where: {
            userId: userId,
            isRead: false
        }
    });
    return {
        count: result.count
    }
}

/**
 * 获取 @ 用户的微博列表
 * @param {string} userId user id
 * @param {number} pageIndex page index
 * @param { number } pageSize
 */
async function getAtMeBlogList(userId, pageIndex= 0, pageSize = 100) {
    const result = await Blog.findAndCountAll({
        limit: pageSize,
        offset: pageSize * pageIndex,
        order: [
            ['createdAt', 'desc']
        ],
        include: [
            // @关系
            {
                model: AtRelation,
                attributes: ['userId', 'blogId'],
                where: { userId }
            },
            // User
            {
                model: User,
                attributes: ['name', 'picture']
            }
        ]
    });

    // result.count
    // result.rows

    // 格式化
    let blogList = result.rows.map(row => row.dataValues);
    blogList = formatBlog(blogList);
    blogList = blogList.map(blogItem => {
        blogItem.user = blogItem.user.dataValues;
        return blogItem
    });

    return {
        isEmpty: blogList.length === 0,
        count: result.count,
        blogList,
        pageSize,
        pageIndex
    }
}

/**
 * 更新 AtRelation
 * @param {Object} param0 更新内容
 * @param {Object} param1 查询条件
 */
async function updateAtRelation(
    { newIsRead }, // 要更新的内容
    { userId, isRead } // 条件
) {
    // 拼接更新内容
    const updateData = {};
    if (newIsRead) {
        updateData.isRead = newIsRead
    }
    // 拼接查询条件
    const whereData = {};
    if (userId) {
        whereData.userId = userId
    }
    if (isRead) {
        whereData.isRead = isRead
    }

    // 执行更细
    const result = await AtRelation.update(updateData, {
        where: whereData
    });
    return result[0] > 0
}

/**
 * 标记为已读
 * @param {number} userId userId
 */
async function markAsRead(userId) {
    try {
        await updateAtRelation(
            { newIsRead: true },
            { userId, isRead: false }
        )
    } catch (e) {
        console.log(e);
    }
}

module.exports = {
    getAtRelationCount,
    getAtMeBlogList,
    markAsRead,
    createAtRelation
};
