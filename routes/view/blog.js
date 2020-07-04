const router = require('koa-router')();

router.prefix('/blog');

const { getHomeBlogList } = require('../../controller/blog-home');
const { getFollowersByUser, getUsersByFollower } = require('../../controller/user-relation');
const { getAtRelationCount, getAtMeBlogList, markAsRead } = require('../../controller/blog-at');
const { getBlogListByUser } = require('../../controller/blog-profile');
const { getSquareBlogList } = require('../../controller/blog-square');
const { isExist } = require('../../controller/user');
const { formatBlog } = require('../../config/_format');

router.get('/', async (ctx, next) => {
    let userInfo = ctx.session.userInfo;
    if (!userInfo) {
        ctx.redirect('/users/login');
        return false;
    }
    let userId = userInfo.id || '';
    // console.log('userId', userId);

    // 获取第一页blog数据
    const result = await getHomeBlogList({userId});
    const { count: blogCount, blogList, pageSize, pageIndex } = result;

    // 获取粉丝
    const fansResult = await getUsersByFollower(userId);
    const { count: fansCount, fansList } = fansResult;

    // console.log('fansList', fansList);

    // 获取关注人列表
    const followersResult = await getFollowersByUser(userId);
    const { count: followersCount, followersList } = followersResult;

    // 获取@数量
    const atCountResult = await getAtRelationCount(userId);
    const { count: atCount } = atCountResult;

    console.log('userInfo', userInfo);

    await ctx.render('blog-home', {
        title: '微博',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : '',
        nav: 'blog',
        userData: {
            userInfo,
            fansData: {
                count: fansCount,
                list: fansList
            },
            followersData: {
                count: followersCount,
                list: followersList
            },
            atCount
        },
        blogData: {
            isEmpty: result.length === 0,
            blogList,
            pageSize,
            pageIndex,
            count: blogCount
        }
    })
});

// 个人主页
router.get('/profile', async (ctx, next) => {
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login');
        return false;
    }
    ctx.redirect(`/blog/profile/${user.name}`);
});

router.get('/profile/:userName', async (ctx, next) => {
    // 已登录用户的信息
    let userInfo = ctx.session.userInfo;
    if (!userInfo) {
        ctx.redirect('/users/login');
        return false;
    }
    let userName = ctx.session.userInfo.name;
    let { type } = ctx.query;
    console.log('type', type);
    let flag = 0;

    let curUserInfo;
    const { userName: curUserName } = ctx.params;
    const isMe = userName === curUserName;
    console.log('isMe', isMe, 'name', curUserName);
    if (isMe) {
        // 是当前登录用户
        curUserInfo = userInfo;
    } else {
        // 不是当前登录用户
        const existResult = await isExist(curUserName);
        if (!existResult) {
            // 用户名不存在
            ctx.body = {
                code: -1,
                msg: '用户不存在'
            };
            return false;
        }
        // 用户存在
        curUserInfo = existResult;
    }

    // 获取微博第一页数据
    const result = await getBlogListByUser({ userName: curUserName });
    const { isEmpty, blogList, pageSize, pageIndex, count } = result;

    // 获取粉丝
    const fansResult = await getUsersByFollower(curUserInfo.id);
    const { count: fansCount, fansList } = fansResult;
    // console.log('fansList', fansList, curUserInfo.id, userInfo.id);

    // 获取关注人列表
    const followersResult = await getFollowersByUser(curUserInfo.id);
    const { count: followersCount, followersList } = followersResult;

    // 我是否关注了此人
    const amIFollowed = fansList.some(item => {
        return item.name === userName
    });

    console.log('amIFollowed', amIFollowed, userName);

    // 获取@数量
    const atCountResult = await getAtRelationCount(userInfo.id);
    const { count: atCount } = atCountResult;

    // console.log('rrrrrsss', result, fansResult, followersResult, amIFollowed, atCountResult);

    if (type === 'followers') {
        flag = 1;
    } else if (type === 'fans') {
        flag = 2;
    } else {
        flag = 0;
    }

    await ctx.render('profile', {
        title: '空间',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : '',
        nav: 'blog',
        flag,
        blogData: {
            isEmpty,
            blogList: formatBlog(blogList),
            pageSize,
            pageIndex,
            count
        },
        userData: {
            userInfo: curUserInfo,
            isMe,
            fansData: {
                count: fansCount,
                list: fansList
            },
            amIFollowed,
            atCount,
            followersData: {
                count: followersCount,
                list: followersList
            }
        }
    })
});

// 微博广场页
router.get('/square', async (ctx, next) => {
    let userInfo = ctx.session.userInfo;
    if (!userInfo) {
        ctx.redirect('/users/login');
        return false;
    }
    const result = await getSquareBlogList(0);
    const { isEmpty, count, pageIndex, blogList, pageSize } = result;
    await ctx.render('square', {
        title: '广场',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : '',
        nav: 'blog',
        blogData: {
            isEmpty,
            blogList: formatBlog(blogList),
            pageIndex,
            pageSize,
            count
        },
        userData: {
            userInfo
        }
    })
});

// atMe路由
router.get('/at-me', async (ctx, next) => {
    const userInfo = ctx.session.userInfo;
    if (!userInfo) {
        ctx.redirect('/users/login');
        return false;
    }
    const { id: userId, name } = ctx.session.userInfo;


    // 获取@数量
    const atCountResult = await getAtRelationCount(userId);
    const { count: atCount } = atCountResult;

    // 获取第一页列表
    const result = await getAtMeBlogList(userId);
    const { isEmpty, pageIndex, pageSize, blogList, count } = result;

    // console.log('atme', atCountResult, result);

    // 渲染
    await ctx.render('atMe', {
        title: '提到我的',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : '',
        nav: 'blog',
        atCount,
        blogData: {
            isEmpty,
            blogList,
            pageSize,
            pageIndex,
            count
        },
        userData: {
            userInfo: {
                name
            }
        }
    });

    // 标记为已读
    if (atCount > 0) {
        await markAsRead(userId);
    }
});

router.get('/fans/:userName', async (ctx, next) => {
    // 已登录用户的信息
    let userInfo = ctx.session.userInfo;
    if (!userInfo) {
        ctx.redirect('/users/login');
        return false;
    }
    let userName = ctx.session.userInfo.name;
    let curUserInfo;
    const { userName: curUserName } = ctx.params;
    const isMe = userName === curUserName;
    if (isMe) {
        // 是当前登录用户
        curUserInfo = userInfo;
    } else {
        // 不是当前登录用户
        const existResult = await isExist(curUserName);
        if (!existResult) {
            // 用户名不存在
            ctx.body = {
                code: -1,
                msg: '用户不存在'
            };
            return false;
        }
        console.log('existResult', existResult);
        // 用户存在
        curUserInfo = existResult;
    }

    // 获取粉丝
    const fansResult = await getUsersByFollower(curUserInfo.id);
    let { count: fansCount, fansList } = fansResult;
    // console.log('fansList', fansList, curUserInfo.id, userInfo.id);

    // 我是否关注了此人
    // const amIFollowed = fansList.some(item => {
    //     return item.name === userName
    // });
    fansList.map(async (item, index) => {
       let fanList =  await getUsersByFollower(item.id);
       fanList = fanList.fansList;
       item.amIFollowed = fanList.some(value => {
           return value.name === userName
       });
       console.log('item', item);
       return item;
    });

    await ctx.render('fans', {
        title: '粉丝列表',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : '',
        nav: 'blog',
        userData: {
            userInfo: curUserInfo,
            isMe,
            fansData: {
                count: fansCount,
                list: fansList
            }
        }
    })
});

router.get('/followers/:userName', async (ctx, next) => {
    // 已登录用户的信息
    let userInfo = ctx.session.userInfo;
    if (!userInfo) {
        ctx.redirect('/users/login');
        return false;
    }
    let userName = ctx.session.userInfo.name;

    let curUserInfo;
    const { userName: curUserName } = ctx.params;
    const isMe = userName === curUserName;
    if (isMe) {
        // 是当前登录用户
        curUserInfo = userInfo;
    } else {
        // 不是当前登录用户
        const existResult = await isExist(curUserName);
        if (!existResult) {
            // 用户名不存在
            ctx.body = {
                code: -1,
                msg: '用户不存在'
            };
            return false;
        }
        console.log('existResult', existResult);
        // 用户存在
        curUserInfo = existResult;
    }

    // 获取关注人列表
    const followersResult = await getFollowersByUser(curUserInfo.id);
    const { count: followersCount, followersList } = followersResult;

    console.log('followersList', followersList);

    await ctx.render('followers', {
        title: '关注列表',
        userType: ctx.session.userInfo ? ctx.session.userInfo.type : '',
        nav: 'blog',
        userData: {
            userInfo: curUserInfo,
            isMe,
            followersData: {
                count: followersCount,
                list: followersList
            }
        }
    })
});
module.exports = router;
