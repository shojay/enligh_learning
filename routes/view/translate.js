const router = require('koa-router')();

router.prefix('/translate');

router.get('/totranslate', async (ctx, next) => {
    await ctx.render('translate', {
        title: '单词查询',
        nav: 'translate',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : ''
    })
});

module.exports = router;
