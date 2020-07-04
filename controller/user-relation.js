/**
 * @description 用户关系controller
 */

const Sequelize = require('sequelize');
const { User, UserRelation } = require('../db/model/index');

/**
 * 根据userId获取粉丝列表
 * @param { string } followerId 用户id
 */
async function getUsersByFollower(followerId) {
    const result = await User.findAndCountAll({
        attributes: ['id', 'name', 'picture'],
        order: [
            ['createdAt', 'desc']
        ],
        include: [
            {
                model: UserRelation,
                where: {
                    followerId,
                    userId: {
                        [Sequelize.Op.ne]: followerId // 查询followerId和userID不相等的
                    }
                }
            }
        ]
    });

    // result.count 总数
    // result.rows 查询结果 数组

    // 格式化
    let userList = result.rows.map(row => row.dataValues);
    // console.log('result', userList);

    return {
        count: result.count,
        fansList: userList
    }
}

/**
 * 获取关注列表
 * @param userId
 */
async function getFollowersByUser(userId) {
    const result = await UserRelation.findAndCountAll({
        order: [
            ['createdAt', 'desc']
        ],
        include: [
            {
                model: User,
                attributes: ['id', 'name', 'picture'],
            }
        ],
        where: {
            userId,
            followerId: {
                [Sequelize.Op.ne]: userId // 查询followerId和userID不相等的
            }
        }
    });

    // result.count
    // result.rows
    let userList = result.rows.map(row => row.dataValues);

    userList = userList.map(item => {
        let user = item.user;
        user = user.dataValues;
        return user
    });

    return {
        count: result.count,
        followersList: userList
    }
}

/**
 * 关注用户
 * @param {string} myUserId 当前登录用户
 * @param {string} curUserId 被访问的用户
 */
async function follow(myUserId, curUserId) {
    try {
        let result = await UserRelation.create({
            userId: myUserId,
            followerId: curUserId
        }).dataValues;
    } catch (e) {
        throw e;
    }
}

/**
 * 取消关注用户
 * @param {string} myUserId 当前登录用户
 * @param {string} curUserId 被访问的用户
 */
async function unFollow(myUserId, curUserId) {
    try {
        let result = await UserRelation.destroy({
            where: {
                userId: myUserId,
                followerId: curUserId
            }
        });
        return result > 0;
    } catch (e) {
        throw e;
    }
}

module.exports = {
    getUsersByFollower,
    getFollowersByUser,
    follow,
    unFollow
};
