const router = require('koa-router')();

router.prefix('/api/utils');

const path = require('path');
const koaForm = require('formidable-upload-koa');
const fse = require('fs-extra');
const MAX_SIZE = 1024 * 1024  * 1024;
// 存储目录
const DIST_FOLDER_PATH = path.join(__dirname, '..', '..', 'uploadFiles');

// 上传图片
router.post('/upload', koaForm(), async (ctx, next) => {
    let user = ctx.session.userInfo;
    const file = ctx.req.files['file'];
    console.log('file', file);
    if (!file) {
        return false;
    }
    /*
        size 文件大小
        filePath 文件路径
        name 文件名
        type 文件类型
    */
    const { size, path: filePath, name, type } = file;
    if (!user) {
        ctx.body = {
            code: -1,
            msg: '未登录'
        };
        return false;
    }
    if (size > MAX_SIZE) {
        await fse.remove(filePath);
        ctx.body = {
            code: -1,
            msg: '上传图片失败'
        };
        return false;
    }

    // 移动文件
    const fileName = Date.now() + '_' + name; // 防止重名
    const distFilePath = path.join(DIST_FOLDER_PATH, fileName); // 目的地
    await fse.move(filePath, distFilePath);


    // 返回信息
    ctx.body = {
        errno: 0,
        msg: '上传图片成功',
        data: {
            url: '/' + fileName
        }
    }
});

module.exports = router;
