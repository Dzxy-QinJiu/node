/**
 * Created by zhoulianyi on  2016/5/29 15:41.
 */
module.exports = {
    path: 'list',
    getComponent : function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'))
        })
    }
};

