
var appAjaxTrans = require('MOD_DIR/common/public/ajax/app');
//根据线索的id获取线索详情
exports.getClueDetailById = function(clue_id) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue/detail/' + clue_id,
        dataType: 'json',
        type: 'get',
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};
