import {hasPrivilege} from 'CMP_DIR/privilege/checker';
//根据线索的id获取线索详情
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';
exports.getClueDetailById = function(leadId) {
    var type = 'user';
    if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_QUERY_ALL)){
        type = 'manager';
    }
    var url = '/rest/clue/detail/belongTome/1/source_time/descend/' + type;
    var Deferred = $.Deferred();
    var queryObj = {
        bodyParam: {
            rang_params: [{//时间范围参数
                from: moment('2010-01-01 00:00:00').valueOf(),//开始时间设置为2010年
                to: moment().valueOf(),
                type: 'time',
                name: 'source_time'
            }],
            query: {
                id: leadId
            },

        },
    };
    $.ajax({
        url: url ,
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: function(list) {
            Deferred.resolve(list);
        },
        error: function(errorMsg) {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};