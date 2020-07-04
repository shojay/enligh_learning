const router = require('koa-router')();

router.prefix('/listening');

router.get('/', async (ctx, next) => {
    await ctx.render('listening', {
        title: '听力练习',
        nav: 'courses',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : ''
    })
});

router.get('/:listeningId', async (ctx, next) => {
    const { listeningId } = ctx.params;
    await ctx.render('listeningDetail', {
        title: '听力练习',
        nav: 'teach',
        listeningId,
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : ''
    });
});

router.get('/post/postPractice', async (ctx, next) => {
    let userInfo = ctx.session.userInfo;
    if (!userInfo) {
        ctx.redirect('/users/login');
        ctx.body = {
            code: -1,
            msg: '未登录'
        };
        return false;
    }
    await ctx.render('postPractice', {
        title: '听力发布',
        nav: 'courses',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : ''
    });
});

module.exports = router;
