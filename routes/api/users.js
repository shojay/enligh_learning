const router = require('koa-router')();
const md5 = require('md5');
const Sequelize = require('sequelize');
const { dateFormat, getPages } = require('../../config/com');
const { getFollowersByUser, follow } = require('../../controller/user-relation');
const { User, News, Collect, Download, Teach } = require('../../db/model/index');
let accountPattern = /^1[34578]\d{9}$/;
let passwordPattern = /^(\w){6,18}$/;
let emailPattern = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;

router.prefix('/api');

router.post('/register', async (ctx, next) => {
    let { account, password, email, name } = ctx.request.body;
    if (!account || !password || !email || !name) {
        layer.msg('请填写完整后再提交');
        return false;
    }
    if (!accountPattern.test(account)) {
        layer.msg("您输入的手机号有误，请重新输入");
        return false;
    }
    if (!passwordPattern.test(password)) {
        layer.msg("密码格式错误！（请输入6-18位字母、数字、下划线组成的字符串）");
        return false;
    }
    if (!emailPattern.test(email)) {
        layer.msg('邮箱格式错误!');
        return false;
    }
    password = md5(password);
    let date = new Date();
    let id = Date.now() + account; // 用户id
    let createTime = dateFormat(date, 'yyyy-MM-dd hh:mm:ss');

    // register
    let userInfo;
    const result = await User.findOne({
        attributes: ['id', 'account', 'email', 'name'],
        where: { account }
    });
    if (result === null) {
        userInfo = result
    } else {
        userInfo = result.dataValues;
    }
    console.log(result);
    // 判断是否存在用户
    if (userInfo) {
        ctx.body = {
            code: -1,
            msg: '此账号已经注册'
        };
        return false;
    } else {
        // 可以注册
        try {
            await User.create({
                id,
                name,
                password,
                account,
                phone: account,
                picture: '/images/avatar.png',
                email,
                type: 1,
                status: 1
            });
           // 自己关注自己（为了方便首页获取数据）
            await follow(id, id);
            ctx.body = {
                code: 0,
                msg: '注册成功'
            }
        } catch (e) {
            console.log(e);
            ctx.body = {
                code: -1,
                msg: e
            }
        }
    }
});

router.post('/login', async (ctx, next) => {
    let { account, password } = ctx.request.body;
    if (!account || !password) {
        ctx.body = {
            code: -1,
            msg: '用户名或密码不能为空'
        };
        return false;
    }
    if (account.indexOf('admin') === -1 && !accountPattern.test(account) ) {
        ctx.body = {
            code: -1,
            msg: '您输入的手机号格式有误，请重新输入'
        };
        return false;
    }
    if (!passwordPattern.test(password)) {
        ctx.body = {
            code: -1,
            msg: '密码格式错误！（请输入6-18位字母、数字、下划线组成的字符串）'
        };
        return false;
    }
    let userInfo;
    password = md5(password);
    const result = await User.findOne({
        attributes: ['id', 'account', 'email', 'name', 'password', 'status', 'type', 'picture'],
        where: { account }
    });
    console.log(result);
    if (!result) {
        userInfo = result
    } else {
        userInfo = result.dataValues
    }
    // 用户存在
    if (userInfo) {
        if (userInfo.password !== password) {
            ctx.body = {
                code: -1,
                msg: '您输入的密码错误'
            };
            return false;
        } else {
            if (ctx.session.userInfo == null) {
                ctx.session.userInfo = userInfo
            }
            ctx.body = {
                code: 0,
                msg: '登录成功',
                userData: {
                    account: userInfo.account,
                    email: userInfo.email,
                    name: userInfo.name
                }
            }
        }
    } else {
        // 用户不存在，请注册
        ctx.body = {
            code: -1,
            msg: '用户不存在，请先注册'
        };
        return false;
    }
});

// 登出
router.post('/logout', async (ctx, next) =>{
    ctx.session.userInfo = null;
    ctx.cookies.set('userInfo', '', {
        expires: new Date('1970-11-11')
    });
    ctx.body = {
        code: 0,
        msg: '退出成功'
    }
});

// 获取用户信息
router.get('/getUser/:userId', async (ctx, next) => {
    let userInfo = ctx.session.userInfo;
    if(!userInfo) {
        ctx.redirect('/users/login');
        return false;
    }
    let user;
    let userId = ctx.params.userId || ctx.request.body.userId;
    // 收藏查询条件
    const collectWhere = {
        [Sequelize.Op.and]: [
            {
                userId
            },
            {
                status: 0
            }
        ]
    };
    // 下载查询条件
    const downloadWhere = {
        [Sequelize.Op.and]: [
            {
                userId
            },
            {
                status: 1
            }
        ]
    };
    console.log('getUser', userInfo);
    // 发现没登陆，isLogin传给前端，然后跳转到首页
    if (!userInfo) {
        ctx.body = {
            code: -1,
            isLogin: false
        };
        return false;
    }

    const result = await User.findOne({
        attributes: ['id', 'account', 'email', 'name', 'status', 'type', 'phone', 'picture', 'createdAt'],
        where: { id: userId }
    });
    if (result == null) {
        user = result
    } else {
        user = result.dataValues
    }
    if (user) {
        let downloadResult = await Download.findAndCountAll({
            attributes: [['id', 'did'], 'createdAt'],
            order: [
                ['createdAt', 'desc']
            ],
            where: downloadWhere,
            include: [
                {
                    model: Teach,
                    attributes: ['id', 'name', 'logo']
                }
            ]
        });
        let collectResult = await Collect.findAndCountAll({
            attributes: [['id', 'cid'], 'createdAt'],
            order: [
                ['createdAt', 'desc']
            ],
            where: collectWhere,
            include: [
                {
                    model: News,
                    attributes: ['id', 'title', 'filePath']
                }
            ]
        });
        downloadResult = downloadResult.rows.map(row => row.dataValues);
        collectResult = collectResult.rows.map(row => row.dataValues);
        user.download = downloadResult;
        user.collect = collectResult;
        console.log(user);
        ctx.body = {
            code: 0,
            msg: '获取用户信息成功',
            userData: user
        }
    } else {
        ctx.body = {
            code: -1,
            msg: '获取用户信息失败'
        }
    }
});

// 修改用户信息
router.post('/changeInfo', async (ctx, next) => {
    let { name, email, picture } = ctx.request.body;
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.body = {
            code: -1,
            msg: '未登录'
        };
        return false;
    }
    try {
        let result = await User.update({
            name,
            email,
            picture
        }, {
            where: {
                id: user.id
            }
        });
        // 修改成功
        if (result[0] > 0) {
            Object.assign(ctx.session.userInfo, {
                name,
                email,
                picture
            });
            ctx.body = {
                code: 0,
                msg: '修改个人信息成功'
            }
        } else {
            ctx.body = {
                code: -1,
                msg: '修改个人信息失败'
            }
        }

    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '修改信息错误:' + e
        }
    }
});

// 修改用户密码
router.post('/changePassword', async (ctx, next) => {
    let { password, newPassword } = ctx.request.body;
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.body = {
            code: -1,
            msg: '未登录'
        };
        return false;
    }
    try {
        let userResult = await User.findOne({
            where: {
                id: user.id
            }
        });
        if (md5(password) !== userResult.dataValues.password) {
            ctx.body = {
                code: -1,
                msg: '当前密码错误'
            }
            return false;
        }
        if (userResult.password === md5(newPassword)) {
            ctx.body = {
                code: -1,
                msg: '当前密码与修改密码一致'
            }
            return false;
        }
        let result = await User.update({
            password: md5(newPassword)
        }, {
            where: {
                id: user.id
            }
        });
        // 修改成功
        if (result[0] > 0) {
            ctx.body = {
                code: 0,
                msg: '修改密码成功'
            }
        } else {
            ctx.body = {
                code: -1,
                msg: '修改密码失败'
            }
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '错误:' + e
        }
    }
});

router.post('/users/search', async (ctx, next) => {
    let { keywordsName, keywordsAccount, pageSize, pageNow } = ctx.request.body;
    pageSize = pageSize - 0;
    pageNow = pageNow - 0;
    const whereOpt = {
        [Sequelize.Op.and]: [
            {
                name: {
                    [Sequelize.Op.like]: `%${keywordsName}%`
                }
            },
            {
                account: {
                    [Sequelize.Op.like]: `%${keywordsAccount}%`
                }
            }
        ]
    };
    try {
        let result = await User.findAndCountAll({
            attributes: ['id', 'name', 'account', 'phone', 'status', 'email', 'createdAt'],
            order: [
                ['createdAt', 'desc']
            ],
            limit: pageSize,
            offset: (pageNow - 1) * pageSize,
            where: whereOpt
        });
        const count = result.count;
        let totalPage = count % pageSize === 0 ? count / pageSize : count / pageSize + 1;
        let pages = getPages(pageNow, totalPage);
        if (!count) {
            ctx.body = {
                code: -1,
                msg: '没有数据'
            };
            return false;
        }
        result = result.rows.map(row => row.dataValues);
        ctx.body = {
            code: 0,
            msg: '查询成功',
            users: result,
            pages,
            pageNow,
            pageSize
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '操作失败,原因:' + e
        }
    }
});

router.get('/users/getUsers/:pageSize/:pageNow', async (ctx, next) => {
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login');
        return false;
    }
    let { pageSize, pageNow } = ctx.params;
    pageSize = pageSize - 0;
    pageNow = pageNow - 0;
    const usersResult = await User.findAndCountAll({});
    const usersCount = usersResult.count;
    if (!usersCount) {
        ctx.body = {
            code: -1,
            msg: '没有数据'
        };
        return false;
    }
    let totalPage = usersCount % pageSize === 0 ? usersCount / pageSize : usersCount / pageSize + 1;
    let pages = getPages(pageNow, totalPage);
    try {
        let result = await User.findAndCountAll({
            limit: pageSize,
            offset: (pageNow -1) * pageSize,
            order: [
                ['createdAt', 'desc']
            ],
            attributes: ['id', 'name', 'account', 'phone', 'status', 'createdAt', 'email', 'type']
        });
        result = result.rows.map(row => row.dataValues);
        result.map((item, index) => {
            return (item.createdAt = dateFormat(item.createdAt, 'yyyy-MM-dd hh:mm:ss'))
        });
        ctx.body = {
            code: 0,
            msg: '查询成功',
            users: result,
            pages
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '查询出现错误，原因：' + e
        }
    }
});

router.post('/users/deleteUser', async (ctx, next) => {
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login');
        return false;
    }
    let { id, idGroup } = ctx.request.body;
    console.log('idGroup', idGroup);
    if (id) {
        try {
            await User.destroy({
                where: {
                    id
                }
            });
            ctx.body = {
                code: 0,
                msg: '删除成功'
            };
        } catch (e) {
            ctx.body = {
                code: -1,
                msg: '删除失败,原因:' + e
            }
        }
    }
    if (idGroup) {
        idGroup = idGroup.split(',');
        console.log('idGroup_arr', idGroup);
        idGroup.map(async (item, index) => {
            try {
                await User.destroy({
                    where: {
                        id: item
                    }
                });
                ctx.body = {
                    code: 0,
                    msg: '批量删除成功'
                };
            } catch (e) {
                ctx.body = {
                    code: -1,
                    msg: '批量删除失败,原因：' + e
                }
            }
        })
    }
});

router.post('/users/editUser', async (ctx, next) => {
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login');
        return false;
    }
    let { account, password, name, phone, status, email, type } = ctx.request.body;
    // let date = new Date();
    if (password) {
        if (!passwordPattern.test(password)) {
            ctx.body = {
                code: -1,
                msg: '密码格式错误！（请输入6-18位字母、数字、下划线组成的字符串）'
            };
            return false;
        }
    }
    // let updateTime = dateFormat(date, 'yyyy-MM-dd hh:mm:ss');
    password = password ? md5(password) : '';
    try {
        await User.update({
            password: password ? String(password) : '',
            name,
            phone,
            status,
            email,
            type
        }, {
            where: {
                account
            }
        });
        ctx.body = {
            code: 0,
            msg: '修改成功'
        };
        return false;
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '修改失败,原因:' + e
        }
    }
});

router.post('/users/addUser', async (ctx, next) => {
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login');
        return false;
    }
    let { account, password, name, phone, status, email } = ctx.request.body;
    let id = Date.now() + account; // 用户id

    if (!account || !password) {
        ctx.body = {
            code: -1,
            msg: '用户名或密码不能为空'
        };
        return false;
    }
    if (!accountPattern.test(account)) {
        ctx.body = {
            code: -1,
            msg: '您输入的用户账号有误，请重新输入'
        };
        return false;
    }
    if (!passwordPattern.test(password)) {
        ctx.body = {
            code: -1,
            msg: '密码格式错误！（请输入6-18位字母、数字、下划线组成的字符串）'
        };
        return false;
    }
    if (!emailPattern.test(email)) {
        ctx.body = {
            code: -1,
            msg: '邮箱格式错误!'
        };
        return false;
    }
    password = md5(password);
    let result = await User.findOne({
        attributes: ['id'],
        where: { account }
    });
    console.log(result);
    // 判断是否存在用户
    if (result) {
        ctx.body = {
            code: -1,
            msg: '此账号已经被注册'
        };
        return false;
    } else {
        // 可以注册
        try {
            await User.create({
                id,
                name,
                password,
                account,
                phone,
                picture: '',
                email,
                type: 1,
                status: 1
            });
            ctx.body = {
                code: 0,
                msg: '注册成功'
            }
        } catch (e) {
            ctx.body = {
                code: -1,
                msg: '注册失败，原因：' + e
            }
        }
    }
});

router.post('/deleteDownload', async (ctx, next) => {
    const { id } = ctx.request.body;
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login');
        ctx.body = {
            code: -1,
            msg: '未登录'
        };
        return false;
    }
    if (!id) {
        ctx.body = {
            code: -1,
            msg: '未找到当前下载资料'
        };
        return false;
    }
    try {
        await Download.destroy({
            where: {
                id
            }
        });
        ctx.body = {
            code: 0,
            msg: '删除成功'
        };
        return false;
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '删除失败,失败原因: ' + e
        }
    }
});

// 获取at列表，即关注人列表
router.get('/user/getAtList', async (ctx, next) => {
    let user = ctx.session.userInfo;
    let userId = user.id;
    if (!user) {
        ctx.redirect('/users/login');
    }
    const result = await getFollowersByUser(userId);
    const { followersList } = result;
    ctx.body = followersList.map(user => {
        return `${user.name} - ${user.name}`
    })
});
module.exports = router
