const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const koaStatic = require('koa-static')
const path = require('path')

const { REDIS_CONF } = require('./config/db')
const { SESSION_KEY } = require('./config/key')


const index = require('./routes/index')
const usersApiRouter = require('./routes/api/users')
const translateApiRouter = require('./routes/api/translate')
const newsApiRouter = require('./routes/api/news')
const packageApiRouter= require('./routes/api/package')
const listeningApiRouter = require('./routes/api/listening')
const utilsApiRouter = require('./routes/api/utils')
const blogProfileApiRouter = require('./routes/api/blog-profile')

const usersViewRouter = require('./routes/view/users')
const translateViewRouter = require('./routes/view/translate')
const newsViewRouter = require('./routes/view/news')
const listeningViewRouter = require('./routes/view/listening')
const blogViewRouter = require('./routes/view/blog')
const blogApiRouter = require('./routes/api/blog')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
// app.use(logger())
app.use(koaStatic(__dirname + '/public'))
app.use(koaStatic(path.join(__dirname, 'uploadFiles')))

app.use(views(__dirname + '/views', {
  map: { html: 'ejs' } // 将views目录下的页面文件后缀映射为html
}))

// session
app.keys = [SESSION_KEY]
app.use(session({
  key: 'english.sid', // cookie name 默认是koa.sid
  prefix: 'english:sess:', // redis key的前缀 默认是koa:sess:
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000
  },
  store: redisStore({
    all: `${REDIS_CONF.host}:${REDIS_CONF.port}`
  })
}))

// logger
// app.use(async (ctx, next) => {
//   const start = new Date()
//   await next()
//   const ms = new Date() - start
//   console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
// })

// routes
app.use(index.routes(), index.allowedMethods())
app.use(usersApiRouter.routes(), usersApiRouter.allowedMethods())
app.use(usersViewRouter.routes(), usersViewRouter.allowedMethods())
app.use(translateApiRouter.routes(), translateApiRouter.allowedMethods())
app.use(translateViewRouter.routes(), translateViewRouter.allowedMethods())
app.use(newsApiRouter.routes(), newsApiRouter.allowedMethods())
app.use(newsViewRouter.routes(), newsViewRouter.allowedMethods())
app.use(packageApiRouter.routes(), packageApiRouter.allowedMethods())
app.use(listeningApiRouter.routes(), listeningApiRouter.allowedMethods())
app.use(listeningViewRouter.routes(), listeningViewRouter.allowedMethods())
app.use(utilsApiRouter.routes(), utilsApiRouter.allowedMethods())
app.use(blogViewRouter.routes(), blogViewRouter.allowedMethods())
app.use(blogApiRouter.routes(), blogApiRouter.allowedMethods())
app.use(blogProfileApiRouter.routes(), blogProfileApiRouter.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
