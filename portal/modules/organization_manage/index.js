/**
 * Created by wangliping on 2016/10/18.
 */
module.exports = function (path) {
    return {
        path: path,
        getComponent: function (location, cb) {
            require.ensure([], function (require) {
                cb(null, require('./public'))
            })
        }
    };
};