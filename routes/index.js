const router = require('koa-router')();
const multer = require('koa-multer');
const path = require('path');
const { getAtRelationCount } = require("../controller/blog-at");
let filePath = '';
let storage = multer.diskStorage({
  destination: path.join(
      path.resolve(__dirname + '/../public'),
      '/upload/files'
  ),
  filename(ctx, file, callback) {
    let extendName = file.originalname.substr(
        file.originalname.lastIndexOf('.')
    );
    let namespace = [
      ".pdf", ".doc", ".docx", ".tar.gz", ".tgz", ".zip", ".xlsx", ".xlt", ".xlt", ".xlc", ".xls", ".mp3", ".mp4", ".f4v", ".flv", ".ogv", ".webm", ".wma", ".rm", ".wav", ".midi", ".ape", ".fla"
    ];
    if (namespace.indexOf(extendName) === -1) {
      callback(new Error("目前仅支持.pdf, .doc, .docx, .tar.gz, .tgz, .zip,.xlsx, .xlt, .xlt, .xlc, .xls,mp3,mp4,f4v,flv,ogv,webm,wma,rm,wav,midi,ape,fla格式文件上传"));
      return false;
    }
    let newFilename = Date.now() + '-' + String(Math.random()).slice(2, 10) + '-' + file.originalname;
    filePath = '/upload/files/' + newFilename;
    callback(null, newFilename);
  }
});
let upload = multer({ storage });

router.get('/', async (ctx, next) => {
  let user = ctx.session.userInfo ? ctx.session.userInfo : '';
  console.log(user);
  let userInfo = {
    id: user.id,
    name: user.name
  };
  console.log(userInfo);
  ctx.cookies.set('userInfo', JSON.stringify(userInfo), {
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    overwrite: false,
    maxAge: 7 * 60 * 24 * 1000
  });
  await ctx.render('index', {
    title: '英语学习网',
    nav: 'index',
    userType: ctx.session.userInfo ? ctx.session.userInfo.type : ''
  })
});


// 上传文件
router.post('/uploadFile', upload.single('file'), async (ctx, next) => {
  let userInfo = ctx.session.userInfo ? ctx.session.userInfo : '';
  if (!userInfo) {
    ctx.body = {
      code: -1,
      msg: '未登录'
    };
    return false;
  }
  console.log('filePath:', filePath);
  if (ctx.req.file) {
    ctx.body = {
      code: 0,
      msg: '上传成功',
      filePath
    }
  } else {
    ctx.body = {
      code: -1,
      msg: '上传失败'
    }
  }
});

// at我的数量接口
// router.get('/api/atMeCount', async (ctx, next) => {
//   const { id: userId } = ctx.session.userInfo;
//
//   // 获取@数量
//   const atCountResult = await getAtRelationCount(userId);
//   const { count: atCount } = atCountResult;
//
//   ctx.body = {
//     code: 0,
//     msg: '获取成功',
//     count: atCount
//   }
// });


module.exports = router
