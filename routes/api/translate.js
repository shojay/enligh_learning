const router = require('koa-router')();
const Sequelize = require('sequelize');

router.prefix('/api');

const { Word } = require('../../db/model/index');

router.get('/translate', async (ctx, next) => {
    const { en } = ctx.query;
    if (!en) {
        ctx.body = {
            code: -1,
            msg: '请输入你要查询的单词'
        };
        return false;
    }
    let enFilter = {
        word: { [Sequelize.Op.like]: `${en}%` }
    };
    const result = await Word.findAndCountAll({
        limit: 20,
        attributes: ['word', 'translation'],
        where: enFilter
    });

    // 格式化数据
    let wordList = result.rows.map(row => row.dataValues);

    if (!wordList) {
        ctx.body = {
            code: -1,
            msg: '查询不到此单词'
        };
        return false;
    } else {
        ctx.body = {
            code: 0,
            msg: '查询成功',
            wordList
        };
    }

});
module.exports = router;
