/**
 * @description 个人主页api路由
 */

const { getBlogListByUser } = require('../../controller/blog-profile');
const { getBlogListStr } = require('../../config/blog');
const { follow, unFollow } = require('../../controller/user-relation');

const router = require('koa-router')();

router.prefix('/api/profile');

// 加载更多
router.get('/loadMore/:userName/:pageIndex', async (ctx, next) => {
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login')
    }
    let { userName, pageIndex } = ctx.params;
    pageIndex = parseInt(pageIndex);
    const result = await getBlogListByUser({ userName, pageIndex: pageIndex});

    console.log('加载出来的数据',result);

    // 渲染为html字符串
    result.blogListTpl = getBlogListStr(result.blogList);
    ctx.body = result;
});

// 关注
router.post('/follow', async (ctx, next) => {
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login')
    }
    const { id: myUserId } = ctx.session.userInfo;
    const { userId: curUserId } = ctx.request.body;
    await follow(myUserId, curUserId);
    ctx.body = {
        code: 0,
        msg: '关注成功'
    }
});
// 取消关注
router.post('/unfollow', async (ctx, next) => {
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login')
    }
    const { id: myUserId } = ctx.session.userInfo;
    const { userId: curUserId } = ctx.request.body;
    const result = await unFollow(myUserId, curUserId);
    console.log('unfollow', result, myUserId, curUserId);
    if (result) {
        ctx.body = {
            code: 0,
            msg: '取消关注成功'
        }
    } else {
        ctx.body = {
            code: -1,
            msg: '取消关注失败'
        }
    }
});


module.exports = router;
