exports.getSalesStageList = function () {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_stage_list',
        dataType: 'json',
        type: 'get',
        success: function (list) {
            Deferred.resolve(list);
        }
    });
    return Deferred.promise();
};

exports.addSalesStage = function (salesStage) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_stage',
        dataType: 'json',
        contentType: 'application/json',
        type: 'post',
        data: JSON.stringify(salesStage),
        success: function (salesStageCreated) {
            Deferred.resolve(salesStageCreated);
        }
    });
    return Deferred.promise();
};

exports.editSalesStage = function (salesStage) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_stage',
        contentType: 'application/json',
        dataType: 'json',
        type: 'put',
        data: JSON.stringify(salesStage),
        success: function (salesStageModified) {
            Deferred.resolve(salesStageModified);
        }
    });
    return Deferred.promise();
};

exports.deleteSalesStage = function (idsArray) {
    var Deferred = $.Deferred();
    $.ajax({
        url: '/rest/sales_stage',
        contentType: 'application/json',
        dataType: 'json',
        type: 'delete',
        data: JSON.stringify(idsArray),
        success: function () {
            Deferred.resolve();
        }
    });
    return Deferred.promise();
};
