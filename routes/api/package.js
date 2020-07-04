const router = require('koa-router')();
const fs = require('fs');
const archiver = require('archiver');
const md5 = require('md5');

router.prefix('/api');

const path = __dirname;
let dirList = fs.readdirSync(path);
let status = true;

router.post('/packageZip', async (ctx, next) => {
    const { dirList } = ctx.request.body;
    console.log(dirList);
    let fileName = md5(dirList.join() + Date.now()).substr(0, 18);
    let output = fs.createWriteStream(
        __dirname + '/../../public/download/' + fileName + '.zip'
    );
    let archive = archiver('zip', {
        zlib: { level: 9 }
    });

    output.on('close', function () {
        console.log(archive.pointer() + 'total bytes');
        console.log("archiver has been finalized and the output file descriptor has closed.")
    });

    output.on('end', function() {
        console.log('Data has been drained');
    });

    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            console.log(err);
            // log warning
            ctx.body = {
                code: -1,
                msg: '当前网络可能存在问题，暂时无法打包'
            };
            return false;
        } else {
            // throw error
            console.log(err);
            ctx.body = {
                code: -1,
                msg: '由于网络原因，打包失败'
            };
            return false;
        }
    });

    archive.on('error', function(err) {
        console.log(err);
        ctx.body = {
            code: -1,
            msg: '由于网络原因，打包失败'
        };
        return false;
    });

    archive.pipe(output);

    dirList.forEach((item, index) => {
        archive.append(fs.createReadStream(__dirname + '/../../public/' + item), {
            name: Date.now() + index + item.substr(item.lastIndexOf('-') + 1)
        });
    });

    archive.finalize();

    ctx.body = {
        code: 0,
        msg: '打包成功，等待下载',
        data: {
            packagePath: '/download/' + fileName + '.zip'
        }
    };
});

module.exports = router;
