module.exports = {
    path: 'call_record',
    getComponent: function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public')); 
        });
    }
};
