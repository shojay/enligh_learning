/**
 * @description 个人主页 controller
 */
const { Blog, User } = require('../db/model/index');

/**
 * 获取个人主页微博列表
 * @param userName
 * @param pageIndex
 * @param pageSize
 */
async function getBlogListByUser({ userName, pageIndex = 0, pageSize = 100 }) {
    // 拼接查询条件
    let userWhereOpts = {};
    if (userName) {
        userWhereOpts.name = userName;
    }
    console.log('userwhere', userWhereOpts);
    // 执行查询
    const result = await Blog.findAndCountAll({
        limit: pageSize,
        offset: pageSize * pageIndex,
        order: [
            ['createdAt', 'desc']
        ],
        include: [
            {
                model: User,
                attributes: ['name', 'picture'],
                where: userWhereOpts
            }
        ]
    });

    // result.count 总数跟分页无关
    // result.rows 查询结果数组
    let blogList = result.rows.map(row => row.dataValues);

    blogList = blogList.map(blogItem => {
        blogItem.user = blogItem.user.dataValues;
        return blogItem
    });

    return {
        count: result.count,
        blogList,
        pageIndex,
        pageSize,
        isEmpty: blogList.length === 0
    }
}


module.exports = {
    getBlogListByUser
};
