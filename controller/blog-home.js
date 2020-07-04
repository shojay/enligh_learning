/*
 * @description blog首页逻辑
 */

const { Blog, User, UserRelation } = require('../db/model/index');
const { formatBlog } = require('../config/_format');


/**
 * 获取首页微博列表
 * @param {string} userId
 * @param {number} pageIndex
 * @param {number} pageSize
 */
async function getHomeBlogList({userId, pageIndex = 0, pageSize = 10}) {
    const result = await Blog.findAndCountAll({
        limit: pageSize,
        offset: pageSize * pageIndex,
        order: [
            ['createdAt', 'desc']
        ],
        include: [
            {
                model: User,
                attributes: ['name', 'picture']
            },
            {
                model: UserRelation,
                attributes: ['userId', 'followerId'],
                where: {
                    userId: userId
                }
            }
        ]
    });

    // console.log('sssssssssrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr', result);

    // 格式化数据
    let blogList = result.rows.map(row => row.dataValues);
    blogList = formatBlog(blogList);
    blogList = blogList.map(blogItem => {
        blogItem.user = blogItem.user.dataValues;
        return blogItem
    });

    return {
        count: result.count,
        blogList,
        pageIndex,
        pageSize
    }
}


module.exports = {
    getHomeBlogList
};
