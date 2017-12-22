module.exports = {
    path: 'notification_system',
    getComponent: function (location, cb) {
        require.ensure([], function (require) {
            cb(null, require('./public'))
        })
    }
};