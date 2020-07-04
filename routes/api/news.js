const router= require('koa-router')();
const Sequelize = require('sequelize');
const { News, User, Collect } = require('../../db/model/index');
const { getPages }  = require('../../config/com');

const multer = require('koa-multer');
const path = require('path');

router.prefix('/api');

let imgPath = '';
let storage = multer.diskStorage({
    destination: path.join(
        path.resolve(__dirname + '/../../public'),
        '/upload/news-logo'
    ),
    filename: function(ctx, file, callback) {
        let extendName = file.originalname.substr(
            file.originalname.lastIndexOf('.')
        );
        let namespace = [
            ".jpg",
            ".jpeg",
            ".gif",
            ".png",
            ".webp",
            ".mp3",
            ".mp4",
            ".f4v",
            ".flv",
            ".ogv",
            ".webm",
            ".wma",
            ".rm",
            ".wav",
            ".midi",
            ".ape",
            ".fla"
        ];
        if (namespace.indexOf(extendName) == -1) {
            callback(new Error('上传格式错误'));
            return false;
        }
        let newFileName = Date.now() + '-' + String(Math.random()).slice(2, 10) + '-' + file.originalname;
        imgPath = '/upload/news-logo/' + newFileName;
        callback(null, newFileName);
    }
});
let upload = multer({ storage: storage });


// 提交资料
router.post('/postNews', async (ctx, next) => {
    let { userId, title, tags, substract, content, imgPath, filePath, fileName } = ctx.request.body;
    console.log(fileName, filePath);

    let createTime = new Date();
    let id = Date.now() + String(Math.random()).slice(2, 10);

    try {
        await News.create({
            id,
            title,
            uid: userId,
            tags,
            substract,
            content,
            imgPath,
            filePath: filePath ? filePath.join(',') : '',
            fileName: fileName ? fileName.join(',') : ''
        });
        ctx.body = {
            code: 0,
            msg: '发布成功'
        }
    } catch (e) {
        console.log(e);
        ctx.body = {
            code: -1,
            msg: e
        }
    }
});

// 上传图片
router.post('/uploadImg', upload.single('file'), async (ctx, next) => {
    let userInfo = ctx.session.userInfo;
    if (!userInfo) {
        ctx.body = {
            code: -1,
            msg: '未登录'
        };
        return false;
    }
    console.log('imgPath: ', imgPath);
    console.log('fileName: ', ctx.req.file.filename);
    if (ctx.req.file) {
        ctx.body = {
            code: 0,
            msg: '上传成功',
            imgPath
        }
    } else {
        ctx.body = {
            code: -1,
            msg: '上传失败'
        }
    }
});

router.get('/getNews', async (ctx, next) => {
    const { searchKey, pageSize, pageNow } = ctx.query;
    console.log(searchKey, pageSize, pageNow);

    // 判断搜索框是否有输入关键词
    const newsFilter = searchKey ?
        {
            [Sequelize.Op.or]: [
                {
                    [Sequelize.Op.and]: [
                        {
                            status: 1
                        },
                        {
                            title: {
                                [Sequelize.Op.like]: `%${searchKey}%`
                            }
                        }
                    ]
                },
                {
                    tags: {
                        [Sequelize.Op.like]: `%${searchKey}%`
                    }
                },
                {
                    substract: {
                        [Sequelize.Op.like]: `%${searchKey}%`
                    }
                }
            ]
        } :
        {
            status: 1
        };
    // 执行联表查询
    const result = await News.findAndCountAll({
        limit: pageSize - 0,
        offset: pageSize * (pageNow - 1),
        order: [
            ['createdAt', 'desc']
        ],
        where: newsFilter,
        include: [
            {
                model: User,
                attributes: ['name'],
            }
        ]
    });
    if (!result) {
        ctx.body = {
            code: -1,
            msg: '数据为空'
        }
    } else {
        let newsList = result.rows.map(row => row.dataValues);
        ctx.body = {
            code: 0,
            msg: '获取成功',
            news: newsList
        }
    }
});

router.get('/getPages', async (ctx, next) => {
    let { searchKey, pageSize, pageNow } = ctx.query;
    console.log('getPages:');
    pageSize = pageSize - 0;
    pageNow = pageNow - 0;
    const pageFilter = searchKey ?
        {
            [Sequelize.Op.and]: [
                {
                    status: 1
                },
                {
                    title: {
                        [Sequelize.Op.like]: `%${searchKey}%`
                    }
                }
            ]
        }:
        {
            status: 1
        };
    const result = await News.findAndCountAll({
        where: pageFilter
    });
    if (!result) {
        ctx.body = {
            code: -1,
            msg: '数据为空'
        };
    } else {
        let totalCount = result.count;
        let maxPage =
            totalCount % pageSize === 0 ?
                totalCount / pageSize :
                totalCount / pageSize + 1;
        let pages = getPages(pageNow, maxPage);
        ctx.body = {
            code: 0,
            msg: '分页成功',
            pages,
            pageNow
        }
    }
});

router.get('/getNewsDetail', async (ctx, next) => {
    let { newsId } = ctx.query;
    if (!newsId) {
        ctx.body = {
            code: -1,
            msg: '数据不存在'
        };
        return false;
    }
    const whereOpt = {
        [Sequelize.Op.and]: [
            {
                status: 1
            },
            {
                id: newsId
            }
        ]
    };
    const result = await News.findAndCountAll({
        where: whereOpt,
        include: [
            {
                model: User,
                attributes: ['name', 'account', 'status']
            }
        ]
    });
    if(!result) {
        ctx.body= {
            code: -1,
            msg: '数据为空'
        };
        return false;
    } else {
        let newsDetail = result.rows.map(row => row.dataValues);
        ctx.body = {
            code: 0,
            msg: '获取成功',
            newsDetail: newsDetail[0]
        }
    }
});

// 收藏接口
router.post('/collect', async (ctx, next) => {
    const { newsId } = ctx.request.body;
    const userId = ctx.session.userInfo ? ctx.session.userInfo.id : '';

    let status = ctx.request.body.status - 0;
    if (!newsId) {
        ctx.body = {
            code: -1,
            msg: '未能查询到相关资料'
        };
        return false;
    }


    const whereOpt = {
        [Sequelize.Op.and]: [
            {
                userId: userId
            },
            {
                newsId: newsId
            }
        ]
    };

    const result = await Collect.findOne({
        where: whereOpt
    });
    if (!result) {
        try {
            await Collect.create({
                userId,
                newsId,
                status
            });
            ctx.body = {
                code: 0,
                msg: '收藏成功'
            }
        } catch (e) {
            ctx.body = {
                code: -1,
                msg: e
            }
        }
        return false;
    } else {
        try {
            // 更新News表的status
            // await News.update({ status }, {
            //     where: {
            //         [Sequelize.Op.and]: [
            //             {
            //                 id: newsId
            //             },
            //             {
            //                 uid: userId
            //             }
            //         ]
            //     }
            // });
            // 更新Collect表的status
            await Collect.update({ status }, {
                where: whereOpt
            });
            ctx.body = {
                code: 0,
                msg: status === 0 ? '收藏成功' : '已取消'
            }
        } catch (e) {
            ctx.body = {
                code: -1,
                msg: '更新失败' + e
            }
        }
        return false;
    }
});

router.get('/isCollect', async (ctx, next) => {
    const { newsId } = ctx.query;
    const userId = ctx.session.userInfo ? ctx.session.userInfo.id : '';
    console.log('userId:', userId, 'newsId:', newsId);
    const whereOpt = {
        [Sequelize.Op.and]: [
            {
                userId: userId
            },
            {
                newsId: newsId
            }
        ]
    };
    try {
        const result = await Collect.findOne({
            where: whereOpt
        });
        // console.log(result);
        if (!result) {
            ctx.body = {
                code: -1,
                msg: '暂时无收藏'
            };
        } else {
            ctx.body = {
                code: 0,
                msg: '成功',
                data: result.dataValues ? (result.dataValues.status == 1 ? 1 : 0) : 0
            }
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '获取信息失败:' + e
        }
    }
});

// 个人中心取消收藏
router.post('/unCollect', async (ctx, next) => {
    const { id } = ctx.request.body;
    const user = ctx.session.userInfo ? ctx.session.userInfo : '';
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
            msg: '系统繁忙，请联系管理员'
        };
        return false;
    }
    try {
        await Collect.update({ status: 1 }, {
            where: {
                [Sequelize.Op.and]: [
                    {
                        userId: user.id
                    },
                    {
                        id
                    }
                ]
            }
        });
        ctx.body = {
            code: 0,
            msg: '取消收藏成功'
        };
        return false;
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '取消收藏失败: ' + e
        }
    }
});

// 编辑资料
router.post('/news/editNews', async (ctx, next) => {
    let userInfo = ctx.session.userInfo;
    if(!userInfo) {
        ctx.redirect('/users/login');
        return false;
    }
    let { id, title, tags, substract, content } = ctx.request.body;
    if (id) {
        try{
            await News.update({
                title,
                substract,
                content,
                tags
            }, {
                where: {
                    id
                }
            });
            ctx.body = {
                code: 0,
                msg: '修改成功'
            }
        } catch (e) {
            ctx.body = {
                code: -1,
                msg: '编辑失败，原因：' + e
            }
        }
    }
});

router.post('/news/deleteNews', async (ctx, next) => {
    let user = ctx.session.userInfo;
    if (!user) {
        ctx.redirect('/users/login');
        return false;
    }
    let { id, idGroup } = ctx.request.body;
    if (id) {
        try {
            await News.destroy({
                where: {
                    id
                }
            });
            ctx.body = {
                code: 0,
                msg: '删除成功'
            }
        } catch (e) {
            ctx.body = {
                code: -1,
                msg: '删除失败，原因：' + e
            }
        }
    }
    if (idGroup) {
        idGroup = idGroup.split(',');
        idGroup.map(async (item, index) => {
            console.log(item);
            try {
                await News.destroy({
                    where: {
                        id: item
                    }
                });
                ctx.body = {
                    code: 0,
                    msg: '批量删除成功'
                }
            } catch (e) {
                ctx.body = {
                    code: -1,
                    msg: '批量删除失败，原因：' + e
                }
            }
        })
    }
});
module.exports = router;
