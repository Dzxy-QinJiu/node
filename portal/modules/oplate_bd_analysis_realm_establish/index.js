/**
 * author:周连毅
 * 说明：统计分析-当前安全域-开通个数统计 react路由文件
 */
module.exports = {
    //页面路径
    path: 'establish',
    //实际渲染文件为public/index.js
    getComponent : function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'));
        });
    }
};