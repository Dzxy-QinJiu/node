module.exports = {
    path: 'user',
    getComponent : function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public')) 
        })
    }
};