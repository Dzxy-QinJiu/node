/**
 * Created by xiaojinfeng on 2016/04/08.
 */
module.exports = {
    path: 'sales_team',
    getComponent: function (location, cb) {
        require.ensure([], function (require) {
            cb(null, require('./public'))
        })
    }
};
