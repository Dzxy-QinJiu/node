
import {hasPrivilege} from 'CMP_DIR/privilege/checker';
import salesmanAjax from 'MOD_DIR/common/public/ajax/salesman';
import teamAjax from 'MOD_DIR/common/public/ajax/team';
import cluePrivilegeConst from 'MOD_DIR/clue_customer/public/privilege-const';

// 获取线索池列表
exports.getCluePoolList = (queryObj) => {
    let pageSize = queryObj.pageSize;
    delete queryObj.pageSize;
    let sorter = queryObj.sorter ? queryObj.sorter : {field: 'source_time', order: 'descend'};
    delete queryObj.sorter;
    let type = 'user';
    if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_POOL_ALL)) {
        type = 'manager';
    }
    let url = '/rest/clue_pool/fulltext/' + pageSize + '/' + sorter.field + '/' + sorter.order + '/' + type;
    let Deferred = $.Deferred();
    $.ajax({
        url: url ,
        dataType: 'json',
        type: 'post',
        data: queryObj,
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (errorMsg) => {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取线索池负责人
exports.getCluePoolLeading = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue_pool/leading',
        dataType: 'json',
        type: 'post',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取线索池来源
exports.getCluePoolSource = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue_pool/source',
        dataType: 'json',
        type: 'post',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取线索池接入渠道
exports.getCluePoolChannel = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue_pool/channel',
        dataType: 'json',
        type: 'post',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取线索池分类
exports.getCluePoolClassify = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue_pool/classify',
        dataType: 'json',
        type: 'post',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取线索池地域
exports.getCluePoolProvince = () => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue_pool/province',
        dataType: 'json',
        type: 'post',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 单个提取线索
exports.extractClueAssignToSale = (reqData) => {
    let id = reqData.id;
    let sale_id = reqData.sale_id;
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue_pool/single/assign/sales/' + id + '/' + sale_id,
        dataType: 'json',
        type: 'post',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 批量提取线索
exports.batchExtractClueAssignToSale = (reqData) => {
    let type = 'self';
    if (hasPrivilege(cluePrivilegeConst.CURTAO_CRM_LEAD_POOL_ALL)) {
        type = 'all';
    }
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue_pool/batch/assign/sales/' + type,
        dataType: 'json',
        type: 'post',
        data: reqData,
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (xhr) => {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

// 获取销售人员列表
exports.getSalesManList = function() {
    let Deferred = $.Deferred();
    salesmanAjax.getSalesmanListAjax().sendRequest({filter_manager: true})
        .success(list => {
            Deferred.resolve(list);
        }).error((xhr) => {//xhr:XMLHttpRequest
            Deferred.reject(xhr.responseJSON);
        });
    return Deferred.promise();
};

//获取某销售团队成员列表
let salesTeamMembersAjax;
exports.getSalesTeamMembers = (teamId) => {
    salesTeamMembersAjax && salesTeamMembersAjax.abort();
    let Deferred = $.Deferred();
    salesTeamMembersAjax = teamAjax.getMemberListByTeamIdAjax().resolvePath({
        group_id: teamId
    }).sendRequest({
        filter_manager: true//过滤掉舆情秘书
    }).success( (list) => {
        Deferred.resolve(list);
    }).error( (xhr, statusText) => {
        if (statusText !== 'abort') {
            Deferred.reject(xhr.responseJSON);
        }
    });
    return Deferred.promise();
};

//根据线索的id获取线索详情
exports.getClueDetailById = (clueId) => {
    let Deferred = $.Deferred();
    $.ajax({
        url: '/rest/clue_pool/clue/detail/' + clueId,
        dataType: 'json',
        type: 'get',
        success: (list) => {
            Deferred.resolve(list);
        },
        error: (errorMsg) => {
            Deferred.reject(errorMsg.responseJSON);
        }
    });
    return Deferred.promise();
};