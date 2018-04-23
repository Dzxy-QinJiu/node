module.exports = {
    path: 'clue_customer',
    getComponent : function(location, cb) {
        require.ensure([], function(require){
            cb(null, require('./public'));
        });
    }
};