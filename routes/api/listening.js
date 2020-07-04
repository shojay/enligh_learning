const router = require('koa-router')();
const Sequelize = require('sequelize');
const { Teach, Question, Download, User } = require('../../db/model/index');
const { getPages }  = require('../../config/com');

router.prefix('/api');

router.get('/listening/getPages', async (ctx, next) => {
    let { searchKey, pageSize, pageNow } = ctx.query;
    pageSize = pageSize - 0;
    pageNow = pageNow - 0;
    const pageFilter = searchKey ?
        {
            name: {
                [Sequelize.Op.like]: `%${searchKey}%`
            }
        }
        : {};
    const result = await Teach.findAndCountAll({
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

router.get('/getListenings', async (ctx, next) => {
    const { searchKey, pageSize, pageNow } = ctx.query;
    console.log(searchKey, pageSize, pageNow);

    const listeningFilter = searchKey ?
        {
            name: {
                [Sequelize.Op.like]: `%${searchKey}%`
            }
        } :
        {};
    try {
        let result = await Teach.findAndCountAll({
            limit: pageSize - 0,
            offset: pageSize * (pageNow - 1),
            order: [
                ['createdAt', 'desc']
            ],
            where: listeningFilter,
            include: [
                {
                    model: Question
                },
                {
                    model: User,
                    attributes: ['name']
                }
            ]
        });
        const count = result.count;
        console.log(result);
        if (!result) {
            ctx.body = {
                code: -1,
                msg: '数据为空'
            };
            return false;
        }
        result = result.rows.map(row => row.dataValues);
        ctx.body = {
            code: 0,
            msg: '获取成功',
            listenings: result,
            count
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '出现错误，错误原因: ' + e
        }
    }
});

router.post('/postQuestions', async (ctx, next) => {
    let userInfo = ctx.session.userInfo;
    const { title, alt, filePath, questions } = ctx.request.body;
    if (!userInfo) {
        ctx.redirect('/users/login');
        ctx.body = {
            code: -1,
            msg: '未登录'
        };
        return false;
    }
    let id = Date.now() + String(Math.random()).slice(2, 9) + 'L';
    if (!title || !filePath || !alt) {
        ctx.body = {
            code: -1,
            msg: '资料填写不完整'
        };
        return false;
    }
    // let values = [];
    // questions.map((item, index) => {
    //     values.push(
    //         `('${id}Q', '${id}', '${item.title}', '${item.option1}', '${item.option2}',
    //         '${item.option3}', '${item.option4}', '${item.option5}', '${item.answer}')`
    //     )
    // });
    // console.log(values);
    console.log('questions', Object.values(questions));
    let questionsArr = [];
    for (let key in questions) {
        if (questions.hasOwnProperty(key)) {
            questionsArr.push(questions[key])
        }
    }
    let questions_arr_object = questionsArr.map((item, index) => {
       return {
           id: id + String(Math.random()).slice(2, 8) +'Q',
           tid: id,
           userId: ctx.session.userInfo.id,
           title: item.title,
           option1: item.option1,
           option2: item.option2,
           option3: item.option3,
           option4: item.option4,
           option5: index,
           answer: item.answer
       }
    });
    console.log(questions_arr_object);
    try {
        // 插入Teach表
        await Teach.create({
            id,
            name: title,
            alt,
            logo: filePath,
            userId: userInfo.id,
            status: 1
        });
        try {
            // 插入数组对象到Question表
            await Question.bulkCreate(questions_arr_object, {
                ignoreDuplicates: true
            });
            ctx.body = {
                code: 0,
                msg: '发布成功'
            };
            return false;
        } catch (e) {
            ctx.body = {
                code: -1,
                msg: '题目添加出现错误: ' + e
            }
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '操作出现错误: ' + e
        }
    }
});

router.get('/getListeningDetail', async (ctx, next) => {
    const { listeningId } = ctx.query;
    console.log(listeningId);
    try {
        let result = await Teach.findAndCountAll({
            where: {
                id: listeningId
            },
            include: [
                {
                    model: Question,
                    order: ['option5','desc']
                },
                {
                    model: User,
                    attributes: ['name']
                }
            ]
        });
        if (!result) {
            ctx.body = {
                code: -1,
                msg: '数据为空'
            };
            return false;
        }
        result = result.rows.map(row => row.dataValues);
        console.log(result);
        ctx.body = {
            code: 0,
            msg: '查询成功',
            data: result[0]
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '操作错误，错误原因: ' + e
        }
    }
});

router.post('/listening/delete', async (ctx, next) => {
    const { id } = ctx.request.body;
    console.log(id);
    try {
        await Teach.destroy({
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
            msg: e
        }
    }
});

router.post('/listening/collect', async (ctx, next) => {
    const { listeningId, path } = ctx.request.body;
    const userId = ctx.session.userInfo.id;

    if (!listeningId) {
        ctx.body = {
            code: -1,
            msg: '未能查到当前资料'
        };
        return false;
    }
    if (!userId) {
        ctx.redirect('/users/login');
        ctx.body = {
            code: -1,
            msg: '未登录'
        };
        return false;
    }
    try {
        await Download.create({
            userId,
            teachId: listeningId,
            status: 1,
            path
        });
        ctx.body = {
            code: 0,
            msg: '正在下载...请稍等'
        }
    } catch (e) {
        ctx.body = {
            code: -1,
            msg: '操作错误，错误原因:' + e
        }
    }
});

module.exports = router;
