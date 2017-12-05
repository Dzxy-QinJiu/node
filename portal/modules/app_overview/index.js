module.exports = {
    path: 'app_overview',
    getComponent : function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'))
        })
    }
};