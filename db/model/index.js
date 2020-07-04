/*
 * @description 入口文件
 */
const User = require('./User');
const Word = require('./Translate');
const News = require('./News');
const Collect = require('./Collect');
const Download = require('./Download');
const Question = require('./Question');
const Teach = require('./Teach');
// blog相关
const Blog = require('./Blog');
const UserRelation = require('./UserRelation');
const AtRelation = require('./AtRelation');

// 创建外键
News.belongsTo(User, {
    foreignKey: 'uid'
});
Collect.belongsTo(News, {
    foreignKey: 'newsId'
});
Collect.belongsTo(User, {
    foreignKey: 'userId'
});
Download.belongsTo(Teach, {
    foreignKey: 'teachId'
});
Download.belongsTo(User, {
    foreignKey: 'userId'
});
Teach.belongsTo(User, {
    foreignKey: 'userId',
    targetKey: 'id'
});
Question.belongsTo(Teach, {
    foreignKey: 'tid',
    targetKey: 'id'
});
Teach.hasMany(Question, {
    foreignKey: 'tid'
});

// Blog相关
Blog.belongsTo(User, {
    foreignKey: 'userId'
});

UserRelation.belongsTo(User, {
    foreignKey: 'followerId'
});

User.hasMany(UserRelation, {
    foreignKey: 'userId'
});

Blog.belongsTo(UserRelation, {
    foreignKey: 'userId',
    targetKey: 'followerId'
});

Blog.hasMany(AtRelation, {
    foreignKey: 'blogId'
});

module.exports = {
    User,
    Word,
    News,
    Collect,
    Download,
    Question,
    Teach,
    Blog,
    UserRelation,
    AtRelation
};
