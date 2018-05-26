/**
 * author:周连毅
 * 说明：统计分析-当前安全域-地域分析 react路由文件
 */
module.exports = {
    //路由路径
    path: 'zone',
    //实际业务逻辑在public/index.js中
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'));
        });
    }
};