const router = require('koa-router')();
const xss = require('xss');
const { getBlogListStr } = require("../../config/blog");
const { Blog } = require('../../db/model/index');
const { getUserInfo } = require('../../controller/user');
const { getHomeBlogList } = require('../../controller/blog-home');
const { createAtRelation } = require('../../controller/blog-at');
const REG_FOR_AT_WHO = /@(.+?)\s-\s(\w+?)\b/g;
router.prefix('/api/blog');

router.post('/create', async (ctx, next) => {
    let { content, image } = ctx.request.body;
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login');
    }
    // 分析并收集 content 中的 @ 用户
    // content 格式如 '哈喽 @李四 - lisi 你好 @王五 - wangwu '
    const atUserNameList = [];
    content = content.replace(
        REG_FOR_AT_WHO,
        (matchStr, nickName, userName) => {
            // 目的不是replace而是获取userName
            atUserNameList.push(userName);
            return matchStr
        }
    );

    // 根据 @ 用户名查询用户信息
    const atUserList = await Promise.all(
        atUserNameList.map(userName => getUserInfo(userName))
    );
    // 根据用户信息获取用户id
    const atUserIdList = atUserList.map(user => user.id);
    console.log('atUserIdList', atUserIdList);

    // 创建微博
    let result = await Blog.create({
        userId: user.id,
        content: xss(content),
        image
    });
    console.log('blogResult', result);
    let blog = result.dataValues;
    // 创建at关系
    await Promise.all(atUserIdList.map(
        userId => createAtRelation(blog.id, userId)
    ));
    ctx.body = {
        code: 0,
        msg: '发布成功'
    }

});

router.get('/loadMore/:pageIndex', async (ctx, next) => {
    let { pageIndex } = ctx.params;
    pageIndex = parseInt(pageIndex);
    const { id: userId } = ctx.session.userInfo;
    const result = await getHomeBlogList({ userId, pageIndex });
    // 渲染模板
    result.blogListTpl = getBlogListStr(result.blogList, true);
    ctx.body = result;
});

module.exports = router;
