const router = require('koa-router')();
const Sequelize = require('sequelize');
const { News } = require('../../db/model/index');

router.prefix('/news');

router.get('/topost', async (ctx, next) => {
    let userInfo = ctx.cookies.get('userInfo') || '';
    console.log(userInfo);
    if (!userInfo) {
        ctx.redirect('/users/login');
        ctx.body = {
            code: -1,
            msg: '未登录'
        };
        return false;
    }
    await ctx.render('postNews', {
        title: '发布学习资料',
        nav: 'news',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : ''
    });
});

router.get('/tonews', async (ctx, next) => {
    await ctx.render('news', {
        title: '资料专区',
        nav: 'news',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : ''
    })
});

router.get('/tonewsmanage', async (ctx, next) => {
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login');
        return false;
    }
    await ctx.render('newsManage', {
        title: '资料管理',
        nav: 'newsmanage',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : ''
    })
});

router.get('/tonewsdetail/:newsId', async (ctx, next) => {
    let newsId = ctx.params.newsId;
    const whereOpt = {
        [Sequelize.Op.and]: [
            {
                id: newsId
            },
            {
                status: 1
            }
        ]
    };
    const result = await News.findOne({
        attributes: ['id', 'title'],
        where: whereOpt
    });
    if (!result) {
        return false;
    } else {
        await ctx.render('newsDetail', {
            title: result.dataValues.title,
            nav: 'news',
            newsId,
            userType: ctx.session.userInfo ? ctx.session.userInfo.type : ''
        })
    }
});
module.exports = router;
