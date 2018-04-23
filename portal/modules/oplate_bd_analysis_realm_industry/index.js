/**
 * author:周连毅
 * 说明：统计分析-当前安全域-行业分析 react路由文件
 */
module.exports = {
    path: 'industry',
    getComponent : function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'));
        });
    }
};