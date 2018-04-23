module.exports = {
    path: 'crm',
    getComponent : function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public')); 
        });
    }
};
