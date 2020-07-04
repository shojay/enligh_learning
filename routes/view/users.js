const router = require('koa-router')();
const md5 = require('md5');

router.prefix('/users');

router.get('/register', async function (ctx, next) {
  await ctx.render('register', {
    title: '注册'
  })
});

router.get('/login', async function (ctx, next) {
  let userInfo = ctx.session.userInfo || '';
  await ctx.render('login', {
    title: '登录',
    isLogin: !!userInfo,
    name: userInfo.name || ''
  })
});

router.get('/tospace/:userId', async (ctx, next) => {
  let userInfo = ctx.session.userInfo || '';
  if (!userInfo) {
    ctx.redirect('/users/login');
    return false;
  }
  let userId = ctx.params.userId;
  await ctx.render('space', {
    title: '英语学习网-个人中心',
    userId,
    userType: ctx.session.userInfo ? ctx.session.userInfo.type : '',
    name: userInfo.name || '',
    email: userInfo.email || '',
    picture: userInfo.picture || '',
    nav: ctx.session.userInfo.type === 2 ? 'vipmanage' : ''
  })
});

router.get('/tovipmanage', async (ctx, next) => {
  let user = ctx.session.userInfo;
  if (!user) {
    ctx.redirect('/users/login');
    return false;
  }
  await ctx.render('vipManage', {
    title: '会员管理',
    nav: 'vipmanage',
    userType: ctx.session.userInfo ? ctx.session.userInfo.type : ''
  });
});



module.exports = router
