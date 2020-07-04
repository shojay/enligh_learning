/**
 * @description user controller
 */

const { User } = require('../db/model/index');


/**
 * 获取用户信息
 * @param {String} userName 用户名
 */
async function getUserInfo(userName) {
    // 查询条件
    const whereOpt = {
        name: userName
    };
    // 查询
    const result = await User.findOne({
        attributes: ['id', 'name', 'picture'],
        where: whereOpt
    });

    if (result === null) {
        return result;
    }
    return result.dataValues;
}

/**
 * 用户名是否存在
 * @param {String} userName 用户名
 */
async function isExist(userName) {
    const result = await User.findOne({
        attributes: ['id', 'name', 'picture'],
        where: {
            name: userName
        }
    });
    if (result === null) {
        return result;
    }

    return result.dataValues
}

module.exports = {
    isExist,
    getUserInfo
};
